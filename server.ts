import express, { Request, Response } from 'express';
import path from 'path';

// 1️⃣ هنا المشكلة! تأكدي من استدعاء الـ Router الخاص بكِ من مساره الصحيح:
// (عدّلي المسار 'path-to-your-salonRouter' حسب المجلد المكتوب فيه الملف عندكِ، مثلاً './routes/salon')
import salonRouter from './routes/salon'; 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// المسار الرئيسي لحل مشكلة Cannot GET /
app.get('/', (req: Request, res: Response) => {
  res.send('SARAH ATEF BEAUTY SALON – Production Server is running successfully!');
});

// 2️⃣ هنا يتم استخدام الراوتر بعد عمل import له فوق
app.use('/api/salon', salonRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
