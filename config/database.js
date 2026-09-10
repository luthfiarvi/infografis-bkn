const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Determine DB Driver: Postgres if explicit DB_HOST/DATABASE_URL or test connection, else SQLite
let isPostgres = false;
let pgPool = null;
let sqliteDb = null;

const pgConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'bkn_infografis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// If DATABASE_URL is not set and host is localhost, check if Postgres is configured in .env
const usePgDirect = Boolean(process.env.DATABASE_URL || (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== ''));

let initPromise = null;

async function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Attempt Postgres connection first if configured
    if (usePgDirect || process.env.USE_POSTGRES === 'true') {
      try {
        const testPool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : pgConfig);
        await testPool.query('SELECT 1');
        pgPool = testPool;
        isPostgres = true;
        console.log('✅ Terhubung ke database PostgreSQL');
      } catch (err) {
        console.warn('⚠️ Gagal terhubung ke PostgreSQL (' + err.message + '). Beralih ke fallback SQLite.');
        isPostgres = false;
      }
    }

    if (!isPostgres) {
      // Ensure data directory exists
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const sqlitePath = path.join(dataDir, 'bkn_infografis.sqlite');
      sqliteDb = new sqlite3.Database(sqlitePath);
      console.log('✅ Terhubung ke database SQLite lokal:', sqlitePath);
    }

    // Initialize Tables
    if (isPostgres) {
      await pgPool.query(`
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

        -- Add column avatar_path if not exists (migration)
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_path') THEN
                ALTER TABLE users ADD COLUMN avatar_path VARCHAR(255) DEFAULT '/images/default_avatar.svg';
            END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS infographics (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            report_title VARCHAR(255) NOT NULL,
            report_subtitle VARCHAR(255),
            report_date DATE NOT NULL,
            metrics_data JSONB NOT NULL,
            pillars_data JSONB NOT NULL,
            table_rows JSONB NOT NULL,
            visual_evidence JSONB DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Add column visual_evidence if not exists (migration)
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='infographics' AND column_name='visual_evidence') THEN
                ALTER TABLE infographics ADD COLUMN visual_evidence JSONB DEFAULT '[]';
            END IF;
        END $$;
      `);
    } else {
      await new Promise((resolve, reject) => {
        sqliteDb.serialize(() => {
          sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                nip TEXT,
                institution TEXT NOT NULL DEFAULT 'Kantor Regional V BKN Jakarta',
                division TEXT NOT NULL,
                mentor_name TEXT,
                logo_path TEXT DEFAULT '/images/Logo_Badan_Kepegawaian_Negara.png',
                avatar_path TEXT DEFAULT '/images/default_avatar.svg',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) return reject(err);
          });

          // SQLite Migration: Add avatar_path if not exists
          sqliteDb.all("PRAGMA table_info(users)", (err, columns) => {
            if (!err && columns) {
              const hasAvatar = columns.some(c => c.name === 'avatar_path');
              if (!hasAvatar) {
                sqliteDb.run("ALTER TABLE users ADD COLUMN avatar_path TEXT DEFAULT '/images/default_avatar.svg'");
              }
            }
          });

          sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS infographics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                report_title TEXT NOT NULL,
                report_subtitle TEXT,
                report_date TEXT NOT NULL,
                metrics_data TEXT NOT NULL,
                pillars_data TEXT NOT NULL,
                table_rows TEXT NOT NULL,
                visual_evidence TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) return reject(err);
            
            // SQLite Migration: Add visual_evidence if not exists
            sqliteDb.all("PRAGMA table_info(infographics)", (mErr, mCols) => {
              if (!mErr && mCols) {
                const hasEvidence = mCols.some(c => c.name === 'visual_evidence');
                if (!hasEvidence) {
                  sqliteDb.run("ALTER TABLE infographics ADD COLUMN visual_evidence TEXT DEFAULT '[]'");
                }
              }
              resolve();
            });
          });
        });
      });
    }

    console.log('✅ Skema tabel users & infographics berhasil diverifikasi.');
  })();

  return initPromise;
}

// Unified Query Helper
async function query(sql, params = []) {
  await initDatabase();

  if (isPostgres) {
    // Standard PostgreSQL $1, $2 query
    const res = await pgPool.query(sql, params);
    return res;
  } else {
    // Adapt Postgres $1, $2 syntax to SQLite ? syntax
    let sqliteSql = sql;
    sqliteSql = sqliteSql.replace(/\$(\d+)/g, '?');

    // Adapt RETURNING clause or standard operations
    const trimmed = sqliteSql.trim().toUpperCase();
    const isSelect = trimmed.startsWith('SELECT');
    const isInsert = trimmed.startsWith('INSERT');
    const isUpdate = trimmed.startsWith('UPDATE');
    const isDelete = trimmed.startsWith('DELETE');

    // Serialize JSON objects if passed to SQLite
    const normalizedParams = params.map(p => {
      if (p !== null && typeof p === 'object' && !(p instanceof Date)) {
        return JSON.stringify(p);
      }
      return p;
    });

    return new Promise((resolve, reject) => {
      if (isSelect) {
        sqliteDb.all(sqliteSql, normalizedParams, (err, rows) => {
          if (err) return reject(err);
          // Auto parse JSON columns for compatibility with JSONB
          const parsedRows = (rows || []).map(row => {
            const newRow = { ...row };
            for (const col of ['metrics_data', 'pillars_data', 'table_rows']) {
              if (newRow[col] && typeof newRow[col] === 'string') {
                try {
                  newRow[col] = JSON.parse(newRow[col]);
                } catch (e) {}
              }
            }
            return newRow;
          });
          resolve({ rows: parsedRows, rowCount: parsedRows.length });
        });
      } else {
        sqliteDb.run(sqliteSql, normalizedParams, function(err) {
          if (err) return reject(err);
          // If INSERT, handle returning if requested or provide lastID
          if (isInsert && sqliteSql.toUpperCase().includes('RETURNING')) {
            sqliteDb.get('SELECT * FROM ' + (sqliteSql.match(/INTO\s+([a-zA-Z0-9_]+)/i)?.[1] || 'users') + ' WHERE id = ?', [this.lastID], (err2, row) => {
              if (err2) return reject(err2);
              resolve({ rows: row ? [row] : [], rowCount: this.changes, lastID: this.lastID });
            });
          } else {
            resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
          }
        });
      }
    });
  }
}

module.exports = {
  initDatabase,
  query,
  getIsPostgres: () => isPostgres
};
