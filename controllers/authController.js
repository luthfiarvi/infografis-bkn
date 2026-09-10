const bcrypt = require('bcryptjs');
const db = require('../config/database');

const authController = {
  // GET /login
  getLogin: (req, res) => {
    res.render('login', {
      title: 'Login - Automated Infographic Generator BKN',
      error: req.query.error || null,
      success: req.query.success || null
    });
  },

  // POST /login
  postLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.redirect('/login?error=Harap+masukkan+username+dan+password');
      }

      const result = await db.query('SELECT * FROM users WHERE username = $1', [username.trim()]);

      if (result.rows.length === 0) {
        return res.redirect('/login?error=Username+atau+password+salah');
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.redirect('/login?error=Username+atau+password+salah');
      }

      // Store in session
      req.session.user = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        nip: user.nip,
        institution: user.institution,
        division: user.division,
        mentor_name: user.mentor_name,
        logo_path: user.logo_path || '/images/Logo_Badan_Kepegawaian_Negara.png',
        avatar_path: user.avatar_path || '/images/default_avatar.svg'
      };

      const redirectPath = req.session.returnTo || '/portal';
      delete req.session.returnTo;

      res.redirect(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      res.redirect('/login?error=Terjadi+kesalahan+pada+server');
    }
  },

  // GET /register
  getRegister: (req, res) => {
    res.render('register', {
      title: 'Registrasi Pegawai - Automated Infographic Generator BKN',
      error: req.query.error || null,
      success: req.query.success || null
    });
  },

  // POST /register
  postRegister: async (req, res) => {
    try {
      const { username, password, full_name, nip, institution, division, mentor_name, logo_path } = req.body;

      if (!username || !password || !full_name || !division) {
        return res.redirect('/register?error=Username,+password,+nama+lengkap,+dan+jabatan+wajib+diisi');
      }

      const check = await db.query('SELECT id FROM users WHERE username = $1', [username.trim()]);
      if (check.rows.length > 0) {
        return res.redirect('/register?error=Username+sudah+terdaftar');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : '/images/default_avatar.svg';

      await db.query(`
        INSERT INTO users (
          username, password_hash, full_name, nip, institution, division, mentor_name, logo_path, avatar_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        username.trim(),
        passwordHash,
        full_name.trim(),
        nip ? nip.trim() : '',
        institution ? institution.trim() : 'Kantor Regional V BKN Jakarta',
        division.trim(),
        mentor_name ? mentor_name.trim() : '',
        logo_path ? logo_path.trim() : '/images/Logo_Badan_Kepegawaian_Negara.png',
        avatarPath
      ]);

      res.redirect('/login?success=Registrasi+berhasil.+Silakan+masuk+dengan+akun+Anda.');
    } catch (err) {
      console.error('Register error:', err);
      res.redirect('/register?error=Gagal+mendaftarkan+akun+pegawai');
    }
  },

  // GET /logout
  getLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error('Logout error:', err);
      res.redirect('/login?success=Anda+telah+berhasil+keluar');
    });
  },

  // GET /profile
  getProfile: async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) {
        return res.redirect('/login');
      }

      const user = result.rows[0];

      res.render('profile', {
        title: 'Manajemen Profil Pegawai - BKN',
        user,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (err) {
      console.error('Profile view error:', err);
      res.redirect('/generator?error=Gagal+memuat+profil');
    }
  },

  // POST /profile
  postProfile: async (req, res) => {
    try {
      const { full_name, nip, institution, division, mentor_name, logo_path, current_password, new_password, confirm_password } = req.body;

      if (!full_name || !division) {
        return res.redirect('/profile?error=Nama+lengkap+dan+jabatan/divisi+wajib+diisi');
      }

      // Check if user uploaded a new avatar file
      let avatarPath = req.session.user.avatar_path || '/images/default_avatar.svg';
      if (req.file) {
        avatarPath = `/uploads/avatars/${req.file.filename}`;
      }

      // Check password change if requested
      let updatedPasswordHash = null;
      if (new_password && new_password.trim() !== '') {
        if (!current_password) {
          return res.redirect('/profile?error=Harap+masukkan+kata+sandi+lama+untuk+mengganti+password');
        }

        const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) {
          return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(current_password, userRes.rows[0].password_hash);
        if (!isMatch) {
          return res.redirect('/profile?error=Kata+sandi+lama+tidak+sesuai');
        }

        if (new_password.trim().length < 6) {
          return res.redirect('/profile?error=Kata+sandi+baru+minimal+harus+6+karakter');
        }

        if (new_password !== confirm_password) {
          return res.redirect('/profile?error=Konfirmasi+kata+sandi+baru+tidak+cocok');
        }

        const salt = await bcrypt.genSalt(10);
        updatedPasswordHash = await bcrypt.hash(new_password.trim(), salt);
      }

      if (updatedPasswordHash) {
        await db.query(`
          UPDATE users SET
            full_name = $1,
            nip = $2,
            institution = $3,
            division = $4,
            mentor_name = $5,
            logo_path = $6,
            avatar_path = $7,
            password_hash = $8
          WHERE id = $9
        `, [
          full_name.trim(),
          nip ? nip.trim() : '',
          institution ? institution.trim() : 'Kantor Regional V BKN Jakarta',
          division.trim(),
          mentor_name ? mentor_name.trim() : '',
          logo_path ? logo_path.trim() : '/images/Logo_Badan_Kepegawaian_Negara.png',
          avatarPath,
          updatedPasswordHash,
          req.user.id
        ]);
      } else {
        await db.query(`
          UPDATE users SET
            full_name = $1,
            nip = $2,
            institution = $3,
            division = $4,
            mentor_name = $5,
            logo_path = $6,
            avatar_path = $7
          WHERE id = $8
        `, [
          full_name.trim(),
          nip ? nip.trim() : '',
          institution ? institution.trim() : 'Kantor Regional V BKN Jakarta',
          division.trim(),
          mentor_name ? mentor_name.trim() : '',
          logo_path ? logo_path.trim() : '/images/Logo_Badan_Kepegawaian_Negara.png',
          avatarPath,
          req.user.id
        ]);
      }

      // Update session user
      req.session.user = {
        ...req.session.user,
        full_name: full_name.trim(),
        nip: nip ? nip.trim() : '',
        institution: institution ? institution.trim() : 'Kantor Regional V BKN Jakarta',
        division: division.trim(),
        mentor_name: mentor_name ? mentor_name.trim() : '',
        logo_path: logo_path ? logo_path.trim() : '/images/Logo_Badan_Kepegawaian_Negara.png',
        avatar_path: avatarPath
      };

      res.redirect('/profile?success=Profil+pegawai+berhasil+diperbarui!');
    } catch (err) {
      console.error('Update profile error:', err);
      res.redirect('/profile?error=Gagal+menyimpan+perubahan+profil');
    }
  }
};

module.exports = authController;
