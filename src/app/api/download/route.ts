// src/app/api/download/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// 添加 OPTIONS 方法处理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: Request) {
  try {
    // 移除了请求方法检查，因为 Next.js 已经确保这是 POST 请求
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
    const downloadUrl = `/api/download/${fileName}`; // 修改为正确的API路由

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
