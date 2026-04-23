/**
 * Admin Layout
 * 所有 /admin/* 页面的 wrapper，负责登录状态检查
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 简单的 hash 函数（需要和 API 保持一致）
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

async function checkAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const tokenHash = cookieStore.get('admin_token_hash')?.value;
  
  if (!sessionToken || !tokenHash) {
    return false;
  }
  
  return simpleHash(sessionToken) === tokenHash;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
