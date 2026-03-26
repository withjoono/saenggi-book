import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AskDto, ChatResponseDto } from './dto/ask.dto';
import * as fs from 'fs';
import * as path from 'path';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface FAQCategory {
  id: string;
  name: string;
  faqs: FAQ[];
}

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
}

interface ManualDocument {
  filename: string;
  pagePath: string;
  content: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private faqs: FAQCategory[] = [];
  private glossary: GlossaryTerm[] = [];
  private manuals: ManualDocument[] = [];
  private isLoaded = false;

  constructor(private readonly configService: ConfigService) {
    this.loadKnowledgeBase();
  }

  /**
   * 지식 베이스 로드 (FAQ, 용어사전, 매뉴얼)
   */
  private loadKnowledgeBase(): void {
    try {
      // FAQ 로드
      const faqPath = path.join(process.cwd(), 'docs', 'faq.json');
      if (fs.existsSync(faqPath)) {
        const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf-8'));
        this.faqs = faqData.categories || [];
        this.logger.log(`FAQ 로드 완료: ${this.faqs.length}개 카테고리`);
      }

      // 용어사전 로드
      const glossaryPath = path.join(process.cwd(), 'docs', 'glossary.json');
      if (fs.existsSync(glossaryPath)) {
        const glossaryData = JSON.parse(fs.readFileSync(glossaryPath, 'utf-8'));
        this.glossary = glossaryData.terms || [];
        this.logger.log(`용어사전 로드 완료: ${this.glossary.length}개 용어`);
      }

      // 매뉴얼 로드
      const manualDir = path.join(process.cwd(), 'docs', 'manual');
      if (fs.existsSync(manualDir)) {
        const files = fs.readdirSync(manualDir).filter((f) => f.endsWith('.md'));
        this.manuals = files.map((filename) => {
          const content = fs.readFileSync(path.join(manualDir, filename), 'utf-8');
          const pagePath = this.extractPagePath(content);
          return { filename, pagePath, content };
        });
        this.logger.log(`매뉴얼 로드 완료: ${this.manuals.length}개 문서`);
      }

      this.isLoaded = true;
    } catch (error) {
      this.logger.error('지식 베이스 로드 실패:', error);
    }
  }

  /**
   * 매뉴얼에서 페이지 경로 추출
   */
  private extractPagePath(content: string): string {
    const match = content.match(/\*\*페이지 경로\*\*:\s*`([^`]+)`/);
    return match ? match[1] : '';
  }

  /**
   * 질문에 답변하기
   */
  async ask(dto: AskDto): Promise<ChatResponseDto> {
    const { question, currentPage } = dto;
    const normalizedQuestion = question.toLowerCase().trim();

    this.logger.log(`[ASK] 원본 질문: "${question}"`);
    this.logger.log(`[ASK] 정규화된 질문: "${normalizedQuestion}"`);
    this.logger.log(`[ASK] 용어사전 개수: ${this.glossary.length}`);

    // 1. FAQ에서 검색
    const faqMatch = this.searchFAQ(normalizedQuestion);
    if (faqMatch) {
      return {
        answer: faqMatch.answer,
        sources: ['faq.json'],
        relatedPages: this.getRelatedPages(faqMatch.answer),
        suggestedQuestions: this.getSuggestedQuestions(faqMatch),
      };
    }

    // 2. 용어사전에서 검색
    const glossaryMatch = this.searchGlossary(normalizedQuestion);
    if (glossaryMatch) {
      let answer = `**${glossaryMatch.term}**: ${glossaryMatch.definition}`;
      if (glossaryMatch.example) {
        answer += `\n\n예시: ${glossaryMatch.example}`;
      }
      return {
        answer,
        sources: ['glossary.json'],
        relatedPages: [],
        suggestedQuestions: glossaryMatch.relatedTerms?.map((t) => `${t}이란 무엇인가요?`),
      };
    }

    // 3. 현재 페이지 컨텍스트 기반 매뉴얼 검색
    const manualMatch = this.searchManual(normalizedQuestion, currentPage);
    if (manualMatch) {
      return {
        answer: manualMatch.excerpt,
        sources: [manualMatch.filename],
        relatedPages: [manualMatch.pagePath],
        suggestedQuestions: this.getManualSuggestions(manualMatch.filename),
      };
    }

    // 4. 기본 응답
    return {
      answer:
        '죄송합니다. 해당 질문에 대한 답변을 찾지 못했습니다. 다른 키워드로 다시 질문해주시거나, 고객센터로 문의해주세요.',
      sources: [],
      relatedPages: currentPage ? [currentPage] : [],
      suggestedQuestions: [
        '환산점수가 뭔가요?',
        '가군/나군/다군이 뭔가요?',
        '경쟁률은 어디서 확인하나요?',
      ],
    };
  }

  /**
   * FAQ 검색
   */
  private searchFAQ(question: string): FAQ | null {
    let bestMatch: { faq: FAQ; score: number } | null = null;

    for (const category of this.faqs) {
      for (const faq of category.faqs) {
        let score = 0;

        // 1. 질문 직접 매칭 (높은 점수)
        const faqQuestion = faq.question.toLowerCase();
        if (faqQuestion.includes(question) || question.includes(faqQuestion)) {
          score += 10;
        }

        // 2. 키워드 매칭 (키워드당 점수)
        const matchedKeywords = faq.keywords.filter((kw) => question.includes(kw.toLowerCase()));
        score += matchedKeywords.length * 2;

        // 3. 질문 단어 매칭
        const questionWords = faq.question.split(/\s+/).filter((w) => w.length >= 2);
        const matchedWords = questionWords.filter((w) => question.includes(w.toLowerCase()));
        score += matchedWords.length;

        // 최소 1개 키워드 또는 2개 단어 매칭 시 후보로 등록
        if (score >= 2 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { faq, score };
        }
      }
    }

    if (bestMatch) {
      this.logger.debug(`FAQ 매칭: "${bestMatch.faq.question}" (점수: ${bestMatch.score})`);
    }

    return bestMatch?.faq || null;
  }

  /**
   * 용어사전 검색
   */
  private searchGlossary(question: string): GlossaryTerm | null {
    this.logger.debug(`[GLOSSARY] 검색 시작 - 질문: "${question}"`);
    this.logger.debug(`[GLOSSARY] 용어 목록: ${this.glossary.map((g) => g.term).join(', ')}`);

    // 1. 직접 용어 매칭 (우선순위 높음)
    // 용어가 질문에 포함되어 있는지 확인
    for (const g of this.glossary) {
      const includes = question.includes(g.term);
      this.logger.debug(`[GLOSSARY] "${g.term}" 포함 여부: ${includes}`);
      if (includes) {
        this.logger.debug(`용어사전 직접 매칭: "${g.term}"`);
        return g;
      }
    }

    // 2. "~란?", "~이란?", "~가 뭐야?", "~뜻" 등 패턴 처리
    const termPatterns = [
      /(.+?)(?:이란|란|가|이)\s*(?:뭐|무엇|뭔가요|무엇인가요|뭐야|뭐에요)/,
      /(.+?)(?:의미|뜻)(?:이|가|는|을|를)?/,
      /(.+?)\s*(?:알려|설명|가르쳐)/,
      /(.+?)(?:은|는)\s*(?:뭐|무엇|뭔가요)/,
    ];

    for (const pattern of termPatterns) {
      const match = question.match(pattern);
      if (match) {
        const searchTerm = match[1].trim();
        this.logger.debug(`패턴 매칭 시도: "${searchTerm}"`);
        const found = this.glossary.find(
          (g) =>
            g.term === searchTerm || g.term.includes(searchTerm) || searchTerm.includes(g.term),
        );
        if (found) {
          this.logger.debug(`용어사전 패턴 매칭: "${found.term}"`);
          return found;
        }
      }
    }

    // 3. 부분 매칭 (용어의 일부가 질문에 포함)
    const partialMatch = this.glossary.find((g) => {
      const termWords = g.term.split(/\s+/);
      return termWords.some((word) => word.length >= 2 && question.includes(word));
    });
    if (partialMatch) {
      this.logger.debug(`용어사전 부분 매칭: "${partialMatch.term}"`);
      return partialMatch;
    }

    return null;
  }

  /**
   * 매뉴얼 검색
   */
  private searchManual(
    question: string,
    currentPage?: string,
  ): { filename: string; pagePath: string; excerpt: string } | null {
    // 현재 페이지 우선 검색
    if (currentPage) {
      const pageManual = this.manuals.find((m) =>
        m.pagePath.includes(currentPage.split('/').pop() || ''),
      );
      if (pageManual) {
        const excerpt = this.extractRelevantSection(pageManual.content, question);
        if (excerpt) {
          return {
            filename: pageManual.filename,
            pagePath: pageManual.pagePath,
            excerpt,
          };
        }
      }
    }

    // 전체 매뉴얼 검색
    for (const manual of this.manuals) {
      const excerpt = this.extractRelevantSection(manual.content, question);
      if (excerpt) {
        return {
          filename: manual.filename,
          pagePath: manual.pagePath,
          excerpt,
        };
      }
    }

    return null;
  }

  /**
   * 매뉴얼에서 관련 섹션 추출
   */
  private extractRelevantSection(content: string, question: string): string | null {
    const keywords = question.split(/\s+/).filter((w) => w.length > 1);
    const sections = content.split(/\n##\s+/);

    for (const section of sections) {
      const matchCount = keywords.filter((kw) => section.toLowerCase().includes(kw)).length;
      if (matchCount >= 2 || (matchCount >= 1 && section.length < 500)) {
        // 섹션에서 핵심 부분만 추출 (최대 500자)
        const cleanSection = section.replace(/\n\n+/g, '\n').trim();
        return cleanSection.length > 500 ? cleanSection.substring(0, 500) + '...' : cleanSection;
      }
    }

    return null;
  }

  /**
   * 관련 페이지 링크 추출
   */
  private getRelatedPages(text: string): string[] {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const pages: string[] = [];
    let match;
    while ((match = linkPattern.exec(text)) !== null) {
      if (match[2].startsWith('/')) {
        pages.push(match[2]);
      }
    }
    return pages.slice(0, 3);
  }

  /**
   * 후속 질문 추천
   */
  private getSuggestedQuestions(faq: FAQ): string[] {
    const category = this.faqs.find((c) => c.faqs.some((f) => f.id === faq.id));
    if (!category) return [];

    return category.faqs
      .filter((f) => f.id !== faq.id)
      .slice(0, 3)
      .map((f) => f.question);
  }

  /**
   * 매뉴얼 기반 추천 질문
   */
  private getManualSuggestions(filename: string): string[] {
    const suggestions: Record<string, string[]> = {
      '01-score-input.md': ['탐구 과목은 몇 개 입력해야 하나요?', '영어는 왜 등급만 입력하나요?'],
      '02-explore-groups.md': ['가군에서 2개 대학 지원 가능한가요?', '의대는 어떤 군에 있나요?'],
      '03-combination.md': ['합격률은 어떻게 계산되나요?', '모의지원이 실제 원서 접수인가요?'],
    };
    return suggestions[filename] || [];
  }

  /**
   * 지식 베이스 상태 확인
   */
  getStatus(): { isLoaded: boolean; faqCount: number; glossaryCount: number; manualCount: number } {
    return {
      isLoaded: this.isLoaded,
      faqCount: this.faqs.reduce((acc, cat) => acc + cat.faqs.length, 0),
      glossaryCount: this.glossary.length,
      manualCount: this.manuals.length,
    };
  }
}
