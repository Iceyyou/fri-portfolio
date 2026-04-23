/**
 * Theme Editor Page
 * /admin/theme-editor - 主题编辑器主页面
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ThemeEditorClient from './ThemeEditorClient';

// 简单的 hash 函数
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

export default async function ThemeEditorPage() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
  
  return <ThemeEditorClient />;
}
