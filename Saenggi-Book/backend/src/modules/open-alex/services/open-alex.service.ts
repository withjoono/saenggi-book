import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Neo4jService } from 'src/database/neo4j/neo4j.service';
import { TranslationService } from './translation.service';
import { ConceptSearchDto } from '../dtos/open-alex-query.dto';

const BASE_URL = 'https://api.openalex.org';
const POLITE_EMAIL = 'withjoono@gmail.com';

interface HierarchyNode { id: string; display_name: string; }

interface OpenAlexTopic {
  id: string;
  display_name: string;
  description: string | null;
  keywords: string[];
  works_count: number;
  cited_by_count: number;
  domain: HierarchyNode;
  field: HierarchyNode;
  subfield: HierarchyNode;
  siblings: HierarchyNode[];
  wikipedia?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  labelEn?: string;
  type: 'domain' | 'field' | 'subfield' | 'topic' | 'sibling';
  worksCount?: number;
  description?: string | null;
  keywords?: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'hierarchy' | 'sibling';
}

@Injectable()
export class OpenAlexService {
  private readonly logger = new Logger(OpenAlexService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly neo4j: Neo4jService,
    private readonly translation: TranslationService,
  ) {}

  private shortId(fullId: string): string {
    return fullId.split('/').pop() ?? fullId;
  }

  // ── 번역 헬퍼 ────────────────────────────────────────────────────────────────

  /** 그래프 노드 레이블 전체를 한국어로 번역 */
  private async translateNodes(nodes: GraphNode[]): Promise<GraphNode[]> {
    const labels = nodes.map(n => n.label);
    const koLabels = await this.translation.toKorean(labels);
    return nodes.map((node, i) => ({
      ...node,
      labelEn: node.label,
      label: koLabels[i] || node.label,
    }));
  }

  // ── OpenAlex API ─────────────────────────────────────────────────────────────

  async searchConcepts(dto: ConceptSearchDto) {
    // 1. 한국어 쿼리 → 영어 번역
    const rawSearch = dto.search ?? '';
    const searchQuery = rawSearch ? await this.translation.toEnglish(rawSearch) : '';

    const params: Record<string, any> = {
      page: dto.page,
      per_page: dto.per_page ?? 25,
      mailto: POLITE_EMAIL,
    };
    if (searchQuery) params.search = searchQuery;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${BASE_URL}/topics`, { params }),
      );

      const results: OpenAlexTopic[] = data.results;

      // 2. 레이블 + 계층명 일괄 번역 (결과당 4개: label, domain, field, subfield)
      const textsToTranslate = results.flatMap(t => [
        t.display_name,
        t.domain?.display_name ?? '',
        t.field?.display_name ?? '',
        t.subfield?.display_name ?? '',
      ]);
      const translated = await this.translation.toKorean(textsToTranslate);

      return {
        total: data.meta.count,
        page: data.meta.page,
        perPage: data.meta.per_page,
        results: results.map((t, i) => {
          const base = i * 4;
          return {
            id: this.shortId(t.id),
            label: translated[base] || t.display_name,
            labelEn: t.display_name,
            worksCount: t.works_count,
            description: t.description,
            keywords: t.keywords?.slice(0, 5),
            domain: translated[base + 1] || t.domain?.display_name,
            field: translated[base + 2] || t.field?.display_name,
            subfield: translated[base + 3] || t.subfield?.display_name,
          };
        }),
      };
    } catch (error) {
      this.logger.error('OpenAlex topics 검색 실패', error.message);
      throw new HttpException('OpenAlex API 호출 실패', HttpStatus.BAD_GATEWAY);
    }
  }

  private async fetchTopicFromApi(topicId: string): Promise<OpenAlexTopic> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${BASE_URL}/topics/${topicId}`, {
        params: { mailto: POLITE_EMAIL },
      }),
    );
    return data as OpenAlexTopic;
  }

  // ─── Neo4j 저장 ─────────────────────────────────────────────────────────────

  async importTopicToNeo4j(topicId: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const t = await this.fetchTopicFromApi(topicId);
    const rootId = this.shortId(t.id);

    await this.neo4j.run(
      `
      MERGE (domain:Domain {id: $domainId}) SET domain.label = $domainLabel
      MERGE (field:Field {id: $fieldId})   SET field.label  = $fieldLabel
      MERGE (sub:Subfield {id: $subId})    SET sub.label    = $subLabel
      MERGE (topic:Topic {id: $topicId})
        SET topic.label       = $topicLabel,
            topic.description = $description,
            topic.keywords    = $keywords,
            topic.worksCount  = $worksCount
      MERGE (domain)-[:HAS_FIELD]->(field)
      MERGE (field)-[:HAS_SUBFIELD]->(sub)
      MERGE (sub)-[:HAS_TOPIC]->(topic)
      `,
      {
        domainId: this.shortId(t.domain.id),
        domainLabel: t.domain.display_name,
        fieldId: this.shortId(t.field.id),
        fieldLabel: t.field.display_name,
        subId: this.shortId(t.subfield.id),
        subLabel: t.subfield.display_name,
        topicId: rootId,
        topicLabel: t.display_name,
        description: t.description ?? '',
        keywords: t.keywords ?? [],
        worksCount: t.works_count,
      },
    );

    for (const sib of t.siblings.slice(0, 8)) {
      const sibId = this.shortId(sib.id);
      await this.neo4j.run(
        `
        MERGE (sib:Topic {id: $sibId}) SET sib.label = $sibLabel
        MERGE (sub:Subfield {id: $subId})
        MERGE (sub)-[:HAS_TOPIC]->(sib)
        WITH sib
        MATCH (topic:Topic {id: $topicId})
        MERGE (topic)-[:SIBLING_OF]->(sib)
        `,
        {
          sibId,
          sibLabel: sib.display_name,
          subId: this.shortId(t.subfield.id),
          topicId: rootId,
        },
      );
    }

    this.logger.log(`Neo4j 저장 완료: ${t.display_name}`);
    return this.getGraphFromNeo4j(rootId);
  }

  // ─── Neo4j 조회 ─────────────────────────────────────────────────────────────

  async getGraphFromNeo4j(topicId: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const result = await this.neo4j.run(
      `
      MATCH (topic:Topic {id: $topicId})
      OPTIONAL MATCH (sub:Subfield)-[:HAS_TOPIC]->(topic)
      OPTIONAL MATCH (field:Field)-[:HAS_SUBFIELD]->(sub)
      OPTIONAL MATCH (domain:Domain)-[:HAS_FIELD]->(field)
      OPTIONAL MATCH (sub)-[:HAS_TOPIC]->(sibling:Topic)
      RETURN topic, sub, field, domain, collect(DISTINCT sibling) AS siblings
      `,
      { topicId },
    );

    if (result.records.length === 0) return { nodes: [], edges: [] };

    const rec = result.records[0];
    const topic = rec.get('topic')?.properties;
    const sub = rec.get('sub')?.properties;
    const field = rec.get('field')?.properties;
    const domain = rec.get('domain')?.properties;
    const siblings: any[] = rec.get('siblings') ?? [];

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    const add = (node: GraphNode) => {
      if (!seen.has(node.id)) { seen.add(node.id); nodes.push(node); }
    };

    if (domain) add({ id: domain.id, label: domain.label, type: 'domain' });
    if (field) add({ id: field.id, label: field.label, type: 'field' });
    if (sub) add({ id: sub.id, label: sub.label, type: 'subfield' });
    if (topic) {
      add({
        id: topic.id, label: topic.label, type: 'topic',
        worksCount: topic.worksCount, description: topic.description,
        keywords: topic.keywords,
      });
    }

    if (domain && field) edges.push({ source: domain.id, target: field.id, type: 'hierarchy' });
    if (field && sub) edges.push({ source: field.id, target: sub.id, type: 'hierarchy' });
    if (sub && topic) edges.push({ source: sub.id, target: topic.id, type: 'hierarchy' });

    for (const sib of siblings) {
      const s = sib.properties;
      if (s.id === topic?.id) continue;
      add({ id: s.id, label: s.label, type: 'sibling' });
      if (sub) edges.push({ source: sub.id, target: s.id, type: 'hierarchy' });
      if (topic) edges.push({ source: topic.id, target: s.id, type: 'sibling' });
    }

    return { nodes, edges };
  }

  // ─── 통합: Neo4j 우선, 없으면 API → Neo4j 저장 ─────────────────────────────

  async getConceptGraph(topicId: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; source: string }> {
    let graph: { nodes: GraphNode[]; edges: GraphEdge[] } | null = null;
    let source = 'openalex';

    try {
      const cached = await this.getGraphFromNeo4j(topicId);
      if (cached.nodes.length > 0) {
        graph = cached;
        source = 'neo4j';
      }
    } catch { /* Neo4j 오프라인이면 API fallback */ }

    if (!graph) {
      try {
        graph = await this.importTopicToNeo4j(topicId);
        source = 'openalex';
      } catch {
        const t = await this.fetchTopicFromApi(topicId);
        graph = this.buildGraphFromTopic(t);
        source = 'openalex-only';
      }
    }

    // 노드 레이블 한국어 번역
    const translatedNodes = await this.translateNodes(graph.nodes);

    // 메인 토픽 설명: Wikipedia 한국어 우선, 없으면 영어 유지
    try {
      const t = await this.fetchTopicFromApi(topicId);
      if (t.wikipedia) {
        const wiki = await this.translation.getKoreanFromWikipedia(t.wikipedia);
        if (wiki) {
          const mainNode = translatedNodes.find(n => n.type === 'topic');
          if (mainNode) {
            mainNode.description = wiki.extract;
          }
        }
      }
    } catch { /* Wikipedia 실패 시 영어 설명 유지 */ }

    return { nodes: translatedNodes, edges: graph.edges, source };
  }

  async getConceptById(topicId: string) {
    const t = await this.fetchTopicFromApi(topicId);

    // 레이블 번역
    const [koLabel, koDomain, koField, koSubfield] = await this.translation.toKorean([
      t.display_name,
      t.domain?.display_name,
      t.field?.display_name,
      t.subfield?.display_name,
    ]);

    // 설명: Wikipedia 한국어 우선
    let description = t.description;
    if (t.wikipedia) {
      const wiki = await this.translation.getKoreanFromWikipedia(t.wikipedia);
      if (wiki) description = wiki.extract;
    }

    return {
      id: this.shortId(t.id),
      label: koLabel || t.display_name,
      labelEn: t.display_name,
      description,
      keywords: t.keywords,
      worksCount: t.works_count,
      domain: { id: this.shortId(t.domain.id), label: koDomain || t.domain.display_name },
      field: { id: this.shortId(t.field.id), label: koField || t.field.display_name },
      subfield: { id: this.shortId(t.subfield.id), label: koSubfield || t.subfield.display_name },
      siblings: t.siblings.map(s => ({ id: this.shortId(s.id), label: s.display_name })),
    };
  }

  private buildGraphFromTopic(t: OpenAlexTopic): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const rootId = this.shortId(t.id);
    const domainId = this.shortId(t.domain.id);
    const fieldId = this.shortId(t.field.id);
    const subId = this.shortId(t.subfield.id);

    const nodes: GraphNode[] = [
      { id: domainId, label: t.domain.display_name, type: 'domain' },
      { id: fieldId, label: t.field.display_name, type: 'field' },
      { id: subId, label: t.subfield.display_name, type: 'subfield' },
      {
        id: rootId, label: t.display_name, type: 'topic',
        worksCount: t.works_count, description: t.description, keywords: t.keywords,
      },
    ];
    const edges: GraphEdge[] = [
      { source: domainId, target: fieldId, type: 'hierarchy' },
      { source: fieldId, target: subId, type: 'hierarchy' },
      { source: subId, target: rootId, type: 'hierarchy' },
    ];

    for (const sib of t.siblings.slice(0, 8)) {
      const sibId = this.shortId(sib.id);
      nodes.push({ id: sibId, label: sib.display_name, type: 'sibling' });
      edges.push({ source: subId, target: sibId, type: 'hierarchy' });
      edges.push({ source: rootId, target: sibId, type: 'sibling' });
    }

    return { nodes, edges };
  }
}
