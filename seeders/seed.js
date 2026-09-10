const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  try {
    console.log('🌱 Menjalankan Seeder Database BKN...');
    await db.initDatabase();

    // Check if user 'luthfi' exists
    const checkUser = await db.query('SELECT * FROM users WHERE username = $1', ['luthfi']);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // 1. Seed user 'adminbkn'
    const checkAdmin = await db.query('SELECT * FROM users WHERE username = $1', ['adminbkn']);
    if (checkAdmin.rows.length === 0) {
      await db.query(`
        INSERT INTO users (
          username, password_hash, full_name, nip, institution, division, mentor_name, logo_path, avatar_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        'adminbkn',
        passwordHash,
        'Administrator BKN',
        '',
        'Kantor Regional V BKN Jakarta',
        'Pranata Komputer & Administrator Sistem',
        'Kepala Kantor Regional V BKN',
        '/images/Logo_Badan_Kepegawaian_Negara.png',
        '/images/default_avatar.png'
      ]);
      console.log('✅ User default "adminbkn" berhasil dibuat!');
    } else {
      await db.query(`
        UPDATE users SET
          password_hash = $1,
          full_name = $2,
          nip = $3,
          institution = $4,
          division = $5,
          mentor_name = $6,
          logo_path = $7,
          avatar_path = $8
        WHERE username = $9
      `, [
        passwordHash,
        'Administrator BKN',
        '',
        'Kantor Regional V BKN Jakarta',
        'Pranata Komputer & Administrator Sistem',
        'Kepala Kantor Regional V BKN',
        '/images/Logo_Badan_Kepegawaian_Negara.png',
        '/images/default_avatar.png',
        'adminbkn'
      ]);
      console.log('ℹ️ User default "adminbkn" diperbarui.');
    }

    // 2. Also ensure user 'luthfi' exists
    if (checkUser.rows.length === 0) {
      await db.query(`
        INSERT INTO users (
          username, password_hash, full_name, nip, institution, division, mentor_name, logo_path, avatar_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        'luthfi',
        passwordHash,
        'Luthfi Arviandi',
        '',
        'Kantor Regional V BKN Jakarta',
        'Asisten Pengembang Sistem & Aplikasi Digital',
        'Wijaya Kusuma',
        '/images/Logo_Badan_Kepegawaian_Negara.png',
        '/images/default_avatar.png'
      ]);
      console.log('✅ User default "luthfi" berhasil dibuat!');
    } else {
      await db.query(`
        UPDATE users SET
          password_hash = $1,
          full_name = $2,
          nip = $3,
          institution = $4,
          division = $5,
          mentor_name = $6,
          logo_path = $7,
          avatar_path = $8
        WHERE username = $9
      `, [
        passwordHash,
        'Luthfi Arviandi',
        '',
        'Kantor Regional V BKN Jakarta',
        'Asisten Pengembang Sistem & Aplikasi Digital',
        'Wijaya Kusuma',
        '/images/Logo_Badan_Kepegawaian_Negara.png',
        '/images/default_avatar.png',
        'luthfi'
      ]);
      console.log('ℹ️ User default "luthfi" diperbarui.');
    }

    // Insert a sample infographic record if none exists for user
    const userRes = await db.query('SELECT id FROM users WHERE username = $1', ['luthfi']);
    const userId = userRes.rows[0].id;

    const sampleMetrics = [];
    const samplePillars = [
      {
        title: 'Transformasi & Modernisasi Digital',
        items: [
          'Otomatisasi generator infografis monitoring layanan kepegawaian',
          'Integrasi SSO dan restrukturisasi basis data profil pegawai BKN',
          'Penyempurnaan arsitektur microservices pelaporan berkala'
        ]
      },
      {
        title: 'Optimalisasi Layanan Kepegawaian',
        items: [
          'Sinkronisasi verifikasi berkas kenaikan pangkat dan pensiun',
          'Konsolidasi data ASN lintas instansi se-Wilayah Kerja Kanreg V',
          'Monitoring kepuasan pengguna layanan e-SK BKN'
        ]
      }
    ];

    const sampleTableRows = [
      { komponen: 'Modul Autentikasi & Sesi', pic: 'Admin BKN', status: 'Selesai', target: '100%', ket: 'Session express & bcrypt' },
      { komponen: 'Binding Data Profil Otomatis', pic: 'Admin BKN', status: 'Selesai', target: '100%', ket: 'Pre-filled dari database' },
      { komponen: 'Panel Live Preview Infografis', pic: 'Admin BKN', status: 'Selesai', target: '100%', ket: 'Dynamic DOM rendering' },
      { komponen: 'Ekspor Dokumen Beresolusi Tinggi', pic: 'Admin BKN', status: 'Selesai', target: '100%', ket: 'Print & PDF ready' }
    ];

    const checkInfo = await db.query('SELECT * FROM infographics WHERE user_id = $1', [userId]);
    if (checkInfo.rows.length === 0) {

      await db.query(`
        INSERT INTO infographics (
          user_id, report_title, report_subtitle, report_date, metrics_data, pillars_data, table_rows, visual_evidence
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        userId,
        'Laporan Kinerja Harian & Progress Inovasi Digital',
        'Kantor Regional V Badan Kepegawaian Negara',
        '2026-09-10',
        JSON.stringify(sampleMetrics),
        JSON.stringify(samplePillars),
        JSON.stringify(sampleTableRows),
        JSON.stringify([])
      ]);
      console.log('✅ Infografis contoh berhasil dibuat!');
    } else {
      // Update existing sample infographic to empty metrics
      await db.query(`UPDATE infographics SET metrics_data = '[]' WHERE user_id = $1`, [userId]);
    }

    // Ensure sample infographic for adminbkn
    const adminRes = await db.query('SELECT id FROM users WHERE username = $1', ['adminbkn']);
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id;
      const checkAdminInfo = await db.query('SELECT * FROM infographics WHERE user_id = $1', [adminId]);
      if (checkAdminInfo.rows.length === 0) {
        await db.query(`
          INSERT INTO infographics (
            user_id, report_title, report_subtitle, report_date, metrics_data, pillars_data, table_rows, visual_evidence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          adminId,
          'Laporan Kinerja Harian & Inovasi Layanan Kepegawaian',
          'Kantor Regional V Badan Kepegawaian Negara',
          '2026-09-10',
          JSON.stringify([]),
          JSON.stringify(samplePillars),
          JSON.stringify(sampleTableRows),
          JSON.stringify([])
        ]);
      }
    }

    console.log('🎉 Seeding selesai! Kredensial default:');
    console.log('   Username: adminbkn');
    console.log('   Password: [Tersimpan Aman]');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat seeding:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
