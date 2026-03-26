const XLSX = require('xlsx');
const { Client } = require('pg');

async function main() {
    // 1. 엑셀 파일 읽기
    const wb = XLSX.readFile('uploads/26 정시 db 1209_fixed.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // 마지막 null 값들 수동 매핑
    const sangseIdx = 5;  // 상세계열
    const mojipIdx = 6;   // 모집단위명

    const manualMapping = {
        '산업공학과(산업정보시스템)/인문': '공학',
        '산업공학과(산업정보시스템)/자연': '공학',
        '자율설계전공': '자율전공',
        '정보시스템학과': '공학'
    };

    let fixedCount = 0;
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row[sangseIdx] || row[sangseIdx] === '') {
            const mojip = (row[mojipIdx] || '').toString();
            if (manualMapping[mojip]) {
                row[sangseIdx] = manualMapping[mojip];
                fixedCount++;
            }
        }
    }
    console.log('마지막 null 수정:', fixedCount, '개');

    // 2. DB 연결
    const client = new Client({
        host: '127.0.0.1',
        port: 5432,
        user: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_dev'
    });

    await client.connect();
    console.log('DB 연결 성공\n');

    // 3. 대학 코드 매핑 조회
    const univResult = await client.query('SELECT id, code, name FROM ts_universities');
    const univByCode = {};
    const univByName = {};

    univResult.rows.forEach(row => {
        if (row.code) univByCode[row.code] = row.id;
        if (row.name) univByName[row.name] = row.id;
    });

    console.log('=== 대학 매핑 정보 ===');
    console.log('코드 매핑된 대학:', Object.keys(univByCode).length);
    console.log('이름 매핑된 대학:', Object.keys(univByName).length);

    // 엑셀 컬럼 인덱스 (행 0,1: 헤더, 행 2부터: 데이터)
    const COL = {
        region: 0,              // 지역
        univName: 1,            // 대학명
        admissionType: 2,       // 전형유형
        recruitmentGroup: 3,    // 모집군
        generalField: 4,        // 계열
        detailedField: 5,       // 상세계열
        recruitmentName: 6,     // 모집단위명
        recruitmentNumber: 7,   // 모집인원
        selectionMethod: 8,     // 선발방식
        csatRatio: 9,           // 수능
        schoolRecordRatio: 10,  // 학생부
        interviewRatio: 11,     // 면접
        otherRatio: 12,         // 기타
        koreanScore: 24,        // 국어 반영비율
        mathScore: 25,          // 수학 반영비율
        researchScore: 29,      // 탐구 반영비율
        englishScore: 33,       // 영어 반영비율
        historyScore: 44,       // 한국사 반영비율
        minCut: 55,             // 최초컷
        maxCut: 57,             // 추합컷
        univCode: 84            // 대학코드
    };

    // 4. 기존 데이터 삭제 (2026년 데이터)
    console.log('\n=== 기존 2026년 데이터 삭제 ===');
    const deleteResult = await client.query(`DELETE FROM ts_regular_admissions WHERE year = 2026`);
    console.log('삭제된 행:', deleteResult.rowCount);

    // 5. 데이터 삽입
    console.log('\n=== 데이터 삽입 시작 ===');

    let matched = 0;
    let notMatched = 0;
    let inserted = 0;
    let errors = 0;
    const notMatchedUnivs = new Set();

    const parseRatio = (val) => {
        if (!val || val === '') return '0';
        return String(val);
    };

    const parseNumber = (val) => {
        if (!val || val === '') return null;
        const num = parseFloat(String(val).replace(/,/g, ''));
        return isNaN(num) ? null : num;
    };

    const parseInt2 = (val) => {
        if (!val || val === '') return null;
        const num = parseInt(String(val).replace(/,/g, ''), 10);
        return isNaN(num) ? null : num;
    };

    // 데이터 행 2부터 시작
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[COL.univName]) continue; // 대학명 없으면 skip

        const univCode = row[COL.univCode];
        const univName = row[COL.univName];

        // 대학 ID 찾기 (코드 우선, 이름 fallback)
        let universityId = univByCode[univCode] || univByName[univName];

        if (!universityId) {
            notMatched++;
            notMatchedUnivs.add(univName);
            continue;
        }
        matched++;

        try {
            const insertQuery = `
                INSERT INTO ts_regular_admissions (
                    year, university_id,
                    admission_name, admission_type,
                    general_field_name, detailed_fields,
                    recruitment_name, recruitment_number, selection_method,
                    csat_ratio, school_record_ratio, interview_ratio, other_ratio,
                    korean_reflection_score, math_reflection_score,
                    research_reflection_score, english_reflection_score,
                    korean_history_reflection_score,
                    min_cut, max_cut
                ) VALUES (
                    2026, $1,
                    $2, $3,
                    $4, $5,
                    $6, $7, $8,
                    $9, $10, $11, $12,
                    $13, $14,
                    $15, $16,
                    $17,
                    $18, $19
                )
            `;

            const values = [
                universityId,
                row[COL.recruitmentGroup] || '일반',  // admission_name (모집군)
                row[COL.admissionType] || '일반',     // admission_type (전형유형)
                row[COL.generalField] || '-',         // general_field_name (계열)
                row[COL.detailedField] || '-',        // detailed_fields (상세계열)
                row[COL.recruitmentName] || '-',      // recruitment_name (모집단위명)
                parseInt2(row[COL.recruitmentNumber]) || 0,  // recruitment_number
                row[COL.selectionMethod] || '-',      // selection_method
                parseRatio(row[COL.csatRatio]),       // csat_ratio
                parseRatio(row[COL.schoolRecordRatio]), // school_record_ratio
                parseRatio(row[COL.interviewRatio]),  // interview_ratio
                parseRatio(row[COL.otherRatio]),      // other_ratio
                parseNumber(row[COL.koreanScore]),    // korean_reflection_score
                parseNumber(row[COL.mathScore]),      // math_reflection_score
                parseNumber(row[COL.researchScore]),  // research_reflection_score
                parseNumber(row[COL.englishScore]),   // english_reflection_score
                parseNumber(row[COL.historyScore]),   // korean_history_reflection_score
                parseNumber(row[COL.minCut]),         // min_cut
                parseNumber(row[COL.maxCut])          // max_cut
            ];

            await client.query(insertQuery, values);
            inserted++;

            if (inserted % 500 === 0) {
                console.log(`진행률: ${inserted}/${matched} 행 삽입됨...`);
            }
        } catch (err) {
            errors++;
            if (errors <= 5) {
                console.error(`행 ${i} 에러:`, err.message);
                console.error('  대학:', univName, '코드:', univCode);
            }
        }
    }

    console.log('\n=== 결과 요약 ===');
    console.log('총 데이터 행:', data.length - 2);
    console.log('대학 매칭 성공:', matched);
    console.log('대학 매칭 실패:', notMatched);
    console.log('DB 삽입 성공:', inserted);
    console.log('DB 삽입 에러:', errors);

    if (notMatchedUnivs.size > 0) {
        console.log('\n=== 매칭 실패 대학 목록 ===');
        Array.from(notMatchedUnivs).sort().forEach(u => console.log('  -', u));
    }

    // 최종 확인
    const countResult = await client.query(`SELECT COUNT(*) FROM ts_regular_admissions WHERE year = 2026`);
    console.log('\n=== DB 최종 확인 ===');
    console.log('ts_regular_admissions 테이블 2026년 데이터:', countResult.rows[0].count, '행');

    // 엑셀 저장
    const newWs = XLSX.utils.aoa_to_sheet(data);
    wb.Sheets[wb.SheetNames[0]] = newWs;
    XLSX.writeFile(wb, 'uploads/26 정시 db 1209_fixed.xlsx');
    console.log('엑셀 파일 저장 완료');

    await client.end();
    console.log('\nDB 연결 종료');
}

main().catch(err => {
    console.error('에러 발생:', err);
    process.exit(1);
});
