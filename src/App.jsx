// src/App.js

import React, { useState } from 'react';
import DashboardView from './components/DashboardView';
import DataEntryView from './components/DataEntryView';

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [globalProgram, setGlobalProgram] = useState("PLTS Irigasi");
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col w-full">
      
      {/* Header Global dengan Navigasi Tab */}
      <header className="bg-white border-b border-gray-200 sticky top-0 px-6 py-4 flex items-center justify-between shadow-sm w-full z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1e3a8a] rounded-md flex items-center justify-center text-white font-bold text-lg">BA</div>
          <h1 className="text-lg font-bold text-[#1e3a8a]">Bukit Asam</h1>
        </div>
        <nav className="flex gap-6 font-bold text-xs uppercase tracking-wide">
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
        {activeTab === "Dashboard" ? (
          <DashboardView 
            selectedProgram={globalProgram} setSelectedProgram={setGlobalProgram}
            selectedDate={globalDate} setSelectedDate={setGlobalDate}
          />
        ) : (
          <DataEntryView 
            selectedProgram={globalProgram} setSelectedProgram={setGlobalProgram}
            selectedDate={globalDate} setSelectedDate={setGlobalDate}
          />
        )}
      </main>

      {/* Global Footer (Copyright & Version) */}
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-gray-500 text-[13px] font-medium">© 2026 Sustainable Community Development</p>
        <p className="text-[11px] text-gray-400 mt-1.5 font-mono">Version: v1.0.7</p>
      </footer>
    </div>
  );
}

