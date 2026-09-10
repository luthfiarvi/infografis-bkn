-- ==========================================================
-- SKEMA BASIS DATA APLIKASI INFOGRAFIS BKN (POSTGRESQL)
-- Siap diimpor ke pgAdmin / DBeaver / Supabase / Neon / Cloud VPS
-- ==========================================================

-- 1. Tabel users (Akun Pegawai & Profil Sesi)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    institution VARCHAR(255) NOT NULL DEFAULT 'Kantor Regional V BKN Jakarta',
    division VARCHAR(255) NOT NULL,
    mentor_name VARCHAR(255),
    logo_path VARCHAR(255) DEFAULT '/images/Logo_Badan_Kepegawaian_Negara.png',
    avatar_path VARCHAR(255) DEFAULT '/images/default_avatar.svg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel infographics (Dokumen Laporan & Riwayat Arsip)
CREATE TABLE IF NOT EXISTS infographics (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    report_title VARCHAR(255) NOT NULL,
    report_subtitle VARCHAR(255),
    report_date DATE NOT NULL,
    metrics_data JSONB NOT NULL,
    pillars_data JSONB NOT NULL,
    table_rows JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeks performa pencarian dokumen per pengguna
CREATE INDEX IF NOT EXISTS idx_infographics_user_id ON infographics(user_id);
CREATE INDEX IF NOT EXISTS idx_infographics_report_date ON infographics(report_date);

-- 3. Tabel notulen (Dokumen Notulensi Rapat & Risalah Kedinasan)
CREATE TABLE IF NOT EXISTS notulen (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time VARCHAR(100) NOT NULL,
    meeting_place VARCHAR(255) NOT NULL,
    agenda_data JSONB NOT NULL DEFAULT '[]',
    attendees_data JSONB NOT NULL DEFAULT '[]',
    activities_data JSONB NOT NULL DEFAULT '[]',
    action_items JSONB NOT NULL DEFAULT '[]',
    conclusions JSONB NOT NULL DEFAULT '[]',
    closing_text TEXT,
    documentation_photos JSONB DEFAULT '[]',
    notulis_name VARCHAR(255),
    notulis_role VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notulen_user_id ON notulen(user_id);
CREATE INDEX IF NOT EXISTS idx_notulen_meeting_date ON notulen(meeting_date);
