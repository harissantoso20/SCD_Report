// src/App.js

import React, { Suspense, lazy } from 'react';
import useAppStore from './store/useAppStore';
import logoPTBA from './assets/logo-ptba.png';

const DashboardView = lazy(() => import('./components/DashboardView'));
const DataEntryView = lazy(() => import('./components/DataEntryView'));

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col w-full">
      
      {/* Header Global dengan Navigasi Tab */}
      <header className="bg-white border-b border-gray-200 sticky top-0 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 shadow-sm w-full z-50">
        <div className="flex items-center gap-3">
          <img src={logoPTBA} alt="Logo PTBA" className="h-12 md:h-16 w-auto object-contain" />
        </div>
        <nav className="flex gap-4 md:gap-6 font-bold text-xs md:text-sm uppercase tracking-wide">
          <button 
            onClick={() => setActiveTab("Dashboard")}
            className={`transition-colors ${activeTab === "Dashboard" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("Data Entry")}
            className={`transition-colors ${activeTab === "Data Entry" ? "text-[#1e3a8a] border-b-2 border-[#1e3a8a] pb-1" : "text-gray-400 hover:text-[#1e3a8a]"}`}
          >
            Data Entry
          </button>
        </nav>
      </header>

      <main className="flex-1 w-full p-4 md:p-6 lg:max-w-7xl lg:mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {activeTab === "Dashboard" ? <DashboardView /> : <DataEntryView />}
        </Suspense>
      </main>

      {/* Global Footer (Copyright & Version) */}
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-gray-500 text-[13px] font-medium">© 2026 Sustainable Community Development</p>
        <p className="text-[11px] text-gray-400 mt-1.5 font-mono">Version: v1.0.7</p>
      </footer>
    </div>
  );
}

