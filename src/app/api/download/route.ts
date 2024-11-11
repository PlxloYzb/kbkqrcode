// src/app/api/request-download/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, deviceId } = await request.json();

    if (!name || !deviceId) {
      return NextResponse.json(
        { success: false, message: '请提供完整信息' },
        { status: 400 }
      );
    }

    const existingDownload = db
      .prepare('SELECT * FROM downloads WHERE name = ?')
      .get(name);

    if (existingDownload) {
      return NextResponse.json(
        { success: false, message: '该姓名已经下载过二维码' },
        { status: 403 }
      );
    }

    // 生成下载URL
    const fileName = `${encodeURIComponent(name)}.png`;
    const downloadUrl = `/images/${fileName}`;

    // 更新数据库记录
    db.prepare(
      'INSERT INTO downloads (name, device_id, timestamp) VALUES (?, ?, ?)'
    ).run(name, deviceId, Date.now());

    return NextResponse.json({
      success: true,
      message: '下载授权成功',
      downloadUrl,
    });
  } catch (error) {
    console.error('Download request error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}