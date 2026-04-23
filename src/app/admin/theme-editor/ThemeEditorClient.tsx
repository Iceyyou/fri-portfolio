/**
 * Theme Editor Client Component
 * 编辑器的客户端交互部分
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThemeEditorClient() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <h1 className="text-white font-bold text-lg">FRI Theme Editor</h1>
            <span className="text-white/30 text-sm">v1.0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-emerald-400/60 text-sm">● Connected</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-1.5 text-white/60 hover:text-white text-sm 
                         border border-white/10 hover:border-white/20 rounded
                         transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Phase 2 将在这里添加编辑器 */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Placeholder */}
          <div className="border border-dashed border-white/20 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-white text-xl font-medium mb-2">
              Theme Editor Coming Soon
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              Phase 1 完成！登录保护已就绪。
              <br />
              Phase 2 将添加主题配置面板和实时预览。
            </p>
            
            {/* Quick Stats */}
            <div className="mt-8 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">✓</div>
                <div className="text-white/40 text-sm mt-1">登录保护</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white/20">○</div>
                <div className="text-white/40 text-sm mt-1">配置面板</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white/20">○</div>
                <div className="text-white/40 text-sm mt-1">实时预览</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white/20">○</div>
                <div className="text-white/40 text-sm mt-1">GitHub 提交</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
