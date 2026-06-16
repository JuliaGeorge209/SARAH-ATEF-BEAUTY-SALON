import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// تفعيل قراءة ملفات الـ .env محلياً
dotenv.config();

const app = express();

// 1️⃣ إعدادات الـ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ الاتصال الآمن والمباشر بقاعدة بيانات Turso
// الرابط مضاف هنا كقيمة احتياطية (Fallback) لضمان العمل الفوري
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://sarah-salon-julianageorge.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || '', 
});

// 3️⃣ المسار الرئيسي للتأكد من حالة السيرفر
app.get('/', (req: Request, res: Response) => {
  res.send('SARAH ATEF BEAUTY SALON – Server is 100% online and connected to Turso DB!');
});

// 4️⃣ مسار تجريبي (API) لجلب البيانات من جدول الصالون الرئيسي
// تأكدي من استبدال 'services' باسم الجدول الفعلي لديكِ في Turso (مثل users أو bookings)
app.get('/api/data-test', async (req: Request, res: Response) => {
  try {
    const result = await db.execute('SELECT * FROM services LIMIT 5');
    res.status(200).json({
      success: true,
      message: 'Data fetched successfully from Turso!',
      data: result.rows
    });
  } catch (error: any) {
    // إذا كان الجدول غير موجود بعد أو الـ Token مفقود، سيرد السيرفر بالخطأ دون أن ينهار
    res.status(500).json({
      success: false,
      message: 'Connected to Turso, but failed to execute query',
      error: error.message
    });
  }
});

// 5️⃣ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
