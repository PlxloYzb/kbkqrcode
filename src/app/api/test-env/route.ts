import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasPassword: !!process.env.ADMIN_PASSWORD,
    isProduction: process.env.NODE_ENV === 'production',
  });
} 