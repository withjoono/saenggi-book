const XLSX = require('xlsx');
const { Client } = require('pg');

async function uploadToDB(config, dbName) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`${dbName} 업로드 시작`);
    console.log('='.repeat(50));

    // 1. 엑셀 파일 읽기
    const wb = XLSX.readFile('uploads/26 정시 db 1209_fixed.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // 2. DB 연결
    const client = new Client(config);

    try {
        await client.connect();
        console.log('DB 연결 성공');
    } catch (err) {
        console.error('DB 연결 실패:', err.message);
        return;
    }

    // 3. 대학 코드 매핑 조회
    const univResult = await client.query('SELECT id, code, name FROM ts_universities');
    const univByCode = {};
    const univByName = {};

    univResult.rows.forEach(row => {
        if (row.code) univByCode[row.code] = row.id;
        if (row.name) univByName[row.name] = row.id;
    });

    console.log('대학 코드 매핑:', Object.keys(univByCode).length + '개');

    // 엑셀 컬럼 인덱스
    const COL = {
        region: 0, univName: 1, admissionType: 2, recruitmentGroup: 3,
        generalField: 4, detailedField: 5, recruitmentName: 6,
        recruitmentNumber: 7, selectionMethod: 8,
        csatRatio: 9, schoolRecordRatio: 10, interviewRatio: 11, otherRatio: 12,
        koreanScore: 18, mathScore: 19, englishScore: 20, researchScore: 21,
        historyScore: 22, minCut: 55, maxCut: 57, univCode: 84
    };

    // 4. 기존 데이터 삭제
    const deleteResult = await client.query(`DELETE FROM ts_regular_admissions WHERE year = 2026`);
    console.log('기존 2026년 데이터 삭제:', deleteResult.rowCount + '행');

    // 5. 데이터 삽입
    let matched = 0, notMatched = 0, inserted = 0, errors = 0;

    const parseRatio = (val) => (!val || val === '') ? '0' : String(val);
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

    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[COL.univName]) continue;

        const univCode = row[COL.univCode];
        const univName = row[COL.univName];
        let universityId = univByCode[univCode] || univByName[univName];

        if (!universityId) {
            notMatched++;
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
                    2026, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18, $19
                )
            `;

            const values = [
                universityId,
                row[COL.recruitmentGroup] || '일반',
                row[COL.admissionType] || '일반',
                row[COL.generalField] || '-',
                row[COL.detailedField] || '-',
                row[COL.recruitmentName] || '-',
                parseInt2(row[COL.recruitmentNumber]) || 0,
                row[COL.selectionMethod] || '-',
                parseRatio(row[COL.csatRatio]),
                parseRatio(row[COL.schoolRecordRatio]),
                parseRatio(row[COL.interviewRatio]),
                parseRatio(row[COL.otherRatio]),
                parseNumber(row[COL.koreanScore]),
                parseNumber(row[COL.mathScore]),
                parseNumber(row[COL.researchScore]),
                parseNumber(row[COL.englishScore]),
                parseNumber(row[COL.historyScore]),
                parseNumber(row[COL.minCut]),
                parseNumber(row[COL.maxCut])
            ];

            await client.query(insertQuery, values);
            inserted++;

            if (inserted % 1000 === 0) {
                console.log(`진행: ${inserted}행 삽입됨...`);
            }
        } catch (err) {
            errors++;
            if (errors <= 3) {
                console.error(`행 ${i} 에러:`, err.message);
            }
        }
    }

    // 최종 확인
    const countResult = await client.query(`SELECT COUNT(*) FROM ts_regular_admissions WHERE year = 2026`);

    console.log('\n=== 결과 ===');
    console.log('대학 매칭 성공:', matched);
    console.log('대학 매칭 실패:', notMatched);
    console.log('DB 삽입 성공:', inserted);
    console.log('DB 삽입 에러:', errors);
    console.log('DB 2026년 데이터:', countResult.rows[0].count + '행');

    await client.end();
    console.log(`${dbName} 완료!`);
}

async function main() {
    // 로컬 DB
    await uploadToDB({
        host: '127.0.0.1',
        port: 5432,
        user: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_dev'
    }, '로컬 DB (geobukschool_dev)');

    // 클라우드 DB (Cloud SQL)
    await uploadToDB({
        host: '34.64.165.158',
        port: 5432,
        user: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_prod',
        ssl: false
    }, '클라우드 DB (geobukschool_prod)');

    console.log('\n✅ 모든 업로드 완료!');
}

main().catch(err => {
    console.error('에러:', err);
    process.exit(1);
});
