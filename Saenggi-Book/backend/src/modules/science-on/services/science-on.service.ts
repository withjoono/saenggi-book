import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { ScienceOnSearchDto } from '../dtos/science-on-query.dto';

const BASE_URL = 'https://apigateway.kisti.re.kr';
const AES_IV = 'jvHJ1EFA0IXBrxxz';

export interface ScienceOnArticle {
  id: string;
  titleKo: string;
  titleEn?: string;
  abstract?: string;
  authors: string[];
  journal?: string;
  publisher?: string;
  year?: number;
  url?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class ScienceOnService {
  private readonly logger = new Logger(ScienceOnService.name);
  private readonly apiKey = process.env.SCIENCE_ON_API_KEY ?? '';
  private readonly clientId = process.env.SCIENCE_ON_CLIENT_ID ?? '';
  private readonly macAddress = process.env.SCIENCE_ON_MAC_ADDRESS ?? '';

  private cachedToken: CachedToken | null = null;

  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: true,
  });

  constructor(private readonly httpService: HttpService) {}

  async searchArticles(dto: ScienceOnSearchDto): Promise<{
    total: number;
    page: number;
    perPage: number;
    results: ScienceOnArticle[];
  }> {
    this.assertCredentials();

    const token = await this.getAccessToken();
    const page = dto.page ?? 1;
    const perPage = dto.per_page ?? 10;
    const searchQuery = JSON.stringify({ BI: dto.query });

    const params = {
      client_id: this.clientId,
      token,
      version: '1.0',
      action: 'search',
      target: 'ARTI',
      searchQuery,
      curPage: page,
      rowCount: perPage,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<string>(`${BASE_URL}/openapicall.do`, {
          params,
          responseType: 'text',
          transformResponse: (raw) => raw,
        }),
      );

      const { total, records } = this.parseSearchXml(data);
      // 한국어 제목이 없는 국제논문 제외
      const results = records
        .map((r) => this.mapRecord(r))
        .filter((r) => /[가-힣]/.test(r.titleKo || ''));

      return { total, page, perPage, results };
    } catch (error) {
      this.logger.error('Science ON 논문 검색 실패', error?.response?.data ?? error?.message);
      throw new HttpException('Science ON API 호출 실패', HttpStatus.BAD_GATEWAY);
    }
  }

  async getArticleDetail(cn: string): Promise<ScienceOnArticle> {
    this.assertCredentials();
    const token = await this.getAccessToken();

    const params = {
      client_id: this.clientId,
      token,
      version: '1.0',
      action: 'browse',
      target: 'ARTI',
      cn,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<string>(`${BASE_URL}/openapicall.do`, {
          params,
          responseType: 'text',
          transformResponse: (raw) => raw,
        }),
      );

      const { records } = this.parseSearchXml(data);
      const first = records[0] ?? {};
      return this.mapRecord(first, cn);
    } catch (error) {
      this.logger.error(`Science ON 논문 상세 조회 실패: ${cn}`, error?.response?.data ?? error?.message);
      throw new HttpException('논문 상세 정보를 불러올 수 없습니다.', HttpStatus.BAD_GATEWAY);
    }
  }

  // ── 인증/토큰 ────────────────────────────────────────────────────────────────

  private assertCredentials(): void {
    const missing: string[] = [];
    if (!this.apiKey) missing.push('SCIENCE_ON_API_KEY');
    if (!this.clientId) missing.push('SCIENCE_ON_CLIENT_ID');
    if (!this.macAddress) missing.push('SCIENCE_ON_MAC_ADDRESS');
    if (missing.length > 0) {
      this.logger.error(`Science ON 환경변수 누락: ${missing.join(', ')}`);
      throw new HttpException(
        `Science ON 인증 정보 누락: ${missing.join(', ')}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 60_000) {
      return this.cachedToken.accessToken;
    }

    const accounts = this.buildAccountsParam();

    const { data } = await firstValueFrom(
      this.httpService.get<string>(`${BASE_URL}/tokenrequest.do`, {
        params: { client_id: this.clientId, accounts },
        responseType: 'text',
        transformResponse: (raw) => raw,
      }),
    );

    const accessToken = this.extractAccessToken(data);
    if (!accessToken) {
      this.logger.error(`Science ON 토큰 발급 실패 응답: ${String(data).slice(0, 400)}`);
      throw new HttpException('Science ON 토큰 발급 실패', HttpStatus.BAD_GATEWAY);
    }

    this.cachedToken = {
      accessToken,
      expiresAt: Date.now() + 30 * 60_000,
    };
    return accessToken;
  }

  private buildAccountsParam(): string {
    const digits = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
    const plain = JSON.stringify({ datetime: digits, mac_address: this.macAddress });

    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.apiKey, 'utf8'),
      Buffer.from(AES_IV, 'utf8'),
    );
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return encrypted.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private extractAccessToken(payload: string): string | null {
    if (!payload) return null;
    const trimmed = payload.trim();
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        return obj.access_token ?? obj.accessToken ?? null;
      } catch {
        /* fallthrough */
      }
    }
    try {
      const parsed: any = this.xmlParser.parse(trimmed);
      return (
        parsed?.MetaData?.access_token ??
        parsed?.MetaData?.accessToken ??
        parsed?.MetaData?.result?.access_token ??
        null
      );
    } catch {
      return null;
    }
  }

  // ── XML 파싱 ─────────────────────────────────────────────────────────────────

  private parseSearchXml(xml: string): { total: number; records: Record<string, string>[] } {
    if (!xml) return { total: 0, records: [] };

    const parsed: any = this.xmlParser.parse(xml);
    const meta = parsed?.MetaData ?? parsed?.metaData ?? parsed;
    const statusCode = meta?.resultSummary?.statusCode;

    if (statusCode && String(statusCode) !== '200') {
      const code = meta?.errorDetail?.errorCode;
      const message = meta?.errorDetail?.errorMessage;
      this.logger.error(`Science ON API 오류 ${statusCode} ${code}: ${message}`);
      throw new HttpException(
        `Science ON API 오류 ${code ?? statusCode}: ${message ?? 'unknown'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const total = parseInt(
      String(meta?.resultSummary?.TotalCount ?? meta?.resultSummary?.totalCount ?? 0),
      10,
    );

    const recordsNode =
      meta?.recordList?.record ??
      meta?.outputItems?.outputItem ??
      meta?.results?.record ??
      meta?.records?.record;
    const recordArr: any[] = Array.isArray(recordsNode) ? recordsNode : recordsNode ? [recordsNode] : [];

    const records = recordArr.map((rec) => this.recordToMap(rec));
    return { total, records };
  }

  private recordToMap(record: any): Record<string, string> {
    const map: Record<string, string> = {};
    const items = record?.item ?? record?.items;
    const arr: any[] = Array.isArray(items) ? items : items ? [items] : [];
    for (const item of arr) {
      const code = item?.['@_metaCode'] ?? item?.['@_code'] ?? item?.metaCode;
      const value =
        typeof item === 'string'
          ? item
          : item?.['#text'] ?? item?.value ?? '';
      if (code) map[String(code)] = String(value ?? '');
    }
    return map;
  }

  private mapRecord(rec: Record<string, string>, fallbackId = ''): ScienceOnArticle {
    const rawYear = rec.Pubyear || rec.PY || '';
    const year = rawYear ? parseInt(String(rawYear).replace(/\D/g, '').slice(0, 4), 10) : NaN;
    return {
      id: rec.CN || rec.ArticleId || fallbackId,
      titleKo: this.stripTags(rec.Title || rec.TI || ''),
      titleEn: this.stripTags(rec.Title2 || rec.TIE || '') || undefined,
      abstract: this.stripTags(rec.Abstract || rec.AB || '') || undefined,
      authors: this.parseAuthors(rec.Author || rec.AU || ''),
      journal: this.stripTags(rec.JournalName || rec.SO || '') || undefined,
      publisher: this.stripTags(rec.Publisher || rec.PB || '') || undefined,
      year: Number.isFinite(year) ? year : undefined,
      url: rec.ContentURL || rec.FulltextURL || rec.MobileURL || rec.UL || undefined,
    };
  }

  private stripTags(raw: string): string {
    if (!raw) return '';
    return raw.replace(/<[^>]+>/g, '').replace(/&amp;#xD;/g, '').replace(/&amp;/g, '&').trim();
  }

  private parseAuthors(raw: string): string[] {
    if (!raw) return [];
    return raw.split(/[,;|]/).map((a) => a.trim()).filter(Boolean);
  }
}
