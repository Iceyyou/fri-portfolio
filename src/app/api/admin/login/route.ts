/**
 * Admin Login API
 * POST /api/admin/login - 验证密码并设置登录 Cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 简单的 hash 函数（生产环境建议用 bcrypt）
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }
    
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // 生成 session token
    const sessionToken = simpleHash(adminPassword + Date.now().toString());
    
    // 设置 Cookie（7天有效期）
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    // 同时存储 token 到内存（简单方案，重启会失效）
    // 生产环境应该用 Redis 或数据库
    response.cookies.set('admin_token_hash', simpleHash(sessionToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
