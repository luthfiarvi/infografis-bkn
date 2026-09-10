const db = require('../config/database');
const aiService = require('../services/aiService');

const infographicController = {
  // GET /generator & /dashboard
  getGenerator: async (req, res) => {
    try {
      // Find latest saved infographic for this user as initial dynamic state, or use defaults
      const latestRes = await db.query(
        'SELECT * FROM infographics WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );

      const latestDoc = latestRes.rows[0] || null;

      // Default date format Indonesian
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('id-ID', options);
      const isoDate = today.toISOString().split('T')[0];

      res.render('index', {
        title: 'Generator Infografis BKN - Panel Otomatis',
        user: req.user,
        defaultMeta: {
          nama: req.user.full_name,
          instansi: req.user.institution,
          divisi: req.user.division,
          mentor: req.user.mentor_name,
          logo: req.user.logo_path || '/images/Logo_Badan_Kepegawaian_Negara.png',
          avatar: req.user.avatar_path || '/images/default_avatar.png'
        },
        initialData: latestDoc ? {
          id: latestDoc.id,
          reportTitle: latestDoc.report_title,
          reportSubtitle: latestDoc.report_subtitle,
          reportDate: latestDoc.report_date,
          metrics: typeof latestDoc.metrics_data === 'string' ? JSON.parse(latestDoc.metrics_data) : latestDoc.metrics_data,
          pillars: typeof latestDoc.pillars_data === 'string' ? JSON.parse(latestDoc.pillars_data) : latestDoc.pillars_data,
          tableRows: typeof latestDoc.table_rows === 'string' ? JSON.parse(latestDoc.table_rows) : latestDoc.table_rows,
          visualEvidence: latestDoc.visual_evidence ? (typeof latestDoc.visual_evidence === 'string' ? JSON.parse(latestDoc.visual_evidence) : latestDoc.visual_evidence) : []
        } : {
          id: null,
          reportTitle: 'Laporan Kinerja Harian & Inovasi Layanan Kepegawaian',
          reportSubtitle: req.user.institution,
          reportDate: isoDate,
          metrics: [],
          pillars: [
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
          ],
          tableRows: [
            { komponen: 'Modul Autentikasi & Sesi', pic: req.user.full_name, status: 'Selesai', target: '100%', ket: 'Session express & bcrypt' },
            { komponen: 'Binding Data Profil Otomatis', pic: req.user.full_name, status: 'Selesai', target: '100%', ket: 'Pre-filled dari database' },
            { komponen: 'Panel Live Preview Infografis', pic: req.user.full_name, status: 'Selesai', target: '100%', ket: 'Dynamic DOM rendering' },
            { komponen: 'Ekspor Dokumen Beresolusi Tinggi', pic: req.user.full_name, status: 'Selesai', target: '100%', ket: 'Print & PDF ready' }
          ],
          visualEvidence: []
        }
      });
    } catch (err) {
      console.error('Generator view error:', err);
      res.status(500).send('Terjadi kesalahan internal server.');
    }
  },

  // POST /api/infographics (Save / Update)
  saveInfographic: async (req, res) => {
    try {
      const { id, title, subtitle, date, metrics, pillars, tableRows, visualEvidence } = req.body;

      if (!title || !date) {
        return res.status(400).json({
          success: false,
          message: 'Judul laporan dan tanggal wajib diisi.'
        });
      }

      // Format payloads for JSONB
      const metricsData = JSON.stringify(Array.isArray(metrics) ? metrics : []);
      const pillarsData = JSON.stringify(Array.isArray(pillars) ? pillars : []);
      const rowsData = JSON.stringify(Array.isArray(tableRows) ? tableRows : []);
      const evidenceData = JSON.stringify(Array.isArray(visualEvidence) ? visualEvidence : []);

      let savedId;
      if (id) {
        // Update existing only if owned by current user
        const check = await db.query('SELECT id FROM infographics WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (check.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan atau bukan milik Anda.' });
        }

        await db.query(`
          UPDATE infographics SET
            report_title = $1,
            report_subtitle = $2,
            report_date = $3,
            metrics_data = $4,
            pillars_data = $5,
            table_rows = $6,
            visual_evidence = $7
          WHERE id = $8 AND user_id = $9
        `, [title, subtitle || '', date, metricsData, pillarsData, rowsData, evidenceData, id, req.user.id]);
        savedId = id;
      } else {
        // Insert new record tied to user_id
        const insertRes = await db.query(`
          INSERT INTO infographics (
            user_id, report_title, report_subtitle, report_date, metrics_data, pillars_data, table_rows, visual_evidence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `, [req.user.id, title, subtitle || '', date, metricsData, pillarsData, rowsData, evidenceData]);

        savedId = insertRes.rows[0]?.id || insertRes.lastID;
      }

      return res.json({
        success: true,
        message: 'Infografis berhasil disimpan ke riwayat dokumen!',
        id: savedId
      });
    } catch (err) {
      console.error('Save infographic error:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan infografis: ' + err.message
      });
    }
  },

  // GET /history
  getHistory: async (req, res) => {
    try {
      const result = await db.query(
        'SELECT id, report_title, report_subtitle, report_date, created_at FROM infographics WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );

      const notulenResult = await db.query(
        'SELECT id, title, meeting_date, meeting_time, meeting_place, created_at FROM notulen WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );

      res.render('history', {
        title: 'Arsip Dokumen BKN - Infografis & Notulen',
        user: req.user,
        infographics: result.rows,
        notulen: notulenResult.rows
      });
    } catch (err) {
      console.error('History view error:', err);
      res.redirect('/portal?error=Gagal+memuat+arsip+dokumen');
    }
  },

  // GET /preview/:id (Standalone printable preview)
  getPreview: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT i.*, u.full_name, u.nip, u.institution, u.division, u.mentor_name, u.logo_path, u.avatar_path
         FROM infographics i
         JOIN users u ON i.user_id = u.id
         WHERE i.id = $1 AND (i.user_id = $2 OR u.id = $2)`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).send('Dokumen infografis tidak ditemukan.');
      }

      const info = result.rows[0];
      const metrics = typeof info.metrics_data === 'string' ? JSON.parse(info.metrics_data) : info.metrics_data;
      const pillars = typeof info.pillars_data === 'string' ? JSON.parse(info.pillars_data) : info.pillars_data;
      const tableRows = typeof info.table_rows === 'string' ? JSON.parse(info.table_rows) : info.table_rows;
      const visualEvidence = info.visual_evidence
        ? (typeof info.visual_evidence === 'string' ? JSON.parse(info.visual_evidence) : info.visual_evidence)
        : [];

      // Indonesian date formatting
      const dateObj = new Date(info.report_date);
      const dateFormatted = !isNaN(dateObj)
        ? dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : info.report_date;

      res.render('preview', {
        title: `${info.report_title} - Infografis BKN`,
        user: req.user,
        doc: {
          ...info,
          dateFormatted,
          metrics,
          pillars,
          tableRows,
          visualEvidence
        }
      });
    } catch (err) {
      console.error('Preview error:', err);
      res.status(500).send('Gagal memuat pratinjau infografis.');
    }
  },

  // POST /api/upload-evidence (Upload Foto Bukti Visual)
  uploadEvidenceFile: (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah.' });
      }
      const fileUrl = '/uploads/evidence/' + req.file.filename;
      return res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname
      });
    } catch (err) {
      console.error('Upload evidence error:', err);
      return res.status(500).json({ success: false, message: 'Gagal mengunggah foto bukti visual: ' + err.message });
    }
  },

  // POST /api/ai-generate (Single-Prompt AI Extractor)
  aiGenerate: async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || !rawText.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Teks laporan harian belum diisi.'
        });
      }

      const structuredData = await aiService.generateInfographicFromText(rawText, req.user);
      return res.json({
        success: true,
        message: 'Infografis berhasil disusun secara otomatis oleh AI!',
        data: structuredData
      });
    } catch (err) {
      console.error('AI Generate Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal memproses laporan dengan AI: ' + err.message
      });
    }
  },

  // DELETE /api/infographics/:id
  deleteInfographic: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM infographics WHERE id = $1 AND user_id = $2', [id, req.user.id]);
      res.json({ success: true, message: 'Infografis berhasil dihapus.' });
    } catch (err) {
      console.error('Delete infographic error:', err);
      res.status(500).json({ success: false, message: 'Gagal menghapus dokumen.' });
    }
  },

  // GET /portal
  getPortal: async (req, res) => {
    try {
      res.render('portal', {
        title: 'Portal Dokumen & Layanan Digital - BKN',
        user: req.user
      });
    } catch (err) {
      console.error('Portal error:', err);
      res.redirect('/generator');
    }
  },

  // GET /notulen
  getNotulen: async (req, res) => {
    try {
      res.render('notulen', {
        title: 'Pembuat Notulen Rapat Kedinasan - BKN',
        user: req.user
      });
    } catch (err) {
      console.error('Notulen error:', err);
      res.redirect('/portal');
    }
  }
};

module.exports = infographicController;
