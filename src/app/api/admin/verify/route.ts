/**
 * Admin Session Verify API
 * GET /api/admin/verify - 验证当前登录状态
 */

import { NextRequest, NextResponse } from 'next/server';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  const tokenHash = request.cookies.get('admin_token_hash')?.value;
  
  if (!sessionToken || !tokenHash) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  // 验证 token
  if (simpleHash(sessionToken) !== tokenHash) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  return NextResponse.json({ authenticated: true });
}
