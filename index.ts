import express, { Request, Response } from 'express';
import { createClient } from '@libsql/client';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد الاتصال بقاعدة بيانات Turso
// ملحوظة: يفضل مستقبلاً وضع هذه القيم في Environment Variables (ملف .env)
const db = createClient({
  url: "libsql://sarah-salon-julianageorge.aws-ap-northeast-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN, // الـ Token السري اللي بتجيبيه من حسابك في Turso
});

// 1. تجربة السيرفر والـ DB
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // أمر تجريبي للتأكد من أن الاتصال شغال
    const result = await db.execute("SELECT datetime('now');");
    res.status(200).json({ 
      success: true, 
      message: "Connected to Turso Database successfully!",
      time: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. مثال لطريقة جلب بيانات (مثلاً جدول الخدمات أو الحجوزات)
app.get('/api/services', async (req: Request, res: Response) => {
  try {
    // استبدلي 'services' باسم الجدول الحقيقي عندك في Turso
    const result = await db.execute("SELECT * FROM services;"); 
    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;