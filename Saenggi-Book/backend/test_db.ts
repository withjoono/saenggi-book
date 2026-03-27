import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'susi_calculation_formula'
    `;
    console.log("Table info:", result);
  } catch (error) {
    console.error("Prisma Error:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
