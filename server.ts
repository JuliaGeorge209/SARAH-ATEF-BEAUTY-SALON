import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

// التحقق من وجود الروابط لمنع الـ Crash أثناء التشغيل
if (!process.env.TURSO_DATABASE_URL) {
  console.error("Warning: TURSO_DATABASE_URL is missing!");
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://sarah-salon-julianageorge.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});
