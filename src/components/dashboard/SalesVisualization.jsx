import React, { useCallback } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { CHART_DATA_SALES } from '../../data/mockData';
import { TrendingUp, FileImage } from '../Icons';
import { useDashboardData } from '../../hooks/useDashboardData';

export default function SalesVisualization() {
  const { dynamicSalesChartData } = useDashboardData();

  const formatRupiahChart = useCallback((value) => `Rp ${(value / 1000000).toFixed(1)} Jt`, []);

  return (
    <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
        <TrendingUp size={18} className="text-[#1e3a8a]" />
        OVERVIEW
      </h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 flex flex-col">
          <div className="h-[300px] w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicSalesChartData.length > 0 ? dynamicSalesChartData : CHART_DATA_SALES} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dy={10} />
                <YAxis tickFormatter={formatRupiahChart} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dx={-10} />
                <Tooltip 
                  formatter={(value) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value), "Total Omzet"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="Omzet" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-l-4 border-yellow-400 pl-2">REKAPITULASI YEAR TO DATE (YTD)</h3>
            <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f8f9fa] text-[#25326a] font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 uppercase tracking-wider text-[11px]">VARIABEL</th>
                    <th className="px-4 py-3 text-right uppercase tracking-wider text-[11px]">2025</th>
                    <th className="px-4 py-3 text-right uppercase tracking-wider text-[11px]">2026</th>
                    <th className="px-4 py-3 text-right uppercase tracking-wider text-[11px]">PERSENTASE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">Total Omzet Penjualan</td>
                    <td className="px-4 py-3 text-right text-gray-600">Rp 12.710.000</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">Rp 57.100.000</td>
                    <td className="px-4 py-3 text-right text-green-600 font-bold">+349%</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">Capaian Target Produksi</td>
                    <td className="px-4 py-3 text-right text-gray-600">65%</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">92%</td>
                    <td className="px-4 py-3 text-right text-green-600 font-bold">+27%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col border border-indigo-100 rounded-md bg-indigo-50/30 items-center justify-center min-h-[300px] p-6 text-center shadow-inner relative overflow-hidden group cursor-help">
          <div className="absolute inset-0 bg-[#1e3a8a]/5 group-hover:bg-[#1e3a8a]/10 transition-colors"></div>
          <FileImage size={40} className="text-indigo-300 mb-3 relative z-10" />
          <p className="text-indigo-800/60 font-semibold text-sm relative z-10 uppercase tracking-widest">Placement Infografis</p>
          <p className="text-indigo-800/40 text-xs mt-2 relative z-10">Area alokasi untuk infografis analitik lanjutan sesuai spesifikasi desain.</p>
        </div>
      </div>
    </section>
  );
}
