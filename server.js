require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/database');
const seed = require('./seeders/seed');

const authRouter = require('./routes/authRouter');
const infographicRouter = require('./routes/infographicRouter');

const app = express();
const PORT = process.env.PORT || 3000;

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser & Static Assets
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'bkn_session_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true
  }
}));

// Global user variable for all views
app.use((req, res, next) => {
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  next();
});

// Routes
app.use('/', authRouter);
app.use('/', infographicRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Halaman tidak ditemukan (404). Silakan kembali ke <a href="/generator">Dashboard</a>.');
});

// Server Initialization
async function startServer() {
  try {
    await db.initDatabase();
    // Run seed to ensure default account exists
    await seed();

    app.listen(PORT, () => {
      console.log(`🚀 Automated Infographic Generator BKN aktif di http://localhost:${PORT}`);
      console.log(`🔐 Akun Default: luthfi | Password: admin123`);
    });
  } catch (err) {
    console.error('❌ Gagal menjalankan server:', err);
    process.exit(1);
  }
}

startServer();
