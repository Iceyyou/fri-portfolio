/**
 * [INPUT]:  User-designed home page with orbital navigation layout
 * [OUTPUT]: Entry point with AI identity card, navigation nodes, and ambient effects
 * [POS]:    Landing page — first page users see, routes to main sections
 * [PROTOCOL]: Update this header on any design change
 */

"use client";

import Link from "next/link";
import Head from "next/head";
import { useState, useEffect } from "react";
import "./home.css";

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const saved = localStorage.getItem("home-theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  // Toggle theme and save preference
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("home-theme", newTheme ? "dark" : "light");
  };

  return (
    <>
      {/* Google Fonts and Material Symbols */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Space+Grotesk:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" 
        rel="stylesheet" 
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
      
      <div className={`home-page ${isDark ? "dark" : "light"} relative min-h-screen w-full overflow-hidden flex items-center justify-center font-body selection:bg-accent/30 selection:text-accent`}>
      {/* Background Grid */}
      <div className="absolute inset-[-100%] bg-grid animate-grid-move z-0 pointer-events-none"></div>
      
      {/* Multi-layer Aurora Glows */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] z-0 animate-pulse-glow pointer-events-none"></div>
      <div 
        className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-glow/5 rounded-full blur-[100px] z-0 animate-pulse-glow pointer-events-none" 
        style={{ animationDelay: "-2s" }}
      ></div>
      
      {/* Orbital Layout Container */}
      <div className="relative z-10 flex items-center justify-center w-[700px] h-[700px]">
        {/* Background Orbital Elements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="orbital-ring w-[350px] h-[350px]"></div>
          <div className="orbital-ring w-[550px] h-[550px] absolute"></div>
        </div>
        
        {/* Connecting Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 700">
          {/* Center: 350, 350 */}
          {/* Dashboard (Top): 350, 100 */}
          <g className="node-container">
            <line className="node-line" x1="350" y1="350" x2="350" y2="100"></line>
          </g>
          {/* Logs (Bottom Left): 133, 475 approx */}
          <g className="node-container">
            <line className="node-line" x1="350" y1="350" x2="133" y2="475"></line>
          </g>
          {/* Contact (Bottom Right): 567, 475 approx */}
          <g className="node-container">
            <line className="node-line" x1="350" y1="350" x2="567" y2="475"></line>
          </g>
        </svg>
        
        {/* Central Identity Card */}
        <div className="relative z-30 group cursor-pointer animate-float">
          <Link href="/" className="block">
            <div className="tilt-card glass-panel-home w-48 h-48 rounded-3xl flex flex-col items-center justify-center shadow-2xl animate-breathing border-white/10 overflow-hidden">
              {/* Inner Reflection Layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
              
              {/* Geometric Logo/Icon */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-accent/40 rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-700"></div>
                <div className="absolute inset-2 border border-cyan-glow/30 rounded-lg -rotate-12 group-hover:rotate-12 transition-transform duration-1000"></div>
                <span className="material-symbols-outlined text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">grid_view</span>
              </div>
              
              {/* Identity Label */}
              <div className="mt-4 text-center">
                <p className="font-display font-bold text-xs tracking-[0.3em] uppercase text-white/90">FRI.Core</p>
                <div className="h-[1px] w-8 bg-accent mx-auto mt-1 opacity-50"></div>
              </div>
            </div>
          </Link>
          
          {/* Scanline Effect */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl opacity-20">
            <div className="w-full h-[2px] bg-white/40 absolute top-0 animate-scanline"></div>
          </div>
        </div>
        
        {/* Navigation Nodes */}
        {/* DASHBOARD (Top) */}
        <Link 
          href="/" 
          className="absolute top-[60px] flex flex-col items-center group node-container"
        >
          <div className="glass-panel-home w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-white/60 group-hover:text-accent transition-colors">dashboard</span>
          </div>
          <span className="nav-item font-mono text-[10px] tracking-[0.2em] uppercase text-muted">Dashboard</span>
        </Link>
        
        {/* LOGS / CONTENT (Bottom Left) */}
        <Link 
          href="/daily" 
          className="absolute bottom-[180px] left-[80px] flex flex-col items-center group node-container"
        >
          <div className="glass-panel-home w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-white/60 group-hover:text-accent transition-colors">terminal</span>
          </div>
          <span className="nav-item font-mono text-[10px] tracking-[0.2em] uppercase text-muted">Logs</span>
        </Link>
        
        {/* CONTACT (Bottom Right) */}
        <Link 
          href="#contact" 
          className="absolute bottom-[180px] right-[80px] flex flex-col items-center group node-container"
        >
          <div className="glass-panel-home w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-white/60 group-hover:text-accent transition-colors">alternate_email</span>
          </div>
          <span className="nav-item font-mono text-[10px] tracking-[0.2em] uppercase text-muted">Contact</span>
        </Link>
      </div>
      
      {/* UI Overlay Info - Top Left */}
      <div className="fixed top-8 left-8 flex items-start gap-4 pointer-events-none">
        <div className="h-12 w-[1px] bg-accent/30 mt-1"></div>
        <div className="font-mono text-[10px] text-muted space-y-1">
          <div className="text-white/40 font-bold">IDENTITY PROTOCOL</div>
          <div>VER // 3.28_NEXUS</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            <span>STATUS // UPLINK_ACTIVE</span>
          </div>
        </div>
      </div>
      
      {/* Theme Toggle Button - Top Right */}
      <button 
        onClick={toggleTheme}
        className="theme-toggle fixed top-8 right-8 glass-panel-home w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 z-50"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="text-lg transition-transform duration-500" style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
          {isDark ? "☀️" : "🌙"}
        </span>
      </button>
      
      {/* UI Overlay Info - Bottom Right */}
      <div className="fixed bottom-8 right-8 text-right pointer-events-none">
        <div className="font-display text-2xl font-bold tracking-tighter text-white/10 mb-2">FRI INTERFACE</div>
        <div className="font-mono text-[10px] text-muted tracking-widest">
          ENCRYPTED SESSION // SECTOR_7G<br/>
          © 2026 FRI LABS
        </div>
      </div>
      </div>
    </>
  );
}
