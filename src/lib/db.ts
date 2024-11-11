import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 使用环境变量或默认路径
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data');
const DB_FILE = 'downloads.db';

function initializeDatabase() {
  try {
    // 确保数据目录存在
    if (!fs.existsSync(DB_PATH)) {
      console.log('Creating database directory:', DB_PATH);
      fs.mkdirSync(DB_PATH, { recursive: true, mode: 0o755 });
    }

    const dbPath = path.join(DB_PATH, DB_FILE);
    console.log('Database path:', dbPath);

    // 创建数据库连接
    const db = new Database(dbPath, {
      verbose: console.log,
      fileMustExist: false
    });

    // 初始化数据库表
    db.exec(`
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        device_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // 尝试使用备用路径
    const fallbackPath = path.join(process.cwd(), 'data');
    console.log('Trying fallback path:', fallbackPath);
    
    if (!fs.existsSync(fallbackPath)) {
      fs.mkdirSync(fallbackPath, { recursive: true, mode: 0o755 });
    }
    
    const fallbackDbPath = path.join(fallbackPath, DB_FILE);
    console.log('Fallback database path:', fallbackDbPath);
    
    const db = new Database(fallbackDbPath, {
      verbose: console.log,
      fileMustExist: false
    });
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        device_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
    
    return db;
  }
}

// 导出数据库实例
const db = initializeDatabase();
export default db; 