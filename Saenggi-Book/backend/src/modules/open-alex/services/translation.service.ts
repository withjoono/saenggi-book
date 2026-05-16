import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as taxonomyKo from '../data/taxonomy-ko.json';

// domain + field + subfield + topic display_name → 한국어 통합 룩업 테이블
const TAXONOMY_MAP: Record<string, string> = {
  ...taxonomyKo.domains,
  ...taxonomyKo.fields,
  ...taxonomyKo.subfields,
  ...taxonomyKo.topics,
};

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly cache = new Map<string, string>();

  constructor(private readonly http: HttpService) {}

  isKorean(text: string): boolean {
    return /[가-힣]/.test(text);
  }

  /** taxonomy (domain/field/subfield) 한국어 룩업 — API 호출 없음 */
  lookupTaxonomy(text: string): string | null {
    return TAXONOMY_MAP[text] ?? null;
  }

  /** 한국어 쿼리 → 영어 변환 (MyMemory) */
  async toEnglish(text: string): Promise<string> {
    if (!text || !this.isKorean(text)) return text;
    const key = `en:${text}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const result = await this.callMyMemory(text, 'ko', 'en');
    this.cache.set(key, result);
    return result;
  }

  /**
   * 영어 텍스트 배열 → 한국어 번역
   * - taxonomy에 있는 항목: JSON 룩업 (API 호출 없음)
   * - topic/sibling 이름: MyMemory 병렬 처리 + 캐시
   */
  async toKorean(texts: string[]): Promise<string[]> {
    const results = new Array<string>(texts.length);
    const pending: { i: number; text: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i] ?? '';
      if (!text) { results[i] = text; continue; }

      // 1순위: taxonomy 하드코딩 룩업
      const taxKo = this.lookupTaxonomy(text);
      if (taxKo) { results[i] = taxKo; continue; }

      // 2순위: 메모리 캐시
      const key = `ko:${text}`;
      if (this.cache.has(key)) { results[i] = this.cache.get(key)!; continue; }

      pending.push({ i, text });
    }

    if (pending.length > 0) {
      const translated = await Promise.all(
        pending.map(p => this.callMyMemory(p.text, 'en', 'ko').catch(() => p.text)),
      );
      for (let j = 0; j < pending.length; j++) {
        const { i, text } = pending[j];
        results[i] = translated[j] ?? text;
        this.cache.set(`ko:${text}`, results[i]);
      }
    }

    return results;
  }

  /** Wikipedia에서 한국어 제목과 설명 가져오기 (무료) */
  async getKoreanFromWikipedia(wikipediaUrl: string): Promise<{ title: string; extract: string } | null> {
    try {
      const enTitle = decodeURIComponent(wikipediaUrl.split('/wiki/').pop() ?? '');
      if (!enTitle) return null;

      const { data: langData } = await firstValueFrom(
        this.http.get('https://en.wikipedia.org/w/api.php', {
          params: { action: 'query', titles: enTitle, prop: 'langlinks', lllang: 'ko', format: 'json' },
          timeout: 5000,
        }),
      );

      const pages = Object.values(langData?.query?.pages ?? {}) as any[];
      const koTitle: string = pages[0]?.langlinks?.[0]?.['*'];
      if (!koTitle) return null;

      const { data: summary } = await firstValueFrom(
        this.http.get(
          `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(koTitle)}`,
          { timeout: 5000 },
        ),
      );

      return {
        title: summary.title as string,
        extract: summary.extract as string,
      };
    } catch {
      return null;
    }
  }

  private async callMyMemory(text: string, src: string, tgt: string): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(MYMEMORY_URL, {
          params: { q: text, langpair: `${src}|${tgt}` },
          timeout: 5000,
        }),
      );
      const translated: string = data?.responseData?.translatedText;
      // MyMemory가 원문 그대로 반환하거나 오류 메시지를 반환하면 원문 유지
      if (!translated || translated === text || translated.startsWith('PLEASE SELECT')) {
        return text;
      }
      return translated;
    } catch (err) {
      this.logger.warn(`MyMemory 번역 실패 (${src}→${tgt}): ${err.message}`);
      return text;
    }
  }
}
