/**
 * 중계열별 필수/권장 과목 요구사항 업로드 스크립트
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

const sampleData = [
  // 이과 계열
  {
    grandSeries: '공학계열',
    middleSeries: '건축',
    seriesType: 'science',
    requiredSubjects: ['물리학Ⅰ', '물리학Ⅱ'],
    recommendedSubjects: ['기하', '미적분', '확률과 통계'],
    description: '건축학과는 물리학 필수, 수학 심화 과목 권장',
  },
  {
    grandSeries: '자연계열',
    middleSeries: '화학',
    seriesType: 'science',
    requiredSubjects: ['화학Ⅰ', '화학Ⅱ'],
    recommendedSubjects: ['물리학Ⅰ', '생명과학Ⅰ', '미적분'],
    description: '화학과는 화학 필수, 물리/생명과학 권장',
  },
  {
    grandSeries: '의약계열',
    middleSeries: '의약',
    seriesType: 'science',
    requiredSubjects: ['화학Ⅰ', '생명과학Ⅰ'],
    recommendedSubjects: ['화학Ⅱ', '생명과학Ⅱ', '물리학Ⅰ', '미적분'],
    description: '의약학은 화학, 생명과학 필수',
  },
  {
    grandSeries: '의약계열',
    middleSeries: '약학',
    seriesType: 'science',
    requiredSubjects: ['화학Ⅰ', '생명과학Ⅰ'],
    recommendedSubjects: ['화학Ⅱ', '생명과학Ⅱ', '물리학Ⅰ'],
    description: '약학과는 화학, 생명과학 필수',
  },
  {
    grandSeries: '자연계열',
    middleSeries: '생명과학',
    seriesType: 'science',
    requiredSubjects: ['생명과학Ⅰ'],
    recommendedSubjects: ['생명과학Ⅱ', '화학Ⅰ', '화학Ⅱ'],
    description: '생명과학과는 생명과학 필수, 화학 권장',
  },
  {
    grandSeries: '공학계열',
    middleSeries: '기계',
    seriesType: 'science',
    requiredSubjects: ['물리학Ⅰ'],
    recommendedSubjects: ['물리학Ⅱ', '미적분', '기하'],
    description: '기계공학과는 물리학 필수, 수학 심화 권장',
  },
  {
    grandSeries: '공학계열',
    middleSeries: '전기전자',
    seriesType: 'science',
    requiredSubjects: ['물리학Ⅰ'],
    recommendedSubjects: ['물리학Ⅱ', '미적분', '확률과 통계'],
    description: '전기전자공학과는 물리학 필수',
  },
  {
    grandSeries: '공학계열',
    middleSeries: '컴퓨터',
    seriesType: 'science',
    requiredSubjects: [],
    recommendedSubjects: ['미적분', '확률과 통계', '물리학Ⅰ'],
    description: '컴퓨터공학과는 수학 심화 권장',
  },

  // 문과 계열 (필수/권장 과목이 있는 경우)
  {
    grandSeries: '인문계열',
    middleSeries: '경제학',
    seriesType: 'humanities',
    requiredSubjects: ['수학'],
    recommendedSubjects: ['사회', '통합사회'],
    description: '경제학과는 수학 필수, 사회 권장',
  },
  {
    grandSeries: '인문계열',
    middleSeries: '경영학',
    seriesType: 'humanities',
    requiredSubjects: ['수학'],
    recommendedSubjects: ['사회', '통합사회'],
    description: '경영학과는 수학 필수, 사회 권장',
  },
];

async function uploadData() {
  const client = await pool.connect();

  try {
    console.log('📥 중계열별 필수/권장 과목 업로드 시작...\n');

    // 기존 데이터 삭제
    await client.query('DELETE FROM middle_series_subject_requirements');
    console.log('✅ 기존 데이터 삭제 완료\n');

    // 새 데이터 삽입
    for (const data of sampleData) {
      const query = `
        INSERT INTO middle_series_subject_requirements
        (grand_series, middle_series, series_type, required_subjects, recommended_subjects, description)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await client.query(query, [
        data.grandSeries,
        data.middleSeries,
        data.seriesType,
        JSON.stringify(data.requiredSubjects),
        JSON.stringify(data.recommendedSubjects),
        data.description,
      ]);

      console.log(`✅ ${data.grandSeries} > ${data.middleSeries} (${data.seriesType})`);
      console.log(`   필수: ${data.requiredSubjects.join(', ') || '없음'}`);
      console.log(`   권장: ${data.recommendedSubjects.join(', ') || '없음'}\n`);
    }

    console.log(`\n✅ 총 ${sampleData.length}개 중계열 요구사항 업로드 완료!`);
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

uploadData();
