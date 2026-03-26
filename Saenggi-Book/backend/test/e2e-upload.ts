
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:3000'; // Ensure this matches the running server port
const EMAIL = 'test24@test.com';
const PASSWORD = '123456';
const FILE_PATH = path.join(__dirname, '../uploads/25 수시 전교정.pdf');

async function runTest() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login/email`, {
            email: EMAIL,
            password: PASSWORD,
        });

        if (!loginRes.data || !loginRes.data.accessToken) {
            console.error('Login failed (no token):', loginRes.data);
            return;
        }

        const token = loginRes.data.accessToken;
        console.log('Login successful. Token acquired.');

        // 2. Upload File
        console.log(`Reading file: ${FILE_PATH}`);
        if (!fs.existsSync(FILE_PATH)) {
            console.error('File not found at:', FILE_PATH);
            return;
        }

        const fileStream = fs.createReadStream(FILE_PATH);
        const form = new FormData();
        form.append('file', fileStream);

        console.log('Uploading file to /schoolrecord/parse/pdf...');
        try {
            const uploadRes = await axios.post(`${BASE_URL}/schoolrecord/parse/pdf`, form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${token}`,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 300000 // 5 minutes (matching frontend)
            });

            console.log('Upload successful!');
            console.log('Response status:', uploadRes.status);
            console.log('Response data:', JSON.stringify(uploadRes.data, null, 2));

        } catch (uploadError: any) {
            if (uploadError.response) {
                console.error('Upload failed with status:', uploadError.response.status);
                console.error('Data:', uploadError.response.data);
            } else {
                console.error('Upload failed with error:', uploadError.message);
            }
        }

    } catch (error: any) {
        if (error.response) {
            console.error('Login failed with status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Test failed with error:', error.message);
        }
    }
}

runTest();
