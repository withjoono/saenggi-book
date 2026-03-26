const http = require('http');

const loginData = JSON.stringify({email: 'test@test.com', password: 'test1234'});

const loginOptions = {
  hostname: 'localhost',
  port: 4001,
  path: '/auth/login/email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const result = JSON.parse(body);
    if (!result.success) {
      console.log('Login failed:', result.message);
      return;
    }
    const token = result.data.accessToken;
    console.log('Login successful!');

    const data = JSON.stringify({
      mockExamScores: [
        {subjectCategory: 'kor', subjectName: '국어', standardScore: '131', grade: 2, percentile: 94},
        {subjectCategory: 'math', subjectName: '미적', standardScore: '137', grade: 1, percentile: 96},
        {subjectCategory: 'eng', subjectName: '영어', standardScore: '0', grade: 2, percentile: 0},
        {subjectCategory: 'history', subjectName: '한국사', standardScore: '0', grade: 3, percentile: 0},
        {subjectCategory: 'science', subjectName: '물리학 Ⅰ', standardScore: '68', grade: 2, percentile: 93},
        {subjectCategory: 'science', subjectName: '화학 Ⅰ', standardScore: '65', grade: 2, percentile: 90}
      ]
    });

    const options = {
      hostname: 'localhost',
      port: 4001,
      path: '/jungsi/calculate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        const result2 = JSON.parse(body2);
        console.log('\nStatus:', res2.statusCode);
        console.log('Success:', result2.success);

        if (result2.data) {
          console.log('Total:', result2.data.totalUniversities);
          console.log('Success:', result2.data.successCount);
          console.log('Failed:', result2.data.failedCount);

          if (result2.data.scores) {
            // Show successful scores
            const successScores = result2.data.scores.filter(s => s.success);
            if (successScores.length > 0) {
              console.log('\n=== First 5 Successful Scores ===');
              successScores.slice(0, 5).forEach((score, i) => {
                console.log('\n--- Score', i+1, '---');
                console.log('University:', score.universityName);
                console.log('Recruitment:', score.recruitmentName);
                console.log('Major:', score.major);
                console.log('Converted Score:', score.convertedScore);
                console.log('Standard Score Sum:', score.standardScoreSum);
                console.log('Optimal Score:', score.optimalScore);
                console.log('Score Difference:', score.scoreDifference);
                console.log('Min Cut:', score.minCut);
                console.log('Max Cut:', score.maxCut);
                console.log('Risk Score:', score.riskScore);
              });
            }

            // Show failure reasons
            const failedScores = result2.data.scores.filter(s => !s.success);
            if (failedScores.length > 0) {
              const reasons = {};
              failedScores.forEach(s => {
                const reason = s.result || 'unknown';
                reasons[reason] = (reasons[reason] || 0) + 1;
              });
              console.log('\n=== Failure Reasons ===');
              Object.entries(reasons).sort((a,b) => b[1]-a[1]).slice(0, 5).forEach(([reason, count]) => {
                console.log(count + 'x: ' + reason);
              });
            }
          }
        } else {
          console.log('Error:', result2.message);
        }
      });
    });

    req.write(data);
    req.end();
  });
});

loginReq.write(loginData);
loginReq.end();
