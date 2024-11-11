import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 使用环境变量控制数据库路径
const dbDir = process.env.DB_PATH || path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'downloads.db');

// 确保目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

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