import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 使用环境变量控制数据库路径
const dbDir = process.env.DB_PATH || path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'downloads.db');

// 确保目录存在
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  console.log('Database directory created:', dbDir);
} catch (error) {
  console.error('Error creating database directory:', error);
  // 尝试使用备用路径
  const fallbackDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
}

// 创建数据库连接
const db = new Database(dbPath, {
  verbose: console.log
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

export default db; 