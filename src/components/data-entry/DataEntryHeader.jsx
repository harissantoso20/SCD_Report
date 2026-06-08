import React from 'react';
import useAppStore from '../../store/useAppStore';
import { PROGRAMS, PROGRAM_IMAGES } from '../../data/mockData';
import { ChevronDown } from '../Icons';

export default function DataEntryHeader({ isLoading }) {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);
  const programListFromStore = useAppStore((state) => state.programList);

  const availablePrograms = programListFromStore?.length > 0 ? programListFromStore : PROGRAMS;
  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      <div className="lg:w-1/2 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-2 tracking-tight">Data Entry {isLoading && <span className="text-sm font-normal text-gray-400">(Loading...)</span>}</h2>
          <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed">Update ringkasan program dan data kuantitatif program sustainable community development.</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative z-50 mt-6 lg:mt-0">
          <div className="flex-1 relative">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">Periode</label>
            <input type="date" className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-[#1e3a8a]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          <div className="flex-1 relative z-50">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">Program</label>
            <select className="w-full border border-gray-300 rounded-sm p-2 text-sm appearance-none focus:ring-[#1e3a8a]" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
              {availablePrograms.map(prog => <option key={prog} value={prog}>{prog}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-8 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[200px] lg:min-h-0">
        <img src={bannerImage} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
      </div>
    </div>
  );
}
