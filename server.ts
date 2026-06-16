/**
 * SARAH ATEF BEAUTY SALON — Production Server
 * Turso (libsql) + Express | Perfect Alignment with Admin.html
 */

import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@libsql/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل الـ CORS والـ JSON Middleware لضمان استقبال البيانات
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// حماية وإعدادات الأمان الأساسية
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// ─── DATABASE CONFIGURATION ──────────────────────────────────────────────────
function getDB() {
  const url = process.env.TURSO_DATABASE_URL || "libsql://sarah-salon-julianageorge.aws-ap-northeast-1.turso.io";
  const token = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, authToken: token });
}

async function ensureTable() {
  try {
    const db = getDB();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        note TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    console.error("Database initialization error:", e);
  }
}

// ─── API ROUTES (Matched perfectly with admin.html) ──────────────────────────

// 1. استقبال حجز جديد من الـ Landing Page
app.post('/api/bookings/new', async (req: Request, res: Response) => {
  const { name, phone, service, date, time, note } = req.body;
  if (!name || !phone || !service || !date || !time) {
    return res.status(400).json({ error: 'جميع الحقول الأساسية مطلوبة.' });
  }

  try {
    await ensureTable();
    const db = getDB();
    await db.execute({
      sql: `INSERT INTO bookings (name, phone, service, date, time, note, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      args: [name, phone, service, date, time, note || '']
    });

    return res.json({ success: true, message: 'تم استلام طلب الحجز بنجاح.' });
  } catch (e: any) {
    console.error("Error creating booking:", e);
    return res.status(500).json({ error: 'حدث خطأ أثناء الحفظ في قاعدة البيانات.' });
  }
});

// 2. تسجيل دخول الآدمن وجلب الحجوزات (مطابق تماماً لـ السطر 228 و 252 في admin.html)
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const pin = String(req.body.pin || '').trim();
  const targetPin = String(process.env.OWNER_PIN || '1234').trim();

  if (!pin || pin !== targetPin) {
    return res.status(401).json({ error: 'رمز الأمان (PIN) غير صحيح!' });
  }

  try {
    await ensureTable();
    const db = getDB();
    const result = await db.execute(`SELECT * FROM bookings ORDER BY date ASC, time ASC`);
    
    // الـ admin.html متوقع يجيله { bookings: [...] } في حالة النجاح
    return res.json({ success: true, bookings: result.rows });
  } catch (e) {
    console.error("Error fetching admin bookings:", e);
    return res.status(500).json({ error: 'حدث خطأ في السيرفر أثناء جلب البيانات.' });
  }
});

// 3. تحديث حالة الحجز (مطابق تماماً لـ السطر 316 في admin.html)
app.post('/api/bookings/:id/status', async (req: Request, res: Response) => {
  const id     = parseInt(req.params.id, 10);
  const pin    = String(req.body.pin || '').trim();
  const status = String(req.body.status || '').trim();
  const targetPin = String(process.env.OWNER_PIN || '1234').trim();

  if (!pin || pin !== targetPin) {
    return res.status(401).json({ error: 'غير مصرح للقيام بهذا الإجراء.' });
  }
  if (!['confirmed', 'canceled', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'حالة الحجز غير صحيحة.' });
  }
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID الحجز غير صحيح.' });
  }

  try {
    const db = getDB();
    await db.execute({
      sql: `UPDATE bookings SET status = ? WHERE id = ?`,
      args: [status, id]
    });
    return res.json({ success: true });
  } catch (e) {
    console.error("Error updating status:", e);
    return res.status(500).json({ error: 'حدث خطأ في السيرفر.' });
  }
});

// ─── START LOCAL SERVER ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌸 Sarah Atef Salon Server is running on: http://localhost:${PORT}`);
});

export default app;