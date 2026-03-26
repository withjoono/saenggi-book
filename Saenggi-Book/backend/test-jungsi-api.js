const jwt = require('jsonwebtoken');
const http = require('http');

// Generate JWT token for member_id=3 (h61442409@gmail.com)
// Secret is base64 encoded
const secretBase64 = '04ca023b39512e46d0c2cf4b48d5aac61d34302994c87ed4eff225dcf3b0a218739f3897051a057f9b846a69ea2927a587044164b7bae5e1306219d50b588cb1';
const secret = Buffer.from(secretBase64, 'base64');

const token = jwt.sign(
  { sub: 'ATK', jti: 3 },  // member_id=3 as number
  secret,
  { algorithm: 'HS512', expiresIn: '2h' }
);

console.log('Token:', token.substring(0, 50) + '...');

// Test API
const options = {
  hostname: 'localhost',
  port: 4001,
  path: '/jungsi/scores',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\nStatus:', res.statusCode);
    try {
      const json = JSON.parse(data);
      if (json.data && Array.isArray(json.data)) {
        console.log('Response: 성공! 데이터 수:', json.data.length);
        if (json.data.length > 0) {
          console.log('첫 번째 항목:', JSON.stringify(json.data[0], null, 2).substring(0, 300));
        }
      } else {
        console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
      }
    } catch(e) {
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => console.log('Error:', e.message));
req.end();
