import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const res1 = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "saenggiview"."sv_ai_evaluation"`);
    console.log("saenggiview.sv_ai_evaluation exists! Count:", res1);
  } catch (err) {
    console.error("Error for saenggiview.sv_ai_evaluation:", err.message);
  }

  try {
    const res2 = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "public"."sv_ai_evaluation"`);
    console.log("public.sv_ai_evaluation exists! Count:", res2);
  } catch (err) {
    console.error("Error for public.sv_ai_evaluation:", err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
