const db = require('../config/database');
const aiService = require('../services/aiService');

const notulenController = {
  // GET /notulen
  getNotulenGenerator: async (req, res) => {
    try {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('id-ID', options);
      const isoDate = today.toISOString().split('T')[0];

      // Ambil notulen terbaru user ini jika ada
      const latestRes = await db.query(
        'SELECT * FROM notulen WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      const latestDoc = latestRes.rows[0] || null;

      // Sample template data jika belum ada dokumen tersimpan
      const defaultData = latestDoc ? {
        id: latestDoc.id,
        title: latestDoc.title,
        meetingDate: latestDoc.meeting_date,
        formattedDate: formattedDate,
        meetingTime: latestDoc.meeting_time,
        meetingPlace: latestDoc.meeting_place,
        agenda: typeof latestDoc.agenda_data === 'string' ? JSON.parse(latestDoc.agenda_data) : latestDoc.agenda_data,
        attendees: typeof latestDoc.attendees_data === 'string' ? JSON.parse(latestDoc.attendees_data) : latestDoc.attendees_data,
        activities: typeof latestDoc.activities_data === 'string' ? JSON.parse(latestDoc.activities_data) : latestDoc.activities_data,
        actionItems: typeof latestDoc.action_items === 'string' ? JSON.parse(latestDoc.action_items) : latestDoc.action_items,
        conclusions: typeof latestDoc.conclusions === 'string' ? JSON.parse(latestDoc.conclusions) : latestDoc.conclusions,
        closingText: latestDoc.closing_text,
        notulisName: latestDoc.notulis_name || req.user.full_name,
        notulisRole: latestDoc.notulis_role || req.user.division
      } : {
        id: null,
        title: 'BKN MENYAPA ASN : Penguatan Implementasi Manajemen Talenta melalui SIMATA dan MyASN',
        meetingDate: isoDate,
        formattedDate: formattedDate,
        meetingTime: '09.00 – 11.30 WIB',
        meetingPlace: 'Daring melalui Zoom Meeting',
        agenda: [
          'Mengikuti kegiatan BKN Menyapa ASN dengan tema penguatan implementasi manajemen talenta melalui SIMATAdan MyASN.',
          'Mendengarkan sambutan dan arahan Kepala BKN mengenai urgensi manajemen talenta, meritokrasi, integritas, dan penempatan talenta sesuai kebutuhan organisasi.',
          'Mendengarkan paparan mengenai pengelolaan talenta berbasis data, pengukuran kinerja dan potensi, serta pemanfaatan ekosistem data yang terintegrasi.',
          'Mendengarkan paparan dan demo layanan MyASN/SIMATA, termasuk cara melihat kotak talenta dan melakukan pemutakhiran data.',
          'Mengikuti sesi tanya jawab mengenai pemutakhiran data, penghargaan, sertifikasi, penugasan tim, umpan balik 360, visibilitas kotak talenta, serta implementasi manajemen talenta di instansi.',
          'Mencatat arahan dan tindak lanjut bagi ASN serta pengelola kepegawaian untuk memastikan data talenta lengkap, valid, dan mutakhir.'
        ],
        attendees: [
          'Kepala BKN, Prof. Dr. Zudan Arif Fakrulloh, S.H., M.H.',
          'Direktur Pengembangan Talenta dan Karir ASN, Dr. Samsul Hidayat, S.S., M.PSDM.',
          'Direktur Pengelolaan Sistem Informasi dan Layanan Digitalisasi Manajemen ASN, Bapak Wahyu Firdaus, S.T.',
          'Tim teknis layanan MyASN/SIMATA.',
          'Para pejabat pimpinan tinggi pratama di lingkungan BKN, Kepala Kantor Regional BKN, pengelola/pembina kepegawaian, serta ASN dan perwakilan instansi pusat dan daerah.'
        ],
        activities: [
          {
            sectionTitle: '1. Sambutan dan Pembukaan Kepala BKN – Prof. Dr. Zudan Arif Fakrulloh, S.H., M.H.',
            speaker: 'Prof. Dr. Zudan Arif Fakrulloh, S.H., M.H.',
            points: [
              'Manajemen talenta diperlukan untuk memastikan ASN yang tepat ditempatkan pada posisi, pekerjaan, dan situasi yang sesuai sehingga organisasi dapat bekerja lebih efektif.',
              'Manajemen talenta dibangun di atas prinsip meritokrasi, yaitu menempatkan orang yang tepat dengan cara yang tepat pada posisi yang tepat. Kualitas ASN harus selaras dengan jenjang dan tanggung jawab yang diemban.',
              'ASN perlu mengenali kekuatan dan karakteristik dirinya. Talenta harus ditempatkan pada lingkungan yang sesuai dengan kemampuan agar dapat berkinerja optimal.',
              'Pengelolaan talenta mempertimbangkan kompetensi, potensi, preferensi karier, rekam jejak, integritas, dan kemampuan membangun kepercayaan. Integritas dan sikap amanah menjadi karakter dasar ASN yang dapat dipercaya.',
              'Loyalitas kepada pimpinan harus dijalankan sepanjang penugasan tidak bertentangan dengan peraturan perundang-undangan, kesopanan, dan kesusilaan. Bila terdapat kebijakan yang dilanggar, penyampaiannya dilakukan secara santun dan beradab.',
              'Reward dan punishment perlu diterapkan sebagai bagian dari pengelolaan talenta. Kepala BKN mengajak seluruh ASN untuk terus meningkatkan kualitas diri dan menjaga Indonesia melalui kinerja terbaik.'
            ]
          },
          {
            sectionTitle: '2. Paparan Direktur Pengembangan Talenta dan Karir ASN – Dr. Samsul Hidayat. S.S., M.PSDM.',
            speaker: 'Dr. Samsul Hidayat. S.S., M.PSDM.',
            points: [
              'Manajemen talenta diposisikan sebagai alat/jembatan untuk membangun ASN yang sesuai dengan kebutuhan dan arah organisasi. Organisasi terlebih dahulu menentukan visi, misi, struktur, jabatan, uraian tugas, dan kebutuhan people model.',
              'Siklus manajemen talenta meliputi akuisisi, pemetaan/pengembangan, penempatan, dan retensi talenta. Inti prosesnya adalah mengembangkan individu dari kondisi saat ini menuju kondisi yang lebih baik agar visi dan misi organisasi tercapai.',
              'Pengukuran talenta menggunakan dua sumbu utama, yaitu kinerja dan potensi. Kinerja menggambarkan past performance, sedangkan potensi menggambarkan kapasitas, karakter, dan kesiapan seseorang untuk peran di masa depan.',
              'Pemetaan ke dalam sembilan kotak membutuhkan data yang valid, bukan semata-mata opini. Sistem informasi menjadi penting untuk mendukung pemetaan, pengembangan, dan pengambilan keputusan.',
              'Komponen kinerja utama diberi bobot 60% dari predikat kinerja, sedangkan kinerja penguat digunakan untuk mengonfirmasi kinerja melalui penghargaan, inovasi, penugasan dalam tim kerja, dan umpan balik 360.',
              'Sumbu potensi mencakup kompetensi, potensi, kualifikasi, integritas, dan moralitas. Data pendidikan, pengembangan kompetensi, pengalaman jabatan, penugasan, dan rekam jejak disiplin menjadi bagian dari bahan pengukuran.',
              'ASN didorong disiplin memperbarui data dan mengunggah bukti pendukung setelah mengikuti pelatihan, sertifikasi, memperoleh penghargaan, atau menjalankan penugasan. Data yang tidak diperbarui tidak akan tercermin dalam pemetaan talenta.'
            ]
          },
          {
            sectionTitle: '3. Paparan Direktur Pengelolaan Sistem Informasi dan Layanan Digitalisasi Manajemen ASN – Bapak Wahyu Firdaus, S.T.',
            speaker: 'Bapak Wahyu Firdaus, S.T.',
            points: [
              'Digitalisasi diperlukan agar manajemen talenta tidak berjalan secara manual dan terpisah-pisah. MyASN menjadi cerminan data ASN, sedangkan SIMATA menjadi tools untuk pengelolaan dan pemetaan talenta.',
              'Data manajemen ASN diarahkan terintegrasi mulai dari perencanaan kebutuhan, seleksi, penetapan NIP, pengelolaan kinerja, manajemen talenta, kenaikan pangkat, mutasi, sampai pemberhentian/pensiun.',
              'Per 1 Agustus 2026 disampaikan jumlah ASN nasional sekitar 6,7 juta. Seluruh ASN didorong memeriksa data dan dokumen pada MyASN serta melengkapi data yang masih kurang.',
              'Kualitas data menjadi faktor utama karena data yang tidak lengkap, tidak akurat, tidak tepat waktu, atau tidak konsisten dapat menghambat otomatisasi layanan dan menyebabkan keputusan kepegawaian kurang presisi.',
              'Pemutakhiran data dilakukan secara kolaboratif. ASN dapat mengusulkan perbaikan melalui MyASN, sedangkan instansi melakukan pemutakhiran dan verifikasi sesuai kewenangannya.',
              'SIMATA menyediakan fitur profil ASN, talent mapping, rencana suksesi, dashboard, dan seleksi. Rekomendasi kandidat untuk promosi/mutasi diarahkan berbasis data dan parameter yang tersedia dalam sistem.',
              'BKN menyediakan SIMATA sebagai tools yang dapat digunakan bersama oleh instansi sehingga instansi tidak perlu membangun aplikasi manajemen talenta sendiri.',
              'Integritas dan moralitas juga menjadi bagian dari data yang diperhatikan dalam pengelolaan talenta untuk memastikan ASN yang diusulkan untuk promosi atau jabatan memiliki rekam jejak yang dapat dipertanggungjawabkan.'
            ]
          },
          {
            sectionTitle: '4. Demo Layanan MyASN dan SIMATA – Tim Teknis',
            speaker: 'Tim Teknis',
            points: [
              'ASN dapat masuk melalui ASN Digital, memilih layanan individu, kemudian membuka MyASN untuk melihat dashboard, informasi SIMATA, nilai talenta, dan posisi pada kotak talenta.',
              'Detail kotak talenta menampilkan komponen sumbu kinerja dan sumbu potensi, termasuk kinerja utama/penguat, penghargaan, penugasan dalam tim kerja, umpan balik 360, kompetensi, potensi, kualifikasi, integritas, dan moralitas.',
              'Beberapa data dapat diperbarui secara mandiri, antara lain riwayat sertifikasi/kursus, penghargaan, dan penugasan dalam tim kerja, dengan mengisi data serta mengunggah dokumen pendukung.',
              'Data kompetensi dan hasil asesmen/profiling dapat ditampilkan, termasuk aspek manajerial dan sosial-kultural, potensi, literasi digital, serta Tripata Karier.',
              'Data yang sudah dimiliki secara fisik tetapi belum dimasukkan ke sistem tidak akan muncul dalam pemetaan. Karena itu, ASN perlu aktif melakukan pemutakhiran data.'
            ]
          },
          {
            sectionTitle: '5. Sesi Tanya Jawab',
            speaker: 'Peserta Rapat & Narasumber BKN',
            points: [
              'A. Peserta dari Dinas Kearsipan dan Perpustakaan Kab. Sikka: Menanyakan periode data penghargaan/sertifikat/penugasan dan sistem merit. Jawaban: Sertifikat diperhitungkan 5 tahun terakhir, sertifikasi mengikuti masa berlaku lembaga penerbit (misal BNSP 3 tahun).',
              'B. Nur Ahmad – Kantor Kelurahan Bongki: Menanyakan konsep penerapan manajemen talenta di tingkat kelurahan. Jawaban: Dimulai dari pemetaan jabatan dan kebutuhan kompetensi organisasi serta pembuktian eviden.',
              'C. Sohmin – Biro Kesra NTB: Menanyakan validasi posisi talent box. Jawaban: Sertifikat tanpa batas berlaku mengikuti batas 5 tahun untuk kebutuhan pengukuran.',
              'D. Admin SIMATA dari Muna Barat: Menanyakan ketersediaan handbook standar pengisian. Jawaban: BKN menerima masukan untuk menyediakan handbook panduan teknis bagi seluruh instansi.'
            ]
          }
        ],
        actionItems: [
          'ASN melakukan pengecekan dan pemutakhiran profil pada MyASN/ASN Digital, termasuk data pendidikan, sertifikasi/kursus, penghargaan, penugasan, kompetensi, serta dokumen pendukung.',
          'Pengelola kepegawaian melakukan verifikasi dan rekonsiliasi data yang menjadi kewenangan instansi, terutama data penugasan tim, umpan balik 360, kompetensi, dan dokumen kepegawaian.',
          'Instansi melakukan sosialisasi internal agar seluruh ASN memahami posisi kotak talenta, komponen penilaian, serta langkah yang dapat dilakukan untuk meningkatkan skor melalui kinerja dan pengembangan kompetensi.',
          'Instansi memastikan kotak talenta hanya dipublikasikan setelah data cukup lengkap, valid, dan siap ditampilkan.',
          'Pemanfaatan hasil pemetaan talenta diarahkan pada pengembangan individu, perencanaan suksesi, promosi, rotasi, mutasi, dan mobilitas talenta sesuai ketentuan.',
          'BKN akan terus melakukan pengembangan sistem, pendampingan, dan penyempurnaan integrasi data serta menindaklanjuti masukan mengenai handbook dan fitur layanan.'
        ],
        conclusions: [
          'Manajemen talenta merupakan instrumen untuk memastikan ASN yang tepat berada pada posisi dan pekerjaan yang sesuai dengan kebutuhan organisasi.',
          'Keberhasilan SIMATA dan MyASN sangat bergantung pada kualitas data yang lengkap, valid, sah, dan mutakhir serta kolaborasi antara ASN dan pengelola kepegawaian.',
          'Posisi pada kotak talenta bukan tujuan akhir. Hasil pemetaan harus digunakan untuk mengidentifikasi kekuatan dan area pengembangan serta menentukan intervensi pengembangan karier.',
          'Peningkatan kinerja, pengembangan kompetensi, kelengkapan eviden, integritas, dan disiplin pemutakhiran data menjadi tanggung jawab bersama untuk memperkuat sistem merit.',
          'BKN mendorong instansi pusat dan daerah memanfaatkan SIMATA dan MyASN sebagai bagian dari pengelolaan karier ASN yang lebih objektif, transparan, dan berbasis data.'
        ],
        closingText: 'Kegiatan BKN Menyapa ASN ditutup dengan ajakan kepada seluruh ASN dan pengelola kepegawaian untuk merencanakan serta mengembangkan karier secara berkelanjutan, menjaga integritas dan moralitas, meningkatkan kinerja, serta aktif berkoordinasi dengan Biro SDM/BKD/BKPSDM/BKPP. BKN menegaskan komitmen untuk terus menyempurnakan sistem dan mendampingi implementasi manajemen talenta berbasis data.',
        notulisName: req.user.full_name || 'Rizky Chandra Satria',
        notulisRole: req.user.division || 'Asisten Analis Sumber Daya Manusia'
      };

      res.render('notulen', {
        title: 'Pembuat Notulen Rapat Kedinasan - BKN',
        user: req.user,
        initialData: defaultData,
        todayFormatted: formattedDate,
        isoDate: isoDate
      });
    } catch (err) {
      console.error('getNotulenGenerator error:', err);
      res.status(500).send('Terjadi kesalahan saat memuat modul notulen: ' + err.message);
    }
  },

  // POST /api/notulen
  saveNotulen: async (req, res) => {
    try {
      const {
        id,
        title,
        meetingDate,
        meetingTime,
        meetingPlace,
        agenda,
        attendees,
        activities,
        actionItems,
        conclusions,
        closingText,
        notulisName,
        notulisRole
      } = req.body;

      if (!title || !meetingDate) {
        return res.status(400).json({ success: false, message: 'Judul dan Tanggal rapat wajib diisi.' });
      }

      const agendaJson = JSON.stringify(agenda || []);
      const attendeesJson = JSON.stringify(attendees || []);
      const activitiesJson = JSON.stringify(activities || []);
      const actionItemsJson = JSON.stringify(actionItems || []);
      const conclusionsJson = JSON.stringify(conclusions || []);

      if (id) {
        // Update existing
        const updateRes = await db.query(`
          UPDATE notulen SET
            title = $1,
            meeting_date = $2,
            meeting_time = $3,
            meeting_place = $4,
            agenda_data = $5,
            attendees_data = $6,
            activities_data = $7,
            action_items = $8,
            conclusions = $9,
            closing_text = $10,
            notulis_name = $11,
            notulis_role = $12
          WHERE id = $13 AND user_id = $14
          RETURNING id
        `, [
          title, meetingDate, meetingTime || '09.00 – 11.30 WIB', meetingPlace || 'Di Tempat',
          agendaJson, attendeesJson, activitiesJson, actionItemsJson, conclusionsJson,
          closingText || '', notulisName || req.user.full_name, notulisRole || req.user.division,
          id, req.user.id
        ]);

        return res.json({ success: true, message: 'Notulen berhasil diperbarui!', id: id });
      } else {
        // Insert new
        const insertRes = await db.query(`
          INSERT INTO notulen (
            user_id, title, meeting_date, meeting_time, meeting_place,
            agenda_data, attendees_data, activities_data, action_items,
            conclusions, closing_text, notulis_name, notulis_role
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `, [
          req.user.id, title, meetingDate, meetingTime || '09.00 – 11.30 WIB', meetingPlace || 'Di Tempat',
          agendaJson, attendeesJson, activitiesJson, actionItemsJson,
          conclusionsJson, closingText || '', notulisName || req.user.full_name, notulisRole || req.user.division
        ]);

        const newId = insertRes.rows && insertRes.rows[0] ? insertRes.rows[0].id : insertRes.lastID;
        return res.json({ success: true, message: 'Notulen baru berhasil disimpan!', id: newId });
      }
    } catch (err) {
      console.error('saveNotulen error:', err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan notulen: ' + err.message });
    }
  },

  // POST /api/notulen/ai-generate
  aiGenerateNotulen: async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || !rawText.trim()) {
        return res.status(400).json({ success: false, message: 'Teks transkrip atau catatan rapat tidak boleh kosong.' });
      }

      const structured = await aiService.generateNotulenFromText(rawText, req.user);
      return res.json({
        success: true,
        message: 'Notula rapat berhasil diekstrak dan disusun secara otomatis oleh AI!',
        data: structured
      });
    } catch (err) {
      console.error('aiGenerateNotulen error:', err);
      return res.status(500).json({ success: false, message: 'Gagal memproses notulen dengan AI: ' + err.message });
    }
  },

  // GET /notulen/preview/:id
  getNotulenPreview: async (req, res) => {
    try {
      const { id } = req.params;
      const docRes = await db.query(
        'SELECT * FROM notulen WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );

      if (docRes.rows.length === 0) {
        return res.status(404).send('Dokumen notulen tidak ditemukan atau Anda tidak memiliki akses.');
      }

      const doc = docRes.rows[0];
      const today = new Date(doc.meeting_date || doc.created_at);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('id-ID', options);

      res.render('notulen_preview', {
        title: `Notula - ${doc.title}`,
        user: req.user,
        doc: {
          id: doc.id,
          title: doc.title,
          meetingDate: doc.meeting_date,
          formattedDate: formattedDate,
          meetingTime: doc.meeting_time,
          meetingPlace: doc.meeting_place,
          agenda: typeof doc.agenda_data === 'string' ? JSON.parse(doc.agenda_data) : doc.agenda_data,
          attendees: typeof doc.attendees_data === 'string' ? JSON.parse(doc.attendees_data) : doc.attendees_data,
          activities: typeof doc.activities_data === 'string' ? JSON.parse(doc.activities_data) : doc.activities_data,
          actionItems: typeof doc.action_items === 'string' ? JSON.parse(doc.action_items) : doc.action_items,
          conclusions: typeof doc.conclusions === 'string' ? JSON.parse(doc.conclusions) : doc.conclusions,
          closingText: doc.closing_text,
          notulisName: doc.notulis_name || req.user.full_name,
          notulisRole: doc.notulis_role || req.user.division
        }
      });
    } catch (err) {
      console.error('getNotulenPreview error:', err);
      res.status(500).send('Terjadi kesalahan saat memuat preview notulen: ' + err.message);
    }
  }
};

module.exports = notulenController;
