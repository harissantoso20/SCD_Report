import React from 'react';
import { TrendingUp } from '../Icons';

export default function MonthlyProgressForm({ monthLabels, monthlyState, setMonthlyState }) {
  return (
    <section className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-3 mb-5 gap-5">
        <h2 className="text-[14px] font-bold text-[#25326a] uppercase flex gap-2"><TrendingUp size={18} className="text-[#1e3a8a]"/>Progres Bulanan</h2>
        <div className="w-full md:w-[30%]">
          <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Realisasi Anggaran</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[13px] font-bold">Rp.</span>
            <input type="text" className="w-full border border-gray-300 rounded-sm py-2 pl-9 pr-3 text-[13px] focus:ring-[#1e3a8a]" value={monthlyState.budget_realization_text} onChange={(e) => setMonthlyState(prev => ({...prev, budget_realization_text: e.target.value}))} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-[13px] font-bold mb-1.5">Realisasi Bulan {monthLabels.prev}</label>
          <textarea className="w-full border border-gray-300 rounded-sm p-3 text-[13px] min-h-[120px]" value={monthlyState.past_month_realization} onChange={(e) => setMonthlyState(prev => ({...prev, past_month_realization: e.target.value}))} />
        </div>
        <div>
          <label className="block text-[13px] font-bold mb-1.5">Rencana Bulan {monthLabels.next}</label>
          <textarea className="w-full border border-gray-300 rounded-sm p-3 text-[13px] min-h-[120px]" value={monthlyState.next_month_plan} onChange={(e) => setMonthlyState(prev => ({...prev, next_month_plan: e.target.value}))} />
        </div>
      </div>
    </section>
  );
}
