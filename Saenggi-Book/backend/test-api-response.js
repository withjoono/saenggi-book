const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.get('http://localhost:4001/susi/kyokwa/step1', {
      params: { year: 2025, basicType: '일반' }
    });
    
    const items = response.data.items;
    console.log('Total items:', items.length);
    
    // general_type.name 분포 확인
    const nameDistribution = {};
    items.forEach(item => {
      const name = item.general_type?.name;
      const key = name === null ? 'NULL' : name === '' ? 'EMPTY_STRING' : name;
      nameDistribution[key] = (nameDistribution[key] || 0) + 1;
    });
    
    console.log('\n=== general_type.name 분포 ===');
    Object.entries(nameDistribution).forEach(([key, count]) => {
      console.log(`"${key}": ${count}개`);
    });
    
    // 샘플 데이터 출력
    console.log('\n=== 첫 3개 샘플 ===');
    items.slice(0, 3).forEach((item, idx) => {
      console.log(`\n[${idx}]:`, JSON.stringify({
        university: item.university?.name,
        admission: item.name,
        general_type: item.general_type,
        min_cut: item.min_cut,
        max_cut: item.max_cut,
      }, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
