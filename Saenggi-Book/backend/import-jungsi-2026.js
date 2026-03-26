const XLSX = require('xlsx');
const { Client } = require('pg');

// 엑셀 파일 읽기
const path = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_채움완료.xlsx';
const wb = XLSX.readFile(path);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// 데이터 행 (Row 2부터)
const dataRows = rawData.slice(2);

console.log('=== 엑셀 데이터 로드 완료 ===');
console.log('총 행 수:', dataRows.length);

// 엑셀 대학명 → DB 대학명 매핑
const univNameMap = {
  // 일반 대학 (대학교 → 대)
  '가천대학교': '가천대',
  '가톨릭관동대학교': '가톨릭관동대',
  '가톨릭꽃동네대학교': '가톨릭꽃동네대',
  '가톨릭대학교': '가톨릭대',
  '강남대학교': '강남대',
  '강서대학교': '강서대',
  '강원대학교': '강원대',
  '강원대학교(강릉)': '강원대(강릉원주)',
  '강원대학교(삼척)': '강원대(삼척)',
  '강원대학교(원주)': '강원대(강릉원주)',
  '건국대학교': '건국대',
  '건국대학교(글로컬)': '건국대(글로컬)',
  '건양대학교': '건양대',
  '경국대학교': '경국대',
  '경기대학교': '경기대',
  '경남대학교': '경남대',
  '경북대학교': '경북대',
  '경북대학교(상주)': '경북대(상주)',
  '경상국립대학교': '경상국립대',
  '경성대학교': '경성대',
  '경일대학교': '경일대',
  '경희대학교': '경희대',
  '계명대학교': '계명대',
  '고려대학교': '고려대',
  '고려대학교(세종)': '고려대(세종)',
  '고신대학교': '고신대',
  '공주대학교': '공주대',
  '광운대학교': '광운대',
  '국민대학교': '국민대',
  '군산대학교': '군산대',
  '극동대학교': '극동대',
  '김천대학교': '김천대',
  '나사렛대학교': '나사렛대',
  '남부대학교': '남부대',
  '남서울대학교': '남서울대',
  '농협대학교': '농협대',
  '단국대학교': '단국대',
  '단국대학교(천안)': '단국대(천안)',
  '대구가톨릭대학교': '대구가톨릭대',
  '대구대학교': '대구대',
  '대구한의대학교': '대구한의대',
  '대전대학교': '대전대',
  '대진대학교': '대진대',
  '동국대학교': '동국대',
  '동국대학교(WISE)': '동국대(WISE)',
  '동명대학교': '동명대',
  '동서대학교': '동서대',
  '동신대학교': '동신대',
  '동아대학교': '동아대',
  '동양대학교': '동양대',
  '동의대학교': '동의대',
  '명지대학교': '명지대',
  '명지대학교(자연)': '명지대(자연)',
  '목원대학교': '목원대',
  '목포가톨릭대학교': '목포가톨릭대',
  '목포대학교': '목포대',
  '목포해양대학교': '목포해양대',
  '배재대학교': '배재대',
  '백석대학교': '백석대',
  '부경대학교': '부경대',
  '부산가톨릭대학교': '부산가톨릭대',
  '부산대학교': '부산대',
  '부산대학교(밀양)': '부산대(밀양)',
  '삼육대학교': '삼육대',
  '상명대학교': '상명대',
  '상명대학교(천안)': '상명대(천안)',
  '상지대학교': '상지대',
  '서강대학교': '서강대',
  '서경대학교': '서경대',
  '서울과학기술대학교': '서울과학기술대',
  '서울대학교': '서울대',
  '서울시립대학교': '서울시립대',
  '서울신학대학교': '서울신학대',
  '서원대학교': '서원대',
  '선문대학교': '선문대',
  '성결대학교': '성결대',
  '성공회대학교': '성공회대',
  '성균관대학교': '성균관대',
  '세명대학교': '세명대',
  '세종대학교': '세종대',
  '수원대학교': '수원대',
  '순천대학교': '순천대',
  '순천향대학교': '순천향대',
  '숭실대학교': '숭실대',
  '신경주대학교': '신경주대',
  '신라대학교': '신라대',
  '신한대학교': '신한대',
  '아주대학교': '아주대',
  '안양대학교': '안양대',
  '연세대학교': '연세대',
  '연세대학교(미래)': '연세대(미래)',
  '영남대학교': '영남대',
  '예수대학교': '예수대',
  '용인대학교': '용인대',
  '우석대학교': '우석대',
  '우송대학교': '우송대',
  '울산대학교': '울산대',
  '원광대학교': '원광대',
  '유원대학교': '유원대',
  '을지대학교': '을지대',
  '인제대학교': '인제대',
  '인천가톨릭대학교': '인천가톨릭대',
  '인천대학교': '인천대',
  '인하대학교': '인하대',
  '장로회신학대학교': '장로회신학대',
  '전남대학교': '전남대',
  '전남대학교(여수)': '전남대(여수)',
  '전북대학교': '전북대',
  '전주대학교': '전주대',
  '제주대학교': '제주대',
  '조선대학교': '조선대',
  '중부대학교': '중부대',
  '중앙대학교': '중앙대',
  '중앙대학교(다빈치)': '중앙대(다빈치)',
  '중원대학교': '중원대',
  '차의과학대학교': '차의과학대',
  '창원대학교': '창원대',
  '청주대학교': '청주대',
  '총신대학교': '총신대',
  '추계예술대학교': '추계예술대',
  '충남대학교': '충남대',
  '충북대학교': '충북대',
  '충청대학교': '충청대',
  '한경국립대학교': '한경국립대',
  '한국공학대학교': '한국공학대',
  '한국교원대학교': '한국교원대',
  '한국교통대학교': '한국교통대',
  '한국기술교육대학교': '한국기술교대',
  '한국성서대학교': '한국성서대',
  '한국에너지공과대학교': '한국에너지공대',
  '한국외국어대학교': '한국외대',
  '한국외국어대학교(글로벌)': '한국외대(글로벌)',
  '한국체육대학교': '한국체육대',
  '한국항공대학교': '한국항공대',
  '한국해양대학교': '한국해양대',
  '한남대학교': '한남대',
  '한동대학교': '한동대',
  '한라대학교': '한라대',
  '한림대학교': '한림대',
  '한밭대학교': '한밭대',
  '한서대학교': '한서대',
  '한성대학교': '한성대',
  '한세대학교': '한세대',
  '한신대학교': '한신대',
  '한양대학교': '한양대',
  '한양대학교(ERICA)': '한양대(ERICA)',
  '협성대학교': '협성대',
  '호서대학교': '호서대',
  '홍익대학교': '홍익대',
  '홍익대학교(세종)': '홍익대(세종)',

  // 여자대학교 → 여대
  '덕성여자대학교': '덕성여대',
  '동덕여자대학교': '동덕여대',
  '서울여자대학교': '서울여대',
  '성신여자대학교': '성신여대',
  '숙명여자대학교': '숙명여대',
  '수원여자대학교': '수원여대',
  '이화여자대학교': '이화여대',

  // 교육대학교 → 교대
  '경인교육대학교': '경인교대',
  '공주교육대학교': '공주교대',
  '광주교육대학교': '광주교대',
  '대구교육대학교': '대구교대',
  '부산교육대학교': '부산교대',
  '서울교육대학교': '서울교대',
  '전주교육대학교': '전주교대',
  '진주교육대학교': '진주교대',
  '청주교육대학교': '청주교대',
  '춘천교육대학교': '춘천교대',

  // 외국어대학교 → 외대
  '부산외국어대학교': '부산외대',

  // 특수대학
  '광주과학기술원': '광주과학기술원',
  '대구경북과학기술원': '대구경북과학기술원',
  '울산과학기술원': '울산과학기술원',
  '한국과학기술원': '한국과학기술원',

  // 보건대
  '삼육보건대학교': '삼육보건대',
  '원광보건대학교': '원광보건대',
  '서울여자간호대학교': '서울여자간호대',
  '한림성심대학교': '한림성심대',
  '제주한라대학교': '제주한라대',

  // 전문대 (DB에 없을 수 있음)
  '재능대학교': '인천재능대',
  '가톨릭상지대학교': '상지대', // 매핑 시도
};

// 값 정제 함수
function cleanValue(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'string') {
    val = val.replace(/^\[확인필요\]\s*/, '');
    val = val.replace(/^\[추론\]\s*/, '');
    if (val === '[수동입력필요]') return null;
  }
  return val;
}

function toNumber(val) {
  const cleaned = cleanValue(val);
  if (cleaned === null) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function toString(val) {
  const cleaned = cleanValue(val);
  if (cleaned === null) return null;
  return String(cleaned).trim();
}

async function importToDatabase(dbConfig, dbName) {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log(`\n=== ${dbName} 연결 성공 ===`);

    // 대학 정보 조회
    const univResult = await client.query('SELECT id, name FROM ts_universities');
    const univMap = {};
    univResult.rows.forEach(row => {
      univMap[row.name] = row.id;
    });
    console.log('DB 대학 수:', Object.keys(univMap).length);

    // 기존 2026년 데이터 삭제
    const deleteResult = await client.query('DELETE FROM ts_regular_admissions WHERE year = 2026');
    console.log('기존 2026년 데이터 삭제:', deleteResult.rowCount, '행');

    let insertCount = 0;
    let skipCount = 0;
    const errors = new Set();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const excelUnivName = toString(row[1]);

      if (!excelUnivName) {
        skipCount++;
        continue;
      }

      // 대학명 매핑
      const dbUnivName = univNameMap[excelUnivName] || excelUnivName;
      let universityId = univMap[dbUnivName];

      if (!universityId) {
        errors.add(excelUnivName);
        skipCount++;
        continue;
      }

      const insertData = {
        year: 2026,
        university_id: universityId,
        admission_name: toString(row[2]) || '일반전형',
        admission_type: toString(row[3]) || '가',
        general_field_name: toString(row[4]) || '',
        detailed_fields: toString(row[5]) || '',
        recruitment_name: toString(row[6]) || '',
        recruitment_number: Math.round(toNumber(row[7]) || 0),
        selection_method: toString(row[8]) || '',
        csat_ratio: toString(row[9]) || '0',
        school_record_ratio: toString(row[10]) || '0',
        interview_ratio: toString(row[11]) || '0',
        other_ratio: toString(row[12]) || '0',
        csat_elements: toString(row[13]),
        csat_combination: toString(row[14]),
        csat_required: toString(row[15]),
        csat_optional: toString(row[16]),
        research_subject_count: toNumber(row[17]),
        korean_reflection_score: toNumber(row[18]),
        math_reflection_score: toNumber(row[19]),
        english_reflection_score: toNumber(row[20]),
        research_reflection_score: toNumber(row[21]),
        korean_history_reflection_score: toNumber(row[22]),
        second_foreign_language_reflection_score: toNumber(row[23]),
        korean_elective_subject: toString(row[24]),
        math_elective_subject: toString(row[25]),
        math_probability_statistics_additional_points: toString(row[26]),
        math_calculus_additional_points: toString(row[27]),
        math_geometry_additional_points: toString(row[28]),
        research_type: toString(row[29]),
        research_social_additional_points: toString(row[30]),
        research_science_additional_points: toString(row[31]),
        math_research_selection: toString(row[32]),
        english_application_criteria: toString(row[33]),
        english_grade_1_score: toString(row[34]),
        english_grade_2_score: toString(row[35]),
        english_grade_3_score: toString(row[36]),
        english_grade_4_score: toString(row[37]),
        english_grade_5_score: toString(row[38]),
        english_grade_6_score: toString(row[39]),
        english_grade_7_score: toString(row[40]),
        english_grade_8_score: toString(row[41]),
        english_grade_9_score: toString(row[42]),
        english_minimum_criteria: toString(row[43]),
        korean_history_application_criteria: toString(row[44]),
        korean_history_grade_1_score: toString(row[45]),
        korean_history_grade_2_score: toString(row[46]),
        korean_history_grade_3_score: toString(row[47]),
        korean_history_grade_4_score: toString(row[48]),
        korean_history_grade_5_score: toString(row[49]),
        korean_history_grade_6_score: toString(row[50]),
        korean_history_grade_7_score: toString(row[51]),
        korean_history_grade_8_score: toString(row[52]),
        korean_history_grade_9_score: toString(row[53]),
        korean_history_minimum_criteria: toString(row[54]),
        min_cut: toNumber(row[55]),
        min_cut_percent: toNumber(row[56]),
        max_cut: toNumber(row[57]),
        max_cut_percent: toNumber(row[58]),
        risk_plus_5: toNumber(row[59]),
        risk_plus_4: toNumber(row[60]),
        risk_plus_3: toNumber(row[61]),
        risk_plus_2: toNumber(row[62]),
        risk_plus_1: toNumber(row[63]),
        risk_minus_1: toNumber(row[64]),
        risk_minus_2: toNumber(row[65]),
        risk_minus_3: toNumber(row[66]),
        risk_minus_4: toNumber(row[67]),
        risk_minus_5: toNumber(row[68]),
      };

      const columns = Object.keys(insertData);
      const values = Object.values(insertData);
      const placeholders = values.map((_, idx) => `$${idx + 1}`);

      const query = `
        INSERT INTO ts_regular_admissions (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;

      try {
        await client.query(query, values);
        insertCount++;
      } catch (err) {
        if (skipCount < 5) {
          console.error(`Row ${i} 에러:`, err.message);
        }
        skipCount++;
      }
    }

    console.log(`\n=== ${dbName} 결과 ===`);
    console.log('삽입 성공:', insertCount);
    console.log('스킵:', skipCount);

    if (errors.size > 0) {
      console.log('\n매핑 안된 대학 목록 (' + errors.size + '개):');
      [...errors].sort().forEach(e => console.log(`  - ${e}`));
    }

    return true;
  } catch (err) {
    console.error(`${dbName} 에러:`, err.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const targetDb = args[0] || 'both';

  const localConfig = {
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  };

  const prodConfig = {
    host: '127.0.0.1',
    port: 5434,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  };

  console.log('=== 정시 2026 데이터 import 시작 ===');
  console.log('대상:', targetDb);

  if (targetDb === 'local' || targetDb === 'both') {
    await importToDatabase(localConfig, '로컬 DB');
  }

  if (targetDb === 'prod' || targetDb === 'both') {
    await importToDatabase(prodConfig, '운영 DB');
  }

  console.log('\n=== 완료 ===');
}

main().catch(console.error);
