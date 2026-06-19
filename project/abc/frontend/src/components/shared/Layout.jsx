import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content animate-fadein">
          {children}
        </main>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:99, display:'none' }}
          className="mobile-overlay"
        />
      )}
    </div>
  );
}
