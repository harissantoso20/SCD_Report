import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import DashboardHeader from './dashboard/DashboardHeader';
import PLTSVisualization from './dashboard/PLTSVisualization';
import MaggotVisualization from './dashboard/MaggotVisualization';
import SalesVisualization from './dashboard/SalesVisualization';
import AdvancedFishAnalytics from './dashboard/AdvancedFishAnalytics';
import AdvancedPembibitanAnalytics from './dashboard/AdvancedPembibitanAnalytics';
import QuailAnalytics from './dashboard/QuailAnalytics';
import TempeAnalytics from './dashboard/TempeAnalytics';
import EcogrowAnalytics from './dashboard/EcogrowAnalytics';
import CahayaTaniAnalytics from './dashboard/CahayaTaniAnalytics';
import ItikAnalytics from './dashboard/ItikAnalytics';
import ProgramSummary from './dashboard/ProgramSummary';
import { useSharedDashboard } from '../hooks/useSharedDashboard';
import { FileImage, FileText } from './Icons';

export default function DashboardView() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const fetchData = useAppStore((state) => state.fetchData);
  
  const { isSalesProgram } = useSharedDashboard();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const p = (selectedProgram || '').toLowerCase();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      {/* VISUALISASI KONDISIONAL (LEVEL 2) */}
      {p === "plts irigasi" ? (
        <PLTSVisualization />
      ) : p.includes("maggot") ? (
        <MaggotVisualization />
      ) : p.includes("ikan air tawar") ? (
        <AdvancedFishAnalytics />
      ) : p.includes("siba pembibitan") ? (
        <AdvancedPembibitanAnalytics />
      ) : p.includes("puyuh") ? (
        <QuailAnalytics />
      ) : p.includes("prabumenang") ? (
        <TempeAnalytics />
      ) : p.includes("ecogrow") ? (
        <EcogrowAnalytics />
      ) : p.includes("cahaya tani") ? (
        <CahayaTaniAnalytics />
      ) : p.includes("itik") ? (
        <ItikAnalytics />
      ) : isSalesProgram ? (
        <SalesVisualization />
      ) : (
        <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
          <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
            <FileText size={18} className="text-[#1e3a8a]" />
            OVERVIEW INFOGRAFIS
          </h2>
          <div className="w-full flex flex-col border border-indigo-100 rounded-md bg-indigo-50/30 items-center justify-center min-h-[400px] p-6 text-center shadow-inner relative overflow-hidden group cursor-help">
            <div className="absolute inset-0 bg-[#1e3a8a]/5 group-hover:bg-[#1e3a8a]/10 transition-colors"></div>
            <FileImage size={48} className="text-indigo-300 mb-3 relative z-10" />
            <p className="text-indigo-800/60 font-semibold text-sm relative z-10 uppercase tracking-widest">Placement Infografis Laporan</p>
            <p className="text-indigo-800/40 text-xs mt-2 relative z-10 max-w-md">Program ini tidak bersifat kuantitatif secara langsung. Area ini digunakan untuk meletakkan poster infografis kualitatif.</p>
          </div>
        </section>
      )}

      {/* RINGKASAN PROGRAM (Level 3) */}
      <ProgramSummary />
    </div>
  );
}
