/**
 * SARAH ATEF BEAUTY SALON — Vercel Serverless API
 * Turso (libsql) + Express | Bookings | Admin | Email
 */

import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@libsql/client';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()
      || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= max) {
      return res.status(429).json({ error: 'طلبات كثيرة جداً. انتظري قليلاً.' });
    }
    entry.count++;
    next();
  };
}

// ─── TURSO DATABASE ───────────────────────────────────────────────────────────
// URL is fixed. Only TURSO_TOKEN needs to be added in Vercel env vars.
const TURSO_URL = 'libsql://sarah-salon-julianageorge.aws-ap-northeast-1.turso.io';

function getDB() {
  const authToken = process.env.TURSO_TOKEN;
  if (!authToken) throw new Error('TURSO_TOKEN is not set in environment variables.');
  return createClient({ url: TURSO_URL, authToken });
}

async function ensureTable() {
  const db = getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      phone       TEXT    NOT NULL,
      service     TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      time        TEXT    NOT NULL,
      note        TEXT    DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'confirmed',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

// ─── SALON CONFIG ─────────────────────────────────────────────────────────────
const ALLOWED_SERVICES = new Set([
  'جل أظافر (Gel Polish)',
  'هارد جل أظافر (Hard Gel Set)',
  'تريتمنت أظافر (Nail Treatment)',
  'جل أظافر قدم (Gel Polish Toenails)',
  'رموش كلاسيك (Classic Lashes)',
  'رموش هايبريد (Hybrid Lashes)',
  'رموش فوليوم (Volume Lashes)',
  'ميكروبليدنج حواجب (Microblading Brows)',
]);

const ALL_SLOTS = [
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function isValidDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d + 'T12:00:00').getTime());
}
function isSunday(d: string): boolean {
  return new Date(d + 'T12:00:00').getDay() === 0;
}
function isPast(d: string): boolean {
  const sel = new Date(d + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return sel < today;
}
function clean(s: unknown): string {
  if (typeof s !== 'string') return '';
  return s.trim().replace(/[<>]/g, '');
}

// ─── EMAIL ────────────────────────────────────────────────────────────────────
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function notifyOwner(booking: any) {
  const t = getTransporter();
  if (!t || !process.env.OWNER_EMAIL) return;
  try {
    await t.sendMail({
      from: `"Sarah Atef Salon" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `حجز جديد #SAB-${booking.id} — ${booking.name}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff0f7;padding:30px;border-radius:15px;">
          <h2 style="color:#e91e8c;text-align:center;">✦ صالون سارة عاطف ✦</h2>
          <h3 style="text-align:center;">حجز جديد #SAB-${booking.id}</h3>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <tr><td style="padding:8px;color:#7a6570;font-weight:bold;">الاسم:</td><td>${booking.name}</td></tr>
            <tr style="background:#fff"><td style="padding:8px;color:#7a6570;font-weight:bold;">التليفون:</td><td style="direction:ltr">${booking.phone}</td></tr>
            <tr><td style="padding:8px;color:#7a6570;font-weight:bold;">الخدمة:</td><td>${booking.service}</td></tr>
            <tr style="background:#fff"><td style="padding:8px;color:#7a6570;font-weight:bold;">التاريخ:</td><td>${booking.date}</td></tr>
            <tr><td style="padding:8px;color:#7a6570;font-weight:bold;">الوقت:</td><td style="direction:ltr">${booking.time}</td></tr>
            ${booking.note ? `<tr style="background:#fff"><td style="padding:8px;color:#7a6570;font-weight:bold;">ملاحظات:</td><td>${booking.note}</td></tr>` : ''}
          </table>
        </div>`,
    });
  } catch (e) {
    console.error('[Email error]', e);
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/api/available-slots', async (req: Request, res: Response) => {
  const date = String(req.query.date || '');
  if (!isValidDate(date)) return res.status(400).json({ error: 'تاريخ غير صحيح.', slots: [] });
  if (isSunday(date))     return res.status(400).json({ error: 'الأحد إجازة.', slots: [] });
  if (isPast(date))       return res.status(400).json({ error: 'لا يمكن الحجز في تواريخ سابقة.', slots: [] });

  try {
    const db = getDB();
    const result = await db.execute({
      sql: `SELECT time FROM bookings WHERE date = ? AND status != 'canceled'`,
      args: [date],
    });
    const bookedSet = new Set(result.rows.map((r: any) => r.time));
    const available = ALL_SLOTS.filter(s => !bookedSet.has(s));
    return res.json({ slots: available, date });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'خطأ في السيرفر.', slots: [] });
  }
});

app.post('/api/bookings', rateLimit(8, 60 * 60 * 1000), async (req: Request, res: Response) => {
  const name    = clean(req.body.name);
  const phone   = clean(req.body.phone);
  const service = clean(req.body.service);
  const date    = clean(req.body.date);
  const time    = clean(req.body.time);
  const note    = clean(req.body.note);

  if (!name || name.length < 2)                       return res.status(400).json({ error: 'الاسم مطلوب.' });
  if (!phone || !/^[0-9+\s\-()]{7,20}$/.test(phone))  return res.status(400).json({ error: 'رقم تليفون غير صحيح.' });
  if (!ALLOWED_SERVICES.has(service))                  return res.status(400).json({ error: 'خدمة غير صحيحة.' });
  if (!isValidDate(date))                              return res.status(400).json({ error: 'تاريخ غير صحيح.' });
  if (isSunday(date))                                  return res.status(400).json({ error: 'الأحد إجازة.' });
  if (isPast(date))                                    return res.status(400).json({ error: 'لا يمكن الحجز في تواريخ سابقة.' });
  if (!ALL_SLOTS.includes(time))                       return res.status(400).json({ error: 'وقت غير صحيح.' });

  try {
    await ensureTable();
    const db = getDB();

    const check = await db.execute({
      sql: `SELECT id FROM bookings WHERE date = ? AND time = ? AND status != 'canceled'`,
      args: [date, time],
    });
    if (check.rows.length > 0) {
      return res.status(409).json({ error: 'الموعد محجوز. اختاري وقتاً آخر.' });
    }

    const insert = await db.execute({
      sql: `INSERT INTO bookings (name, phone, service, date, time, note, status) VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      args: [name, phone, service, date, time, note || ''],
    });

    const booking = {
      id: Number(insert.lastInsertRowid),
      name, phone, service, date, time,
      note: note || '', status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    notifyOwner(booking);

    return res.status(201).json({ success: true, booking });
  } catch (e: any) {
    console.error('[Booking Error]', e);
    return res.status(500).json({ error: 'خطأ في السيرفر. حاولي مرة أخرى.' });
  }
});

app.post('/api/admin/login', async (req: Request, res: Response) => {
  const pin = String(req.body.pin || '').trim();
  if (!pin || pin !== (process.env.OWNER_PIN || '1234')) {
    return res.status(401).json({ error: 'PIN غير صحيح.' });
  }

  try {
    await ensureTable();
    const db = getDB();
    const result = await db.execute(`SELECT * FROM bookings ORDER BY date ASC, time ASC`);
    return res.json({ success: true, bookings: result.rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'خطأ في السيرفر.' });
  }
});

app.post('/api/bookings/:id/status', async (req: Request, res: Response) => {
  const id     = parseInt(req.params.id, 10);
  const pin    = String(req.body.pin || '').trim();
  const status = String(req.body.status || '').trim();

  if (!pin || pin !== (process.env.OWNER_PIN || '1234')) return res.status(401).json({ error: 'غير مصرح.' });
  if (!['confirmed', 'canceled', 'pending'].includes(status)) return res.status(400).json({ error: 'حالة غير صحيحة.' });
  if (isNaN(id)) return res.status(400).json({ error: 'ID غير صحيح.' });

  try {
    const db = getDB();
    const check = await db.execute({ sql: `SELECT id FROM bookings WHERE id = ?`, args: [id] });
    if (check.rows.length === 0) return res.status(404).json({ error: 'الحجز غير موجود.' });

    await db.execute({ sql: `UPDATE bookings SET status = ? WHERE id = ?`, args: [status, id] });
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'خطأ في السيرفر.' });
  }
});

export default app;
