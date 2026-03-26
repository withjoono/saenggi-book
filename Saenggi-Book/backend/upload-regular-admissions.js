const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadRegularAdmissions() {
  try {
    // 1. 먼저 로그인해서 토큰 받기
    console.log('🔐 test2@test.com 로그인 중...');
    const loginResponse = await fetch('http://localhost:4001/auth/login/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@test.com',
        password: 'test1234',
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`로그인 실패: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ 로그인 성공');
    const accessToken = loginData.data.accessToken;
    console.log('🔑 토큰:', accessToken.substring(0, 50) + '...');

    // 2. 파일 업로드
    console.log('\n📤 엑셀 파일 업로드 중...');
    const filePath = path.join(__dirname, 'uploads', '25 정시 1205 out 2.xlsx');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const uploadResponse = await fetch('http://localhost:4001/core/regular-admission/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`업로드 실패: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ 업로드 성공:', result);

    // 3. 데이터 확인
    console.log('\n📊 데이터 확인 중...');
    const checkResponse = await fetch('http://localhost:4001/core/regular-admission', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const admissions = await checkResponse.json();
    console.log(`✅ 총 ${admissions.length}개의 정시 전형 데이터가 저장되었습니다!`);

    if (admissions.length > 0) {
      console.log('\n샘플 데이터:');
      console.log(JSON.stringify(admissions[0], null, 2));
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error.stack);
  }
}

uploadRegularAdmissions();
