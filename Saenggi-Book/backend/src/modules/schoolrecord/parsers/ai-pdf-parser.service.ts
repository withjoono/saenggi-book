/**
 * AI-based School Record PDF Parser Service
 *
 * OpenAI GPT를 사용한 PDF 형식 학생부 파싱 서비스
 * 원본: GB-SchoolRecord-Parser (Python/FastAPI)
 */

import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');

interface AcademicRecord {
  교과명: string;
  과목명: string;
  단위수: string;
  원점수?: string;
  과목평균?: string;
  표준편차?: string;
  성취도: string;
  수강자수?: string;
  석차등급?: string;
  성취도분포비율A?: string;
  성취도분포비율B?: string;
  성취도분포비율C?: string;
}

/**
 * 교과명(한글) → 교과 코드 매핑
 * 프론트엔드 Select 컴포넌트와 분석 차트에서 사용하는 코드
 */
const MAIN_SUBJECT_CODE_MAP: Record<string, string> = {
  국어: 'HH1',
  수학: 'HH2',
  영어: 'HH3',
  '사회(역사/도덕포함)': 'HH4',
  사회: 'HH4',
  과학: 'HH5',
  '기술・가정/제2외국어/한문/교양': 'HH6',
  '기술·가정/제2외국어/한문/교양': 'HH6',
  한국사: 'HH7',
  체육: 'HH8',
  예술: 'HH9',
  // 전문교과 계열
  과학계열: 'HH10',
  국제계열: 'HH11',
  예술계열: 'HH12',
  외국어계열: 'HH13',
  체육계열: 'HH14',
  // 직업계열
  건설: 'HH15',
  '경영･금융': 'HH16',
  기계: 'HH17',
  '농림･수산･해양': 'HH18',
  '디자인･문화 콘텐츠': 'HH19',
  '미용･관광･레저': 'HH20',
  '보건･복지': 'HH21',
  '선박 운항': 'HH22',
  '섬유･의류': 'HH23',
  '식품･가공': 'HH24',
  '음식 조리': 'HH25',
  '인쇄･출판･공예': 'HH26',
  재료: 'HH27',
  '전기･전자': 'HH28',
  '정보･통신': 'HH29',
  '화학 공원': 'HH30',
  '환경･안전': 'HH31',
};

/**
 * 과목명(한글) → 과목 코드 매핑
 */
const SUBJECT_CODE_MAP: Record<string, string> = {
  // 국어 (KOR)
  국어: 'KOR001',
  '화법과 작문': 'KOR002',
  독서: 'KOR003',
  '언어와 매체': 'KOR004',
  문학: 'KOR005',
  '실용 국어': 'KOR006',
  '심화 국어': 'KOR007',
  '고전 읽기': 'KOR008',
  // 수학 (MAT)
  수학: 'MAT001',
  수학Ⅰ: 'MAT002',
  수학Ⅱ: 'MAT003',
  미적분: 'MAT004',
  '확률과 통계': 'MAT005',
  기하: 'MAT006',
  '경제 수학': 'MAT007',
  '수학과제 탐구': 'MAT008',
  '실용 수학': 'MAT009',
  '인공지능 수학': 'MAT010',
  // 영어 (ENG)
  영어: 'ENG001',
  영어Ⅰ: 'ENG002',
  영어Ⅱ: 'ENG003',
  '영어 회화': 'ENG004',
  '영어 독해와 작문': 'ENG005',
  '실용 영어': 'ENG006',
  '영어권 문화': 'ENG007',
  '진로 영어': 'ENG008',
  '영미 문학 읽기': 'ENG009',
  // 사회 (SOC)
  통합사회: 'SOC001',
  한국지리: 'SOC002',
  세계지리: 'SOC003',
  세계사: 'SOC004',
  동아시아사: 'SOC005',
  경제: 'SOC006',
  '정치와 법': 'SOC007',
  '사회·문화': 'SOC008',
  '사회문화': 'SOC008',
  '생활과 윤리': 'SOC009',
  '윤리와 사상': 'SOC010',
  여행지리: 'SOC011',
  '사회문제 탐구': 'SOC012',
  '고전과 윤리': 'SOC013',
  // 과학 (SCI)
  통합과학: 'SCI001',
  과학탐구실험: 'SCI002',
  물리학Ⅰ: 'SCI003',
  물리학Ⅱ: 'SCI004',
  화학Ⅰ: 'SCI005',
  화학Ⅱ: 'SCI006',
  생명과학Ⅰ: 'SCI007',
  생명과학Ⅱ: 'SCI008',
  지구과학Ⅰ: 'SCI009',
  지구과학Ⅱ: 'SCI010',
  융합과학: 'SCI011',
  과학사: 'SCI012',
  '생활과 과학': 'SCI013',
  // 기술가정 (TEC)
  '기술·가정': 'TEC001',
  '기술가정': 'TEC001',
  정보: 'TEC002',
  '농업 생명 과학': 'TEC003',
  '공학 일반': 'TEC004',
  '창의 경영': 'TEC005',
  '해양 문화와 기술': 'TEC006',
  가정과학: 'TEC007',
  '지식 재산 일반': 'TEC008',
  // 제2외국어 (LAN)
  독일어Ⅰ: 'LAN001',
  프랑스어Ⅰ: 'LAN002',
  스페인어Ⅰ: 'LAN003',
  중국어Ⅰ: 'LAN004',
  일본어Ⅰ: 'LAN005',
  러시아어Ⅰ: 'LAN006',
  아랍어Ⅰ: 'LAN007',
  베트남어Ⅰ: 'LAN008',
  한문Ⅰ: 'LAN009',
  한문: 'LAN009',
  '진로와 직업': 'LAN010',
  환경: 'LAN011',
  '실용 경제': 'LAN012',
  논리학: 'LAN013',
  논술: 'LAN013',
  심리학: 'LAN014',
  철학: 'LAN015',
  종교학: 'LAN016',
  교육학: 'LAN017',
  보건: 'LAN018',
  // 한국사 (HIS)
  한국사: 'HIS001',
  // 체육 (PHY)
  체육: 'PHY001',
  '운동과 건강': 'PHY002',
  '스포츠 생활': 'PHY003',
  '체육 탐구': 'PHY004',
  // 예술 (ART)
  음악: 'ART001',
  미술: 'ART002',
  연극: 'ART003',
  '음악 연주': 'ART004',
  '음악 감상과 비평': 'ART005',
  '미술 창작': 'ART006',
  '미술 감상과 비평': 'ART007',
};

/**
 * 과목명에서 과목 코드를 찾습니다.
 */
function getSubjectCode(subjectName: string): string {
  if (!subjectName) return 'DEFAULT';

  // 정확한 매칭 시도
  if (SUBJECT_CODE_MAP[subjectName]) {
    return SUBJECT_CODE_MAP[subjectName];
  }

  // 정규화된 이름으로 시도
  const normalizedName = subjectName
    .replace(/\s+/g, ' ')
    .trim();

  if (SUBJECT_CODE_MAP[normalizedName]) {
    return SUBJECT_CODE_MAP[normalizedName];
  }

  // 공백 제거 후 시도
  const noSpaceName = subjectName.replace(/\s+/g, '');
  for (const [key, code] of Object.entries(SUBJECT_CODE_MAP)) {
    if (key.replace(/\s+/g, '') === noSpaceName) {
      return code;
    }
  }

  return 'DEFAULT';
}

/**
 * 교과명에서 교과 코드를 찾습니다.
 * 정확한 매칭이 안되면 부분 매칭을 시도합니다.
 */
function getMainSubjectCode(mainSubjectName: string): string {
  if (!mainSubjectName) return 'DEFAULT';

  // 정확한 매칭 시도
  if (MAIN_SUBJECT_CODE_MAP[mainSubjectName]) {
    return MAIN_SUBJECT_CODE_MAP[mainSubjectName];
  }

  // 부분 매칭 시도 (특수문자 차이 등을 고려)
  const normalizedName = mainSubjectName
    .replace(/[・·]/g, '·') // 가운뎃점 통일
    .replace(/\s+/g, '') // 공백 제거
    .trim();

  for (const [key, code] of Object.entries(MAIN_SUBJECT_CODE_MAP)) {
    const normalizedKey = key.replace(/[・·]/g, '·').replace(/\s+/g, '').trim();
    if (normalizedName === normalizedKey || normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
      return code;
    }
  }

  return 'DEFAULT';
}

interface SemesterData {
  일반: AcademicRecord[];
  진로선택: AcademicRecord[];
  체육예술: AcademicRecord[];
}

interface YearData {
  '1학기': SemesterData;
  '2학기': SemesterData;
}

interface ParsedAcademicRecords {
  academic_records: {
    [year: string]: YearData;
  };
}

@Injectable()
export class AiPdfParserService {
  private readonly logger = new Logger(AiPdfParserService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY not configured - AI parsing disabled');
    }
  }

  /**
   * PDF 버퍼에서 텍스트 추출 (pdf-parse v2 API)
   */
  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const parser = new PDFParse({ verbosity: 0, data: pdfBuffer });
      await parser.load();
      const result = await parser.getText();
      return result.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`PDF 파일 처리 중 오류 발생: ${message}`);
    }
  }

  /**
   * 특정 섹션의 내용을 추출하고 정제
   */
  private extractSection(text: string, startMarker: string, endMarker: string): string {
    try {
      let pattern: RegExp;
      if (startMarker === '^') {
        pattern = new RegExp(`(.*?)${this.escapeRegex(endMarker)}`, 's');
      } else {
        pattern = new RegExp(
          `${this.escapeRegex(startMarker)}(.*?)${this.escapeRegex(endMarker)}`,
          's',
        );
      }

      const match = text.match(pattern);
      if (match) {
        let content = match[1].trim();
        // 페이지 하단의 학교 정보 등 제거
        content = content.replace(
          /반\s*\d+\s*번호\d+이름\s*[\w\s]+\s*[\w\s]+교\s*\d+\/\d+\s*\d+년\s*\d+월\s*\d+일/g,
          '',
        );
        // 불필요한 줄바꿈 정리
        content = content.replace(/\n+/g, '\n');
        return content;
      }
      return '';
    } catch {
      return '';
    }
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 학기별 데이터 분리
   */
  private processSemesterData(text: string): { '1학기': string; '2학기': string } {
    const semesters = { '1학기': '', '2학기': '' };
    let currentSemester: '1학기' | '2학기' | null = null;
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('1')) {
        currentSemester = '1학기';
        semesters['1학기'] += line.substring(1) + '\n';
      } else if (line.startsWith('2')) {
        currentSemester = '2학기';
        semesters['2학기'] += line.substring(1) + '\n';
      } else if (currentSemester && line.trim()) {
        semesters[currentSemester] += line + '\n';
      }
    }

    return semesters;
  }

  /**
   * 학년별, 영역별로 텍스트 분할
   */
  splitByYear(
    text: string,
  ): Array<{ year: string; content: Record<string, { '1학기': string; '2학기': string }> }> {
    const yearPattern = /\[(\d)학년\]/g;
    const yearStarts: Array<{ pos: number; year: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = yearPattern.exec(text)) !== null) {
      yearStarts.push({ pos: match.index, year: match[1] });
    }

    if (yearStarts.length === 0) {
      throw new Error('학년별 정보를 찾을 수 없습니다');
    }

    const yearChunks: Array<{
      year: string;
      content: Record<string, { '1학기': string; '2학기': string }>;
    }> = [];

    for (let i = 0; i < yearStarts.length; i++) {
      const startPos = yearStarts[i].pos;
      const nextPos = i + 1 < yearStarts.length ? yearStarts[i + 1].pos : text.length;
      const yearContent = text.substring(startPos, nextPos).trim();
      const year = yearStarts[i].year;

      // 각 영역별로 분할
      const sections = {
        일반: this.extractSection(yearContent, '^', '세 부 능 력 및 특 기 사 항'),
        진로선택: this.extractSection(yearContent, '진로 선택 과목', '세 부 능 력 및 특 기 사 항'),
        체육예술: this.extractSection(yearContent, '체육ㆍ예술', '세 부 능 력 및 특 기 사 항'),
      };

      // 각 섹션의 데이터를 학기별로 분리
      const processedSections: Record<string, { '1학기': string; '2학기': string }> = {};
      for (const [sectionName, sectionContent] of Object.entries(sections)) {
        if (sectionContent.trim()) {
          processedSections[sectionName] = this.processSemesterData(sectionContent);
        }
      }

      if (Object.keys(processedSections).length > 0) {
        yearChunks.push({
          year: `${year}학년`,
          content: processedSections,
        });
      }
    }

    return yearChunks;
  }

  /**
   * 각 학년 데이터를 OpenAI로 처리
   */
  private async processChunk(chunk: {
    year: string;
    content: Record<string, { '1학기': string; '2학기': string }>;
  }): Promise<Partial<ParsedAcademicRecords> | null> {
    if (!this.openai) {
      throw new Error('OpenAI API가 설정되지 않았습니다. OPENAI_API_KEY를 확인해주세요.');
    }

    const prompt = this.buildPrompt(chunk.year, chunk.content);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        this.logger.warn(`${chunk.year} 응답 없음`);
        return null;
      }

      try {
        return JSON.parse(content);
      } catch (je) {
        this.logger.error(`${chunk.year} JSON 파싱 오류: ${je}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`${chunk.year} 처리 중 오류: ${error}`);
      return null;
    }
  }

  /**
   * GPT 프롬프트 생성
   */
  private buildPrompt(
    year: string,
    content: Record<string, { '1학기': string; '2학기': string }>,
  ): string {
    return `다음 ${year} 생활기록부의 성적 정보를 JSON 형식으로 반환해주세요.

아래는 과목 분류 기준입니다:
1. 일반 과목: 텍스트의 "일반" 섹션에 있는 과목
2. 진로선택 과목: 텍스트의 "진로선택" 섹션에 있는 과목
3. 체육예술 과목: 텍스트의 "체육예술" 섹션에 있는 과목

각 섹션은 동일한 섹션에서의 데이터만 포함해야 합니다. (일반 섹션에 있는 데이터를 진로선택 섹션에 있는 데이터에 포함하지 않아야 합니다.)

반드시 아래 형식의 JSON으로만 응답해주세요:
{
    "academic_records": {
        "${year}": {
            "1학기": {
                "일반": [
                    {
                        "교과명": "string",
                        "과목명": "string",
                        "단위수": "string",
                        "원점수": "string",
                        "과목평균": "string",
                        "표준편차": "string",
                        "성취도": "string",
                        "수강자수": "string",
                        "석차등급": "string"
                    }
                ],
                "진로선택": [
                    {
                        "교과명": "string",
                        "과목명": "string",
                        "단위수": "string",
                        "원점수": "string",
                        "과목평균": "string",
                        "성취도": "string",
                        "수강자수": "string",
                        "석차등급": "string",
                        "성취도분포비율A": "string",
                        "성취도분포비율B": "string",
                        "성취도분포비율C": "string"
                    }
                ],
                "체육예술": [
                    {
                        "교과명": "string",
                        "과목명": "string",
                        "단위수": "string",
                        "성취도": "string"
                    }
                ]
            },
            "2학기": {
                "일반": [],
                "진로선택": [],
                "체육예술": []
            }
        }
    }
}

주의사항:
1. 값은 모두 문자열로 반환해야 합니다. (예: 11.2 -> "11.2")
2. 값이 없는 경우 null로 반환해야 합니다.
3. 원점수/과목평균(표준편차)의 값이 91/75.1(10.2)인 경우 원점수는 91, 과목평균은 75.1, 표준편차는 10.2로 반환해야 합니다.
4. 원점수/과목평균의 값이 91/75.1인 경우 원점수는 91, 과목평균은 75.1로 반환해야 합니다.
5. 성취도(수강자수)의 값이 A(112)인 경우 성취도는 A, 수강자수는 112로 반환해야 합니다.
6. 성취도별분포비율이 A(19.6) B(61.6) C(18.8)인 경우 성취도분포비율A는 19.6, 성취도분포비율B는 61.6, 성취도분포비율C는 18.8로 반환해야 합니다.
7. 교과명과 과목명은 반드시 존재하며 이름에 '\\n'이 포함되는 경우를 고려해야합니다.
    예시 1: "사회(역사/도덕\\n포함)\\r통합사회"의 경우 교과명: 사회(역사/도덕포함), 과목명: 통합사회
    예시 2: "기술・가정/제2\\n외국어/한문/교\\n양기술·가정"의 경우 교과명: 기술・가정/제2 외국어/한문/교양, 과목명: 기술·가정
8. 교과는 반드시 다음 배열 중 하나와 같습니다. ["국어", "수학", "영어", "사회(역사/도덕포함)", "과학", "기술・가정/제2외국어/한문/교양", "한국사", "체육", "예술", "과학계열", "국제계열", "예술계열", "외국어계열", "체육계열", "건설", "경영･금융", "기계", "농림･수산･해양", "디자인･문화 콘텐츠", "미용･관광･레저", "보건･복지", "선박 운항", "섬유･의류", "식품･가공", "음식 조리", "인쇄･출판･공예", "재료", "전기･전자", "정보･통신", "화학 공원", "환경･안전"]
9. 과목은 교과 바로 다음에 존재하며 띄어쓰기 없이 붙어있을 수도 있습니다.
    예시 1: "기술・가정/제2\\n외국어/한문/교\\n양기술·가정"는 교과명: "기술・가정/제2외국어/한문/교양", 과목명: "기술·가정"
10. 과목명 끝엔 Ⅰ같은 문자를 제외한 숫자는 포함되어있지 않습니다. 만약 존재한다면 단위수 일 수 있습니다.
    예시 1: "윤리와 사상4"면 과목명: "윤리와 사상", 단위수: "4"
    예시 2: "윤리와 사\\n상4"면 과목명: "윤리와 사상", 단위수: "4"
11. 입력 수와 출력 수는 동일해야 합니다.
    예시 1: 1학년 1학기 "일반"의 과목이 8개라면 1학년 1학기 "일반"의 결과도 8개여야 합니다.
12. "성취도"와 "석차등급"은 "P"일 수 있으며 원점수/과목평균/표준편차/수강자수는 존재하지 않을 수 있습니다.

텍스트:
${JSON.stringify(content)}`;
  }

  /**
   * 학년별 결과를 하나로 병합
   */
  private mergeResults(
    results: Array<Partial<ParsedAcademicRecords> | null>,
  ): ParsedAcademicRecords {
    const merged: ParsedAcademicRecords = {
      academic_records: {},
    };

    for (const result of results) {
      if (result?.academic_records) {
        for (const [grade, gradeData] of Object.entries(result.academic_records)) {
          if (!merged.academic_records[grade]) {
            merged.academic_records[grade] = gradeData;
          }
        }
      }
    }

    return merged;
  }

  /**
   * PDF 파싱 메인 메서드
   */
  async parseGrades(pdfBuffer: Buffer): Promise<ParsedAcademicRecords> {
    const text = await this.extractTextFromPdf(pdfBuffer);
    const chunks = this.splitByYear(text);

    this.logger.log(`PDF 파싱 시작: ${chunks.length}개 학년 발견`);

    // 모든 청크를 병렬로 처리
    const results = await Promise.all(chunks.map((chunk) => this.processChunk(chunk)));

    // null 값 제거 및 결과 병합
    const validResults = results.filter((r) => r !== null);

    if (validResults.length === 0) {
      throw new Error('성적 정보 추출 실패');
    }

    this.logger.log(`PDF 파싱 완료: ${validResults.length}개 학년 처리됨`);

    return this.mergeResults(validResults);
  }

  /**
   * 기존 파서 호환 형식으로 변환
   */
  async parse(pdfBuffer: Buffer): Promise<{
    subjectLearnings: Array<{
      grade: string;
      semester: string;
      mainSubjectCode: string;
      mainSubjectName: string;
      subjectCode: string;
      subjectName: string;
      unit: string;
      rawScore: string;
      subSubjectAverage: string;
      standardDeviation: string;
      achievement: string;
      studentsNum: string;
      ranking: string;
      etc: string;
    }>;
    selectSubjects: Array<{
      grade: string;
      semester: string;
      mainSubjectCode: string;
      mainSubjectName: string;
      subjectCode: string;
      subjectName: string;
      unit: string;
      rawScore: string;
      subSubjectAverage: string;
      achievement: string;
      studentsNum: string;
      achievementA: string;
      achievementB: string;
      achievementC: string;
      etc: string;
    }>;
  }> {
    const aiResult = await this.parseGrades(pdfBuffer);
    return this.convertToLegacyFormat(aiResult);
  }

  /**
   * AI 파싱 결과를 기존 형식으로 변환
   */
  private convertToLegacyFormat(aiResult: ParsedAcademicRecords) {
    const subjectLearnings: Array<{
      grade: string;
      semester: string;
      mainSubjectCode: string;
      mainSubjectName: string;
      subjectCode: string;
      subjectName: string;
      unit: string;
      rawScore: string;
      subSubjectAverage: string;
      standardDeviation: string;
      achievement: string;
      studentsNum: string;
      ranking: string;
      etc: string;
    }> = [];

    const selectSubjects: Array<{
      grade: string;
      semester: string;
      mainSubjectCode: string;
      mainSubjectName: string;
      subjectCode: string;
      subjectName: string;
      unit: string;
      rawScore: string;
      subSubjectAverage: string;
      achievement: string;
      studentsNum: string;
      achievementA: string;
      achievementB: string;
      achievementC: string;
      etc: string;
    }> = [];

    for (const [yearKey, yearData] of Object.entries(aiResult.academic_records)) {
      const grade = yearKey.replace('학년', '');

      for (const [semesterKey, semesterData] of Object.entries(yearData)) {
        const semester = semesterKey.replace('학기', '');

        // 일반 과목 처리
        if (semesterData.일반) {
          for (const record of semesterData.일반) {
            const mainSubjectName = record.교과명 || '';
            const subjectName = record.과목명 || '';
            subjectLearnings.push({
              grade,
              semester,
              mainSubjectCode: getMainSubjectCode(mainSubjectName),
              mainSubjectName,
              subjectCode: getSubjectCode(subjectName),
              subjectName,
              unit: record.단위수 || '',
              rawScore: record.원점수 || '',
              subSubjectAverage: record.과목평균 || '',
              standardDeviation: record.표준편차 || '',
              achievement: record.성취도 || '',
              studentsNum: record.수강자수 || '',
              ranking: record.석차등급 || '',
              etc: '',
            });
          }
        }

        // 체육예술 과목도 일반에 포함
        if (semesterData.체육예술) {
          for (const record of semesterData.체육예술) {
            const mainSubjectName = record.교과명 || '';
            const subjectName = record.과목명 || '';
            subjectLearnings.push({
              grade,
              semester,
              mainSubjectCode: getMainSubjectCode(mainSubjectName),
              mainSubjectName,
              subjectCode: getSubjectCode(subjectName),
              subjectName,
              unit: record.단위수 || '',
              rawScore: '',
              subSubjectAverage: '',
              standardDeviation: '',
              achievement: record.성취도 || 'P',
              studentsNum: '',
              ranking: '',
              etc: '',
            });
          }
        }

        // 진로선택 과목 처리
        if (semesterData.진로선택) {
          for (const record of semesterData.진로선택) {
            const mainSubjectName = record.교과명 || '';
            const subjectName = record.과목명 || '';
            selectSubjects.push({
              grade,
              semester,
              mainSubjectCode: getMainSubjectCode(mainSubjectName),
              mainSubjectName,
              subjectCode: getSubjectCode(subjectName),
              subjectName,
              unit: record.단위수 || '',
              rawScore: record.원점수 || '',
              subSubjectAverage: record.과목평균 || '',
              achievement: record.성취도 || '',
              studentsNum: record.수강자수 || '',
              achievementA: record.성취도분포비율A || '',
              achievementB: record.성취도분포비율B || '',
              achievementC: record.성취도분포비율C || '',
              etc: '',
            });
          }
        }
      }
    }

    return { subjectLearnings, selectSubjects };
  }
}
