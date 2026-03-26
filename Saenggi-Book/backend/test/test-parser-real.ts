
import { ConfigService } from '@nestjs/config';
import { AiPdfParserService } from '../src/modules/schoolrecord/parsers/ai-pdf-parser.service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Try loading env files manually since we are not using NestJS ConfigModule here
dotenv.config({ path: path.join(__dirname, '../.env.development') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY not found in process.env!');
        console.log('Checking current directory:', process.cwd());
        // console.log('Env variables keys:', Object.keys(process.env)); 
        return;
    }
    console.log('API Key found (length):', apiKey.length);

    // Mock ConfigService
    const configService = {
        get: (key: string) => {
            if (key === 'OPENAI_API_KEY') return apiKey;
            return null;
        }
    } as unknown as ConfigService;

    const parser = new AiPdfParserService(configService);

    const filePath = path.join(__dirname, '../uploads/25 수시 전교정.pdf');
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }
    console.log(`Reading file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);

    try {
        console.log('Parsing PDF (this calls OpenAI)...');
        // Increase timeout if possible, though it's handled inside the service via OpenAI client defaults or overrides
        const result = await parser.parse(buffer);
        console.log('Parsing success!');
        console.log('Result Subject Count:', result.subjectLearnings.length);
        console.log('Result Select Subject Count:', result.selectSubjects.length);
        console.log('First 3 subjects:', JSON.stringify(result.subjectLearnings.slice(0, 3), null, 2));
    } catch (e) {
        console.error('Error during parsing:', e);
    }
}
run();
