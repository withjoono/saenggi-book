const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'geobukschool_dev.sqlite');
const db = sqlite3(dbPath);

console.log('Connected to database:', dbPath);

// 학업역량 (HAKUP) 문항
const hakupQuestions = [
  { content: '학업 성취도 및 학업 역량의 발전 가능성', order: 1, type: 'HAKUP' },
  { content: '교과 성적의 우수성 및 학업에 대한 열정', order: 2, type: 'HAKUP' },
  { content: '탐구활동 및 심화학습의 적극성', order: 3, type: 'HAKUP' },
  { content: '학업 태도 및 자기주도적 학습 능력', order: 4, type: 'HAKUP' },
  { content: '교과 세부능력 및 특기사항의 우수성', order: 5, type: 'HAKUP' },
];

// 진로역량 (JINRO) 문항
const jinroQuestions = [
  { content: '전공 적합성 및 진로 목표의 명확성', order: 6, type: 'JINRO' },
  { content: '관련 분야에 대한 관심과 탐구 활동', order: 7, type: 'JINRO' },
  { content: '진로 관련 독서 및 심화 활동', order: 8, type: 'JINRO' },
  { content: '진로 개발을 위한 노력 및 계획', order: 9, type: 'JINRO' },
  { content: '전공 분야에 대한 이해도 및 열정', order: 10, type: 'JINRO' },
];

// 공동체역량 (GONGDONG) 문항
const gongdongQuestions = [
  { content: '협력 및 소통 능력', order: 11, type: 'GONGDONG' },
  { content: '나눔과 배려 실천', order: 12, type: 'GONGDONG' },
  { content: '공동체 의식 및 시민 의식', order: 13, type: 'GONGDONG' },
  { content: '리더십 및 팔로워십', order: 14, type: 'GONGDONG' },
  { content: '봉사활동의 지속성 및 의미', order: 15, type: 'GONGDONG' },
];

// 기타역량 (ETC) 문항
const etcQuestions = [
  { content: '창의성 및 문제해결 능력', order: 16, type: 'ETC' },
  { content: '도전정신 및 성실성', order: 17, type: 'ETC' },
  { content: '특별한 재능 및 잠재력', order: 18, type: 'ETC' },
  { content: '인성 및 가치관', order: 19, type: 'ETC' },
  { content: '종합적인 발전 가능성', order: 20, type: 'ETC' },
];

const allQuestions = [...hakupQuestions, ...jinroQuestions, ...gongdongQuestions, ...etcQuestions];

// 기존 데이터 확인
const count = db.prepare('SELECT COUNT(*) as count FROM officer_bottom_survey_tb').get();
console.log('Existing survey questions:', count.count);

if (count.count === 0) {
  const insert = db.prepare(
    'INSERT INTO officer_bottom_survey_tb (evaluate_content, order_num, main_survey_type) VALUES (?, ?, ?)'
  );

  const insertMany = db.transaction((questions) => {
    for (const q of questions) {
      insert.run(q.content, q.order, q.type);
    }
  });

  insertMany(allQuestions);
  console.log('✅ Successfully inserted', allQuestions.length, 'survey questions');
} else {
  console.log('⚠️ Survey data already exists, skipping insert');
}

// 결과 확인
const result = db.prepare('SELECT * FROM officer_bottom_survey_tb ORDER BY order_num').all();
console.log('\n📋 Current survey questions:');
result.forEach(row => {
  console.log(`  ${row.id}. [${row.main_survey_type}] ${row.evaluate_content}`);
});

db.close();
console.log('\n✅ Database connection closed');
