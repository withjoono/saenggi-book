/**
 * Essay Excel Parser Service
 *
 * 논술 Excel 파일 파싱 서비스
 */

import { Injectable, Logger } from '@nestjs/common';
import { ExcelUtil, NotParserExcelUploadData } from '../../../common/utils/excel.util';
import {
  ParsedNonsul,
  ParsedNonsulLowestGrade,
  ParsedNonsulAvailableMath,
  ParsedNonsulPercentile,
  ParsedNonsulResult,
} from './nonsul-parser.types';

@Injectable()
export class EssayExcelParserService {
  private readonly logger = new Logger(EssayExcelParserService.name);

  /**
   * Essay 및 LowestGrade 데이터를 Excel에서 파싱
   *
   * @param buffer Excel 파일 버퍼
   * @param columnIndex Excel 컬럼 수
   * @returns 파싱된 essay 및 lowest grade 데이터
   */
  parseEssayExcel(buffer: Buffer, columnIndex: number): ParsedNonsulResult {
    this.logger.log('Essay Excel 데이터 파싱 시작');

    const nonsuls: ParsedNonsul[] = [];
    const lowestGrades: ParsedNonsulLowestGrade[] = [];

    const data = ExcelUtil.getRowDataTopColumnUsingColumnName(buffer, columnIndex);
    const dataArray = ExcelUtil.stringMapArrayToObjectArray(data);

    for (let i = 0; i < dataArray.length; i++) {
      const row = dataArray[i];
      const id = i;

      try {
        const nonsul: ParsedNonsul = {
          integrationCode: `NS${id}`,
          collegeCode: row['대학교코드'] || '',
          admissionSeriesCode: row['전형계열코드'] || '',
          typeTime: row['전형시간'] || '',
          nonsulSubject: row['논술과목'] || '',
          examinationTendency: row['출제경향'] || '',
          recruitmentUnit: row['모집단위명'] || '',
          susi: row['수시'] || '',
          competitionRate: row['작년경쟁율'] || '',
          nonsulType: row['논술'] || '',
          typeRate: row['학생부비율'] || '',
          studentRecruitmentNum: ExcelUtil.parseIntSafe(row['모집인원']),
          admissionDate: row['전형날짜'] || '',
          admissionTime: row['전형시각'] || '',
          commonScience: ExcelUtil.parseIntSafe(row['통합과학']),
          mulone: ExcelUtil.parseIntSafe(row['물1']),
          hwaone: ExcelUtil.parseIntSafe(row['화1']),
          sangone: ExcelUtil.parseIntSafe(row['생1']),
          jiown: ExcelUtil.parseIntSafe(row['지1']),
          mulonetwo: ExcelUtil.parseIntSafe(row['물1+물2']),
          hwaonetwo: ExcelUtil.parseIntSafe(row['화1+화2']),
          sangonetwo: ExcelUtil.parseIntSafe(row['생1+생2']),
          jiowntwo: ExcelUtil.parseIntSafe(row['지1+지2']),
          selectScienceSubject: ExcelUtil.parseIntSafe(row['선택과목']),
          commonMath: ExcelUtil.parseIntSafe(row['공통수학']),
          suoneSutwo: ExcelUtil.parseIntSafe(row['수1+수2']),
          pbSt: ExcelUtil.parseIntSafe(row['확통']),
          dfIn: ExcelUtil.parseIntSafe(row['미적']),
          geometry: ExcelUtil.parseIntSafe(row['기하']),
          selectMathSubject: ExcelUtil.parseIntSafe(row['선택과목2']),
          suNosul: row['수리논술대학'] || '',
          crossSupport: ExcelUtil.parseIntSafe(row['이과교차지원']),
          scienceDesignation: ExcelUtil.parseIntSafe(row['과학필수지정대학']),
          exceptNonsul: ExcelUtil.parseIntSafe(row['그외논술전형대학']),
          munMathen: ExcelUtil.parseIntSafe(row['문과수리영어포함']),
          rthreeEtcFlag: ExcelUtil.parseIntSafe(row['의치한약수기타기능선택플래그']),
          rthreeRegionFlag: ExcelUtil.parseIntSafe(row['의치한약수지역인재']),
          rthreeEtcCode: row['의치한약수기타기능과목'] || '',
          rthreeRegionInfo: row['의치한약수고등학교소재지'] || '',
        };

        nonsuls.push(nonsul);

        const lowestGrade: ParsedNonsulLowestGrade = {
          collegeCode: row['대학교코드'] || '',
          nonsulId: id,
          lowestMath: ExcelUtil.parseIntSafe(row['최저수학']),
          lowestMigi: ExcelUtil.parseIntSafe(row['수학(미/기)']),
          lowestKorean: ExcelUtil.parseIntSafe(row['국어']),
          lowestEnglish: ExcelUtil.parseIntSafe(row['영어']),
          content: row['최저내용'] || '',
          lowestSociety: ExcelUtil.parseIntSafe(row['사탐']),
          lowestScience: ExcelUtil.parseIntSafe(row['과탐']),
          lowestCount: ExcelUtil.parseIntSafe(row['최저갯수']),
          lowestSum: ExcelUtil.parseIntSafe(row['최저합']),
          lowestUse: ExcelUtil.parseIntSafe(row['최저학력기준_반영여부']),
          lowestHistory: ExcelUtil.parseIntSafe(row['한국사']),
          lowestCal: ExcelUtil.parseIntSafe(row['과탐2과목평균']),
        };

        lowestGrades.push(lowestGrade);
      } catch (error) {
        this.logger.error(`Error parsing row ${i}:`, error);
        throw new NotParserExcelUploadData(
          i,
          0,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    this.logger.log(`파싱 완료: ${nonsuls.length}개 nonsuls, ${lowestGrades.length}개 lowest grades`);
    return { nonsuls, lowestGrades };
  }

  /**
   * Essay Available Math 데이터를 Excel에서 파싱
   *
   * @param buffer Excel 파일 버퍼
   * @param columnIndex 컬럼 수 (기본값: 7)
   * @returns 파싱된 available math 데이터
   */
  parseEssayAvailableMathExcel(
    buffer: Buffer,
    columnIndex: number = 7,
  ): ParsedNonsulAvailableMath[] {
    this.logger.log('Essay Available Math Excel 데이터 파싱 시작');

    const result: ParsedNonsulAvailableMath[] = [];
    const data = ExcelUtil.getRowDataExceptTopColumn(buffer, columnIndex);
    const dataArray = ExcelUtil.mapArrayToObjectArray(data);

    for (const row of dataArray) {
      const item: ParsedNonsulAvailableMath = {
        collegeCode: row[0] || '', // 대학코드
        admissionSeriesCode: row[1] || '', // 전형계열
        commonMath: ExcelUtil.parseIntSafe(row[2]), // 공통수학
        suoneSutwo: ExcelUtil.parseIntSafe(row[3]), // 수1+수2
        pbSt: ExcelUtil.parseIntSafe(row[4]), // 확통
        dfIn: ExcelUtil.parseIntSafe(row[5]), // 미적
        geometry: ExcelUtil.parseIntSafe(row[6]), // 기하
      };

      result.push(item);
    }

    this.logger.log(`파싱 완료: ${result.length}개 available math 항목`);
    return result;
  }

  /**
   * Essay Percentile 데이터를 Excel에서 파싱
   *
   * @param buffer Excel 파일 버퍼
   * @param scheduleId 모의고사 스케줄 ID
   * @param columnIndex 컬럼 수 (기본값: 5)
   * @returns 파싱된 percentile 데이터
   */
  parseEssayPercentileExcel(
    buffer: Buffer,
    scheduleId: number,
    columnIndex: number = 5,
  ): ParsedNonsulPercentile[] {
    this.logger.log(`Essay Percentile Excel 데이터 파싱 시작 (schedule: ${scheduleId})`);

    const result: ParsedNonsulPercentile[] = [];
    const data = ExcelUtil.getRowDataExceptTopColumn(buffer, columnIndex);
    const dataArray = ExcelUtil.mapArrayToObjectArray(data);

    for (const row of dataArray) {
      const item: ParsedNonsulPercentile = {
        collegeName: row[0] || '', // 대학교이름
        collegeCode: row[1] || '', // 대학교코드
        admissionSeriesCode: row[2] || '', // 전형계열코드
        percentileTop: ExcelUtil.parseFloatSafe(row[3]), // 백분위최고
        percentileBottom: ExcelUtil.parseFloatSafe(row[4]), // 백분위최저
        scheduleId,
      };

      result.push(item);
    }

    this.logger.log(`파싱 완료: ${result.length}개 percentile 항목`);
    return result;
  }

  /**
   * 점수를 1000점 환산점수로 변환
   */
  convertScoreThousandScore(data: {
    collegeCode: string;
    admissionSeriesCode: string;
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    grade5: number;
    grade6: number;
    grade7: number;
    grade8: number;
    grade9: number;
  }): {
    collegeCode: string;
    gradeType: string;
    admissionSeriesCode: string;
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    grade5: number;
    grade6: number;
    grade7: number;
    grade8: number;
    grade9: number;
  } {
    const maxScore = 1000;

    return {
      collegeCode: data.collegeCode,
      gradeType: '1000점 환산점수',
      admissionSeriesCode: data.admissionSeriesCode,
      grade1: maxScore,
      grade2: Math.round(((maxScore * data.grade2) / data.grade1) * 10) / 10,
      grade3: Math.round(((maxScore * data.grade3) / data.grade1) * 10) / 10,
      grade4: Math.round(((maxScore * data.grade4) / data.grade1) * 10) / 10,
      grade5: Math.round(((maxScore * data.grade5) / data.grade1) * 10) / 10,
      grade6: Math.round(((maxScore * data.grade6) / data.grade1) * 10) / 10,
      grade7: Math.round(((maxScore * data.grade7) / data.grade1) * 10) / 10,
      grade8: Math.round(((maxScore * data.grade8) / data.grade1) * 10) / 10,
      grade9: Math.round(((maxScore * data.grade9) / data.grade1) * 10) / 10,
    };
  }
}
