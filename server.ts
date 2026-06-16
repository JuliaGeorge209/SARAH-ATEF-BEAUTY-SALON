import express, { Request, Response } from 'express';
import path from 'path';
// قم بإضافة أي مكتبات أخرى تستخدمها هنا (مثل cors أو dotenv أو turso/libsql)

// 1. تعريف الـ app أولاً في البداية لضمان عدم حدوث خطأ Block-scoped
const app = express();

// 2. إعدادات الـ Middleware الأساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إذا كان لديك مجلد للملفات الثابتة مثل الواجهة الأمامية (Frontend)
// app.use(express.static(path.join(__dirname, 'public')));

// 3. المسار الرئيسي (Root Route) لحل مشكلة Cannot GET /
app.get('/', (req: Request, res: Response) => {
  res.send('SARAH ATEF BEAUTY SALON – Production Server is running successfully!');
  // أو إذا كنت تريد عرض ملف Admin.html مباشرة عند فتح الرابط:
  // res.sendFile(path.join(__dirname, 'public', 'Admin.html'));
});

// 4. هنا تضع باقي مسارات الـ API الخاصة بمشروعك (مثل الروابط الخاصة بـ Turso DB أو Express Routes)
// مثال:
app.use('/api/salon', salonRouter);
app.use(express.json());
// 5. تشغيل السيرفر (تأكد من استخدام المنفذ الذي تحدده Vercel تلقائياً أو 3000 للمحلي)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
