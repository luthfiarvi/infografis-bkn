# Automated Infographic Generator - Badan Kepegawaian Negara (BKN)

Aplikasi berbasis web untuk otomasi penyusunan, visualisasi, dan ekspor laporan kinerja harian pegawai Badan Kepegawaian Negara (BKN) dalam format infografis eksekutif berstandar resmi.

---

## ✨ Fitur Utama

1. **Sistem Autentikasi & Manajemen Profil Pegawai**:
   - Pendaftaran akun pegawai dan login aman (enkripsi kata sandi menggunakan `bcryptjs`).
   - Manajemen profil pegawai dilengkapi unggah foto diri (`avatar`).
   - Auto-binding otomatis data pegawai (Nama, Jabatan/Divisi, Instansi, Pembimbing, dan Foto Profil) ke seluruh lembar infografis.

2. **Asisten AI Penyusun Infografis (Single-Input Assistant)**:
   - Pengguna cukup mengetik atau menempelkan satu paragraf catatan pekerjaan harian bebas.
   - AI otomatis mengekstrak judul, tanggal, pilar aktivitas prioritas, serta rincian tabel matriks capaian kegiatan.
   - Dilengkapi fallback cerdas *Smart Local Semantic Engine* yang selalu bekerja tanpa hambatan kuota API.

3. **Formulir Interaktif & Live Preview Real-Time**:
   - Pembaruan seketika (*zero-latency preview*) saat mengetik data laporan.
   - Pilar aktivitas utama (Inovasi Digital & Layanan Kepegawaian).
   - Matriks implementasi komponen pekerjaan dengan status badge dan target output.

4. **Bukti Visual & Dokumentasi Kegiatan**:
   - Formulir unggah foto dokumentasi kegiatan lapangan, rapat, atau tangkapan layar sistem.
   - Kolom caption keterangan foto dan galeri terstruktur di dalam kartu infografis.

5. **Desain Eksekutif BKN & Multi-Format Export**:
   - Standar desain resmi: Gradasi Royal Navy BKN, aksen pita keemasan ganda (*double gold ribbon*), dan stempel verifikasi elektronik.
   - **Cetak / Unduh PDF**: Optimalisasi kertas A4 portrait penuh dengan pewarnaan tajam (`print-color-adjust: exact`).
   - **Unduh PNG HD**: Pengekspor gambar beresolusi tinggi (skala retina 2x via `html2canvas`) siap dibagikan ke pesan instan atau media sosial.

6. **Dual Database Engine (PostgreSQL & SQLite Fallback)**:
   - Terhubung langsung dengan basis data **PostgreSQL** untuk kebutuhan hosting dan produksi.
   - Otomatis beralih ke **SQLite lokal** jika koneksi PostgreSQL tidak tersedia.

---

## 🚀 Panduan Memulai (Instalasi & Penggunaan)

### 1. Klon Repositori
```bash
git clone https://github.com/luthfiarvi/infografis-bkn.git
cd infografis-bkn
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi database Anda di dalam `.env`:
```env
PORT=3000
SESSION_SECRET=bkn_secret_key_session_secure_2026_jakarta

# Konfigurasi Database PostgreSQL
USE_POSTGRES=true
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bkn_infografis
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bkn_infografis

# Google Gemini API Key (Opsional)
GEMINI_API_KEY=
```

### 4. Menjalankan Server
```bash
npm start
# atau menggunakan nodemon untuk mode pengembangan:
npm run dev
```

Buka peramban dan akses:
```
http://localhost:3000
```

Kredensial bawaan (*default seeder*):
- **Username**: `luthfi`
- **Password**: `admin123`

---

## 📁 Struktur Direktori Proyek

```
appinfografis/
├── config/             # Konfigurasi koneksi database (PostgreSQL & SQLite)
├── controllers/        # Logika aplikasi (Auth & Infographic Controller)
├── middleware/         # Middleware sesi autentikasi & upload berkas (Multer)
├── public/             # Berkas aset statis
│   ├── css/            # Lembar gaya (style.css, infographic.css)
│   ├── images/         # Logo resmi BKN & aset grafis bawaan
│   ├── js/             # Skrip interaktif sisi klien (generator.js)
│   └── uploads/        # Direktori unggahan foto profil & bukti visual
├── routes/             # Rute URL aplikasi (authRouter, infographicRouter)
├── seeders/            # Pengisian data awal otomatis (seed.js)
├── services/           # Layanan AI (aiService.js)
├── views/              # Template antarmuka EJS
│   ├── layouts/        # Header, navbar, dan footer bersama
│   ├── index.ejs       # Halaman utama generator & live preview
│   ├── login.ejs       # Halaman login
│   ├── register.ejs    # Halaman registrasi pegawai
│   ├── profile.ejs     # Manajemen profil pegawai
│   ├── history.ejs     # Arsip riwayat dokumen infografis
│   └── preview.ejs     # Lembar pratinjau cetak resmi mandiri
├── server.js           # Berkas utama Express server
├── schema.sql          # Skema basis data SQL
└── package.json        # Dependensi dan skrip proyek
```

---

## 📜 Lisensi
Aplikasi ini dikembangkan untuk standarisasi pelaporan kinerja dan modernisasi transformasi digital di lingkungan Kantor Regional V Badan Kepegawaian Negara (BKN).
