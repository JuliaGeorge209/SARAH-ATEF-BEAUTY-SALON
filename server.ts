import express, { Request, Response } from 'express';

// 1. تعريف السيرفر
const app = express();

// 2. البرمجيات الوسيطة لقراءة البيانات
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. المسار الرئيسي (يرد مباشرة لتجربة نجاح السيرفر)
app.get('/', (req: Request, res: Response) => {
  res.send('SARAH ATEF BEAUTY SALON – Server is 100% online and running perfectly!');
});

// 4. تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
