import React from 'react';
import useAppStore from '../../store/useAppStore';
import { PROGRAM_DETAILS } from '../../data/mockData';
import { MapPin, Users, CheckCircle, TrendingUp, TableIcon, Paperclip, Plus } from '../Icons';
import EvidenceGallery from './EvidenceGallery';

export default function ProgramSummary() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const programContext = useAppStore((state) => state.programContext);
  const monthlyProgress = useAppStore((state) => state.monthlyProgress);

  const details = React.useMemo(() => PROGRAM_DETAILS[selectedProgram] || PROGRAM_DETAILS["default"], [selectedProgram]);

  return (
    <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
        <TableIcon size={18} className="text-[#1e3a8a]" />
        RINGKASAN PROGRAM
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={14}/> LOKASI</p>
            <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{programContext?.location || details.lokasi}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users size={14}/> PENERIMA MANFAAT</p>
            <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{programContext?.beneficiaries || details.penerima}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CheckCircle size={14}/> OBJEKTIF</p>
            <p className="text-[13px] font-medium text-gray-700 leading-relaxed text-justify">{programContext?.objective || details.objektif}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CheckCircle size={14}/> KPI</p>
            <p className="text-[13px] font-medium text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{programContext?.kpi || "-"}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp size={14}/> TPB/SDGS</p>
            <p className="text-[13px] font-semibold text-[#1e3a8a]">{programContext?.tpb || details.tpb}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center pl-2">
          <div className="bg-[#f8f9fa] p-4 rounded-md border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a8a]"></div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">ANGGARAN</p>
            <p className="text-[18px] font-extrabold text-[#1e3a8a] tracking-tight">{programContext?.budget_text || details.anggaran}</p>
          </div>
          <div className="bg-[#f8f9fa] p-4 rounded-md border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">REALISASI BIAYA</p>
            <p className="text-[18px] font-extrabold text-green-600 tracking-tight">{monthlyProgress?.budget_realization_text || "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-gray-100">
        <div>
          <p className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-2">PROGRESS BULAN LALU</p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 min-h-[80px] italic">
            {monthlyProgress?.past_month_realization || "Belum ada rekapan progress."}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-2">RENCANA KERJA BULAN INI</p>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 min-h-[80px] italic">
            {monthlyProgress?.next_month_plan || "Belum ada rencana tindak lanjut."}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
          <Paperclip size={18} className="text-[#1e3a8a]" /> EVIDEN PROGRES (GALERI)
        </p>
        <EvidenceGallery />
      </div>
    </section>
  );
}
