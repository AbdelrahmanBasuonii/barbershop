const express = require('express'), http = require('http'), fs = require('fs'), path = require('path');
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), multer = require('multer');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { StateStore } = require('./state-store');
const { Server } = require('socket.io');
const SECRET = process.env.JWT_SECRET || 'change-me-in-production';
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || SECRET === 'change-me-in-production'))
  throw new Error('Production requires a JWT_SECRET with at least 32 characters.');
const RESET_TOKEN_TTL = 30 * 60 * 1000;
const APP_URL = (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
if (process.env.NODE_ENV === 'production' && !process.env.APP_URL)
  throw new Error('Production requires APP_URL so password reset links point to the deployed frontend.');
if (process.env.NODE_ENV === 'production' && (!RESEND_API_KEY || !EMAIL_FROM))
  throw new Error('Production requires RESEND_API_KEY and EMAIL_FROM so password reset emails can be sent.');
const allowedOrigins = new Set((process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean));
if (process.env.NODE_ENV === 'production' && !allowedOrigins.size)
  throw new Error('Production requires CORS_ORIGINS with the deployed frontend origin.');
const isOriginAllowed = origin => !origin || process.env.NODE_ENV !== 'production' || allowedOrigins.has(origin);
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const MEDIA_BUCKET = 'barbershop-media';
if (process.env.NODE_ENV === 'production' && (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY))
  throw new Error('Production requires DATABASE_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.');
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
const DATA_DIR = process.env.DATA_DIR || __dirname;
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'data.json');
const store = new StateStore({ databaseUrl: DATABASE_URL, localFile: DB_FILE });
const app = express(), server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      callback(new Error('Socket origin is not allowed.'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!isOriginAllowed(origin)) return res.status(403).json({ error: 'مصدر الطلب غير مسموح.' });
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));
const DIST = path.join(__dirname, 'client', 'dist');
app.use(express.static(DIST));

// ---------- قاعدة بيانات بسيطة (ملف JSON) ----------
let db = {
  users: [], bookings: [], gallery: [], videos: [], chats: {},
  settings: { name: 'محل الحلاقة', address: 'اكتب عنوان المحل هنا', phone: '01000000000', mapUrl: '',
    openTime: '10:00', closeTime: '22:00', slotMinutes: 30, offDays: [5] },
  services: [{ id: 1, name: 'قص شعر', price: 100 }, { id: 2, name: 'حلاقة دقن', price: 60 }, { id: 3, name: 'قص + دقن', price: 150 }]
};
if (!Array.isArray(db.passwordResetTokens)) db.passwordResetTokens = [];
const save = () => store.save(db);
const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const pub = u => ({ id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role });
const passwordResetRequests = new Map();

// ---------- صلاحيات ----------
const auth = (req, res, next) => {
  try { const p = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    req.user = db.users.find(u => u.id === p.id);
    if (!req.user || (req.user.tokenVersion || 0) !== (p.version || 0)) throw 0;
    next();
  } catch { res.status(401).json({ error: 'سجّل الدخول أولاً' }); }
};
const admin = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'للأدمن فقط' });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const uploadFile = kind => (req, res, next) => upload.single('file')(req, res, error => {
  if (error) return next(error);
  if (req.file && !req.file.mimetype.startsWith(kind === 'gallery' ? 'image/' : 'video/'))
    return res.status(400).json({ error: kind === 'gallery' ? 'ارفع ملف صورة صالح.' : 'ارفع ملف فيديو صالح.' });
  next();
});
const uploadMedia = async (kind, file) => {
  const extension = path.extname(file.originalname).replace(/[^.a-zA-Z0-9]/g, '').slice(0, 12);
  const name = `${crypto.randomUUID()}${extension}`;
  if (!supabase) {
    fs.writeFileSync(path.join(UPLOADS_DIR, name), file.buffer);
    return { url: `/uploads/${name}`, storagePath: null };
  }
  const storagePath = `${kind}/${name}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  });
  if (error) throw error;
  return { url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl, storagePath };
};
const removeMedia = async storagePath => {
  if (!storagePath || !supabase) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
  if (error) throw error;
};
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const ensureMediaBucket = async () => {
  if (!supabase) return;
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  const existingBucket = buckets.find(bucket => bucket.name === MEDIA_BUCKET);
  if (existingBucket) {
    const { error: updateError } = await supabase.storage.updateBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: '50MiB'
    });
    if (updateError) throw updateError;
    return;
  }
  const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: '50MiB'
  });
  if (createError) throw createError;
};

// ---------- تسجيل / دخول ----------
app.post('/api/register', asyncRoute(async (req, res) => {
  const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim().replace(/\s+/g, ' ') : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  const { password } = req.body;
  if (fullName.split(/\s+/).filter(Boolean).length < 2) return res.status(400).json({ error: 'اكتب الاسم بالكامل' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'الإيميل غير صحيح' });
  if (!/^[0-9+]{10,15}$/.test(phone)) return res.status(400).json({ error: 'رقم التليفون غير صحيح' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'الباسورد 8 أحرف على الأقل' });
  if (db.users.some(u => u.email === email)) return res.status(409).json({ error: 'الإيميل مسجّل من قبل' });
  const u = { id: uid(), role: 'customer', fullName, email, phone,
    password: bcrypt.hashSync(password, 10), tokenVersion: 0, createdAt: new Date() };
  db.users.push(u);
  await save();
  res.json({ token: jwt.sign({ id: u.id, version: u.tokenVersion }, SECRET, { expiresIn: '30d' }), user: pub(u) });
}));
app.post('/api/login', (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const u = db.users.find(x => x.email === email);
  if (!u || !bcrypt.compareSync(req.body.password || '', u.password)) return res.status(401).json({ error: 'الإيميل أو الباسورد غلط' });
  res.json({ token: jwt.sign({ id: u.id, version: u.tokenVersion || 0 }, SECRET, { expiresIn: '30d' }), user: pub(u) });
});
app.post('/api/password-reset/request', asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'اكتب بريدًا إلكترونيًا صحيحًا.' });
  if (!RESEND_API_KEY || !EMAIL_FROM) return res.status(503).json({ error: 'خدمة البريد غير مهيأة. أضف RESEND_API_KEY وEMAIL_FROM للخادم أولاً.' });

  const now = Date.now();
  const ip = req.ip;
  const recentRequests = (passwordResetRequests.get(ip) || []).filter(time => now - time < 15 * 60 * 1000);
  if (recentRequests.length >= 5) return res.status(429).json({ error: 'طلبات كثيرة. حاول مرة أخرى بعد 15 دقيقة.' });
  passwordResetRequests.set(ip, [...recentRequests, now]);

  const user = db.users.find(account => account.email === email && account.role === 'customer');
  if (!user) return res.json({ message: 'لو البريد مسجل عندنا، هيوصلك رابط إعادة تعيين كلمة المرور.' });

  db.passwordResetTokens = db.passwordResetTokens.filter(token => token.userId !== user.id && token.expiresAt > now);
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  db.passwordResetTokens.push({ userId: user.id, tokenHash, expiresAt: now + RESET_TOKEN_TTL });
  await save();

  const resetUrl = new URL('/reset-password', APP_URL);
  resetUrl.searchParams.set('token', token);
  const escapedResetUrl = resetUrl.href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [user.email],
        subject: 'إعادة تعيين كلمة مرور حسابك',
        text: `مرحباً ${user.fullName}،\n\nلإعادة تعيين كلمة المرور افتح الرابط التالي خلال 30 دقيقة:\n${resetUrl.href}\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة.`,
        html: `<p>مرحباً ${user.fullName.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])}،</p><p>لإعادة تعيين كلمة المرور اضغط على الرابط التالي. الرابط صالح لمدة 30 دقيقة ولمرة واحدة:</p><p><a href="${escapedResetUrl}">إعادة تعيين كلمة المرور</a></p><p>إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>`
      })
    });
    if (!response.ok) throw new Error(`Resend API returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
  } catch (error) {
    db.passwordResetTokens = db.passwordResetTokens.filter(item => item.tokenHash !== tokenHash);
    await save();
    console.error('Password reset email delivery failed:', error.message);
    return res.status(503).json({ error: 'تعذر إرسال رسالة إعادة التعيين الآن. حاول مرة أخرى لاحقًا.' });
  }
  res.json({ message: 'لو البريد مسجل عندنا، هيوصلك رابط إعادة تعيين كلمة المرور.' });
}));
app.post('/api/password-reset/confirm', asyncRoute(async (req, res) => {
  const token = typeof req.body.token === 'string' ? req.body.token : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!token || !/^[\da-f]{64}$/i.test(token)) return res.status(400).json({ error: 'رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطًا جديدًا.' });
  if (password.length < 8) return res.status(400).json({ error: 'الباسورد 8 أحرف على الأقل.' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const resetRequest = db.passwordResetTokens.find(item => item.tokenHash === tokenHash);
  if (!resetRequest || resetRequest.expiresAt <= Date.now()) {
    if (resetRequest) {
      db.passwordResetTokens = db.passwordResetTokens.filter(item => item.tokenHash !== tokenHash);
      await save();
    }
    return res.status(400).json({ error: 'رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطًا جديدًا.' });
  }

  const user = db.users.find(account => account.id === resetRequest.userId && account.role === 'customer');
  if (!user) return res.status(400).json({ error: 'رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطًا جديدًا.' });
  user.password = bcrypt.hashSync(password, 10);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  db.passwordResetTokens = db.passwordResetTokens.filter(item => item.userId !== user.id);
  await save();
  res.json({ message: 'تم تغيير كلمة المرور. سجل الدخول بكلمة المرور الجديدة.' });
}));
app.get('/api/me', auth, (req, res) => res.json(pub(req.user)));

// ---------- محتوى عام ----------
app.get('/api/public', (req, res) => res.json({ settings: db.settings, services: db.services, gallery: db.gallery, videos: db.videos }));
const slotsFor = date => {
  const s = db.settings, out = [], toM = t => +t.split(':')[0] * 60 + +t.split(':')[1];
  if (s.offDays.includes(new Date(date).getDay())) return [];
  for (let m = toM(s.openTime); m + s.slotMinutes <= toM(s.closeTime); m += s.slotMinutes)
    out.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
  const taken = db.bookings.filter(b => b.date === date && b.status !== 'cancelled').map(b => b.time);
  return out.map(t => ({ time: t, free: !taken.includes(t) }));
};
app.get('/api/slots', (req, res) => res.json(slotsFor(req.query.date)));

// ---------- الحجوزات ----------
app.post('/api/bookings', auth, asyncRoute(async (req, res) => {
  const { date, time, serviceId } = req.body, svc = db.services.find(s => s.id == serviceId);
  if (!svc || !slotsFor(date).some(s => s.time === time && s.free)) return res.status(400).json({ error: 'الميعاد غير متاح' });
  const b = { id: uid(), userId: req.user.id, date, time, service: svc.name, price: svc.price, status: 'pending', createdAt: new Date() };
  db.bookings.push(b);
  await save();
  io.to('admins').emit('booking', b);
  res.json(b);
}));
app.get('/api/bookings/mine', auth, (req, res) => res.json(db.bookings.filter(b => b.userId === req.user.id)));
app.delete('/api/bookings/:id', auth, asyncRoute(async (req, res) => {
  const b = db.bookings.find(x => x.id == req.params.id && x.userId === req.user.id);
  if (!b) return res.status(404).end();
  b.status = 'cancelled';
  await save();
  res.json(b);
}));

// ---------- الأدمن ----------
const A = express.Router(); A.use(auth, admin); app.use('/api/admin', A);
A.get('/stats', (req, res) => {
  const today = new Date().toISOString().slice(0, 10), ok = db.bookings.filter(b => b.status !== 'cancelled');
  res.json({ customers: db.users.filter(u => u.role === 'customer').length, bookings: db.bookings.length,
    today: ok.filter(b => b.date === today).length, pending: db.bookings.filter(b => b.status === 'pending').length,
    revenue: db.bookings.filter(b => b.status === 'done').reduce((a, b) => a + b.price, 0) });
});
A.get('/customers', (req, res) => res.json(db.users.filter(u => u.role === 'customer').map(u => ({ ...pub(u), createdAt: u.createdAt,
  bookings: db.bookings.filter(b => b.userId === u.id).length }))));
A.get('/bookings', (req, res) => res.json(db.bookings.map(b => ({ ...b, customer: pub(db.users.find(u => u.id === b.userId) || {}) }))
  .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))));
A.patch('/bookings/:id', asyncRoute(async (req, res) => {
  const b = db.bookings.find(x => x.id == req.params.id);
  if (!b) return res.status(404).end();
  b.status = req.body.status;
  await save();
  res.json(b);
}));
A.post('/gallery', uploadFile('gallery'), asyncRoute(async (req, res) => {
  const media = req.file ? await uploadMedia('gallery', req.file) : null;
  const g = { id: uid(), title: req.body.title || '', url: media?.url || req.body.url, storagePath: media?.storagePath || null };
  db.gallery.push(g);
  await save();
  res.json(g);
}));
A.post('/videos', uploadFile('videos'), asyncRoute(async (req, res) => {
  const media = req.file ? await uploadMedia('videos', req.file) : null;
  const v = { id: uid(), title: req.body.title || '', url: media?.url || req.body.url, storagePath: media?.storagePath || null };
  db.videos.push(v);
  await save();
  res.json(v);
}));
A.delete('/:kind(gallery|videos)/:id', asyncRoute(async (req, res) => {
  const kind = req.params.kind;
  const item = db[kind].find(value => value.id == req.params.id);
  if (!item) return res.status(404).end();
  await removeMedia(item.storagePath);
  db[kind] = db[kind].filter(value => value.id != req.params.id);
  await save();
  res.json({ ok: 1 });
}));
A.put('/settings', asyncRoute(async (req, res) => {
  db.settings = { ...db.settings, ...req.body.settings };
  if (req.body.services) db.services = req.body.services;
  await save();
  res.json({ ok: 1 });
}));
A.get('/chats', (req, res) => res.json(Object.entries(db.chats).map(([id, msgs]) => ({ user: pub(db.users.find(u => u.id == id) || {}), msgs }))));

// ---------- الشات (بوت تلقائي لحد ما الأدمن يرد) ----------
const botReply = t => {
  if (/سعر|بكام|اسعار|أسعار/.test(t)) return 'الأسعار: ' + db.services.map(s => `${s.name} ${s.price} ج`).join(' - ');
  if (/عنوان|فين|مكان|لوكيشن/.test(t)) return 'عنواننا: ' + db.settings.address;
  if (/ميعاد|مواعيد|فاتح|بتفتح|تقفل/.test(t)) return `بنفتح من ${db.settings.openTime} لـ ${db.settings.closeTime}`;
  if (/حجز|احجز/.test(t)) return 'تقدر تحجز من قسم "احجز دورك" في الموقع بعد تسجيل الدخول.';
  if (/رقم|تليفون|اتصال/.test(t)) return 'رقمنا: ' + db.settings.phone;
  return 'أهلاً بيك! اسألني عن الأسعار أو العنوان أو المواعيد، أو استنى لحد ما حد من الفريق يرد عليك.';
};
io.use((s, next) => { try {
  const p = jwt.verify(s.handshake.auth.token, SECRET);
  s.user = db.users.find(u => u.id === p.id);
  if (!s.user || (s.user.tokenVersion || 0) !== (p.version || 0)) throw new Error('auth');
  next();
} catch { next(new Error('auth')); } });
io.on('connection', s => {
  const u = s.user; if (!u) return;
  if (u.role === 'admin') s.join('admins'); else { s.join('u' + u.id); s.emit('history', db.chats[u.id] || []); }
  const push = async (uidv, m) => {
    (db.chats[uidv] = db.chats[uidv] || []).push(m);
    await save();
    io.to('u' + uidv).to('admins').emit('msg', { userId: uidv, ...m });
  };
  const handleChatError = error => {
    console.error('Chat message persistence failed:', error.message);
    s.emit('chat:error', { error: 'تعذر حفظ الرسالة. حاول مرة أخرى.' });
  };
  s.on('say', async text => {
    if (u.role === 'admin') return;
    const message = String(text).slice(0, 500);
    try {
      await push(u.id, { from: 'user', text: message, at: Date.now() });
    } catch (error) {
      return handleChatError(error);
    }
    const last = [...(db.chats[u.id] || [])].reverse().find(m => m.from === 'admin');
    if (!last || Date.now() - last.at > 30 * 60 * 1000)
      setTimeout(() => push(u.id, { from: 'bot', text: botReply(message), at: Date.now() }).catch(handleChatError), 600);
  });
  s.on('reply', ({ userId, text }) => {
    if (u.role === 'admin') push(userId, { from: 'admin', text: String(text).slice(0, 500), at: Date.now() }).catch(handleChatError);
  });
});

// أي رابط مش API يرجع لتطبيق React
app.get('*', (req, res, next) => /^\/(api|uploads|socket\.io)/.test(req.path) ? next() : res.sendFile(path.join(DIST, 'index.html')));

app.use((error, req, res, next) => {
  console.error('Request failed:', error.message);
  if (res.headersSent) return next(error);
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'حجم الملف أكبر من الحد المسموح (50 ميجابايت).' });
  res.status(500).json({ error: 'حصل خطأ أثناء معالجة الطلب.' });
});

async function start() {
  db = await store.initialize(db);
  if (!Array.isArray(db.passwordResetTokens)) db.passwordResetTokens = [];
  if (!db.users.some(user => user.role === 'admin')) {
    if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12))
      throw new Error('Production requires ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters for the initial admin account.');
    db.users.push({
      id: Date.now(),
      role: 'admin',
      fullName: 'الأدمن',
      email: process.env.ADMIN_EMAIL || 'admin@barber.com',
      phone: '00000000000',
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@12345', 10),
      tokenVersion: 0,
      createdAt: new Date()
    });
    await save();
  }
  await ensureMediaBucket();
  server.listen(process.env.PORT || 3000, () => console.log('http://localhost:' + (process.env.PORT || 3000)));
}

start().catch(async error => {
  console.error('Application startup failed:', error.message);
  await store.close();
  process.exitCode = 1;
});
