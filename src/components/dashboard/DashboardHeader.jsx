import React from 'react';
import useAppStore from '../../store/useAppStore';
import { PROGRAMS, PROGRAM_DETAILS, PROGRAM_IMAGES } from '../../data/mockData';
import { ChevronDown } from '../Icons';

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function DashboardHeader() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);
  const programListFromStore = useAppStore((state) => state.programList);

  const availablePrograms = programListFromStore?.length > 0 ? programListFromStore : PROGRAMS;
  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);
  const details = React.useMemo(() => PROGRAM_DETAILS[selectedProgram] || PROGRAM_DETAILS["default"], [selectedProgram]);

  const currentMonthStr = selectedDate ? selectedDate.split('-')[1] : "01";
  const currentYearStr = selectedDate ? selectedDate.split('-')[0] : "2026";
  
  const handleMonthChange = (e) => {
    setSelectedDate(`${currentYearStr}-${e.target.value}-01`);
  };

  const handleYearChange = (e) => {
    setSelectedDate(`${e.target.value}-${currentMonthStr}-01`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      <div className="lg:w-1/2 flex flex-col justify-center gap-5">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-3 tracking-tight leading-tight">
            {selectedProgram}
          </h2>
          <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed border-l-4 border-[#1e3a8a] pl-3">
            {details.desc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-50">
          {/* Program Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none bg-[#f8f9fa] border border-gray-200 text-[#25326a] font-bold text-[13px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] cursor-pointer shadow-sm uppercase tracking-wide"
              value={selectedProgram} 
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              {availablePrograms.map(prog => (
                <option key={prog} value={prog}>{prog.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#25326a] pointer-events-none" size={18} strokeWidth={2.5} />
          </div>

          {/* Month Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[14px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
              value={currentMonthStr}
              onChange={handleMonthChange}
            >
              {INDO_MONTHS.map((m, i) => {
                const val = (i + 1).toString().padStart(2, '0');
                return <option key={val} value={val}>{m}</option>;
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} strokeWidth={2.5} />
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[14px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
              value={currentYearStr}
              onChange={handleYearChange}
            >
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[220px] lg:min-h-0">
        <img src={bannerImage} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
      </div>
    </div>
  );
}
