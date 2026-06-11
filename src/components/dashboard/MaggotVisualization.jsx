import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import useAppStore from '../../store/useAppStore';
import { PROGRAM_IMAGES, PROGRAM_DETAILS } from '../../data/mockData';
import { Zap, TrendingUp, Sparkles, Box, DollarSign, Recycle, Bug } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';

// Chart Helpers
const FilterButtons = ({ currentRange, setRange }) => (
  <div className="relative">
    <select
      value={currentRange}
      onChange={(e) => setRange(Number(e.target.value))}
      className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 text-[#25326a] text-[11px] font-bold rounded-md pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] transition-colors shadow-sm"
    >
      <option value={3}>3 BULAN</option>
      <option value={6}>6 BULAN</option>
      <option value={12}>12 BULAN</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#25326a]">
      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

const renderLabelKg = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 8} fill="#6b7280" fontSize={10} fontWeight="bold" textAnchor="middle">
      {value >= 1000 ? (value / 1000).toFixed(1).replace('.0', '') + 'K' : value}
    </text>
  );
};

const renderLineLabelRp = (props) => {
  const { x, y, value } = props;
  if (!value) return null;
  return (
    <text x={x} y={y - 12} fill="#374151" fontSize={10} fontWeight="bold" textAnchor="middle">
      {(value / 1000000).toFixed(1).replace('.0', '') + 'Jt'}
    </text>
  );
};

const MaggotVisualization = React.memo(function MaggotVisualization() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  
  const { 
    maggotBioconversionData, 
    maggotFinancialData, 
    maggotYTD,
    currentYear
  } = useDashboardData();

  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);
  const details = React.useMemo(() => PROGRAM_DETAILS[selectedProgram] || PROGRAM_DETAILS["default"], [selectedProgram]);

  // Local state for chart time ranges (in months)
  const [timeFilter, setTimeFilter] = useState(12);

  // Sliced data based on single filter
  const bioData = React.useMemo(() => maggotBioconversionData.slice(-timeFilter), [maggotBioconversionData, timeFilter]);
  const filteredFinancialData = React.useMemo(() => maggotFinancialData.slice(-timeFilter), [maggotFinancialData, timeFilter]);

  const selectedWasteManaged = bioData.reduce((sum, item) => sum + (Number(item.sampah) || 0), 0);

  const getPercentage = (curr, prev) => {
    if (prev === 0) return '-';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
  };

  const generateSmartAnalogy = (kg) => {
    if (!kg) return "Belum ada data konversi sampah organik pada periode ini.";
    const households = Math.round(kg / 2); 
    const methane = (kg * 0.05).toFixed(1); 
    const startMonth = bioData.length > 0 ? bioData[0].bulan : '';
    const endMonth = bioData.length > 0 ? bioData[bioData.length - 1].bulan : '';
    
    // Find peak waste month
    const peakMonthData = [...bioData].sort((a, b) => (Number(b.sampah) || 0) - (Number(a.sampah) || 0))[0];
    let peakStatement = '';
    if (peakMonthData && Number(peakMonthData.sampah) > 0) {
      peakStatement = `Secara bulanan, performa penguraian sampah tertinggi pada periode ini berhasil dicapai pada bulan ${peakMonthData.bulan} dengan volume ${new Intl.NumberFormat('id-ID').format(peakMonthData.sampah)} Kg.`;
    }

    // Find peak sales month
    const peakSalesData = [...filteredFinancialData].sort((a, b) => (b.omzet_kasgot + b.omzet_kering + b.omzet_fresh) - (a.omzet_kasgot + a.omzet_kering + a.omzet_fresh))[0];
    let peakSalesStatement = '';
    if (peakSalesData) {
      const totalOmzetPeak = peakSalesData.omzet_kasgot + peakSalesData.omzet_kering + peakSalesData.omzet_fresh;
      if (totalOmzetPeak > 0) {
        peakSalesStatement = ` Sementara itu, rekor omzet penjualan tertinggi diraih pada bulan ${peakSalesData.bulan} menembus Rp ${(totalOmzetPeak / 1000000).toFixed(1)} Jt.`;
      }
    }

    // Calculate overall sales
    const totalSalesOmzet = filteredFinancialData.reduce((sum, d) => sum + d.omzet_kasgot + d.omzet_kering + d.omzet_fresh, 0);
    const salesOverallStatement = ` Dari sisi komersial, total pendapatan dari penjualan produk turunan maggot (fresh, kering, kasgot) menyentuh angka Rp ${(totalSalesOmzet / 1000000).toFixed(1)} Jt.`;

    return (
      <div className="text-slate-600 text-[13px] leading-relaxed space-y-3">
        {(peakStatement || peakSalesStatement) && (
          <p>
            {peakStatement && <span className="font-bold text-[#1e3a8a]">{peakStatement}</span>}
            {peakSalesStatement && <span className="font-bold text-blue-600">{peakSalesStatement}</span>}
          </p>
        )}
        <p>
          Secara keseluruhan dalam periode <strong className="text-[#1e3a8a]">{startMonth} - {endMonth} {currentYear}</strong>, sebanyak <strong className="text-blue-600">{new Intl.NumberFormat('id-ID').format(kg)} Kg</strong> sampah organik berhasil terurai. Ini setara dengan mencegah timbunan limbah harian dari <strong>±{households} rumah tangga</strong> serta mencegah pelepasan <strong>±{methane} Kg emisi metana (CH4)</strong> ke atmosfer.{salesOverallStatement}
        </p>
        <p>
          Jika dikomparasikan secara *Year-on-Year* (YoY) dengan tahun sebelumnya, tren performa operasional menunjukkan peningkatan berkelanjutan, baik dari sisi kapasitas pengolahan limbah organik maupun optimalisasi monetisasi sirkular ekonominya.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* ----------------- TOP ROW (2 COLUMNS) ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 1. Insight Analitik (Takes up 2 columns) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h4 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              Insight Analitik
            </h4>
            <FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />
          </div>
          <div className="flex-1 relative z-10">
            {generateSmartAnalogy(selectedWasteManaged)}
          </div>
          <div className="absolute -bottom-6 -right-6 text-blue-50/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
             <Sparkles size={140} />
          </div>
        </div>

        {/* 2. KPIs Stack (Waste Managed, Total Omzet, Total Penjualan Fresh) */}
        <div className="flex flex-col gap-4">
          
          {/* Waste Managed YTD */}
          <div className="bg-blue-50/50 rounded-lg shadow-sm border border-blue-100 p-4 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex-1">
            <div className="relative z-10 flex items-start gap-3">
              <div className="bg-white p-2.5 rounded-lg text-blue-600 shadow-sm border border-blue-100 mt-1"><Recycle size={20} className="animate-[spin_4s_linear_infinite]" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Waste Managed (YTD)</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-xl lg:text-3xl font-black text-[#1e3a8a] tracking-tighter">
                    {new Intl.NumberFormat('id-ID').format(maggotYTD?.currWaste || 0)}
                  </h3>
                  <span className="text-sm font-bold text-blue-700">Kg</span>
                </div>
                <p className="text-[10px] font-semibold text-blue-800 mt-1">Sampah Organik Tereduksi</p>
              </div>
            </div>
            {/* Sparkline decoration */}
            <div className="absolute -bottom-4 -right-4 text-blue-200/50 group-hover:translate-x-2 transition-transform duration-500">
                <svg width="120" height="80" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 40 C 20 35, 40 45, 60 20 S 80 0, 100 5" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Total Omzet YTD */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex-1">
            <div className="relative z-10 flex items-start gap-3">
              <div className="bg-blue-50/50 p-2.5 rounded-lg text-blue-600 shadow-sm border border-blue-100 mt-1"><DollarSign size={20} className="animate-[pulse_2s_ease-in-out_infinite]" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet YTD</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-xl lg:text-2xl font-black text-[#1e3a8a] tracking-tighter">
                    Rp {((maggotYTD?.currOmzet || 0) / 1000000).toFixed(1)} <span className="text-sm font-bold text-slate-400">Jt</span>
                  </h3>
                </div>
              </div>
            </div>
            {/* Doodle Art */}
            <div className="absolute -bottom-4 -right-2 text-blue-100/40 group-hover:translate-x-1 transition-transform duration-500 pointer-events-none">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 50 A 40 40 0 0 1 90 50 A 40 40 0 0 1 10 50" opacity="0.4" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="10 10" />
              </svg>
            </div>
          </div>

          {/* Total Penjualan Fresh Maggot YTD */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex-1">
            <div className="relative z-10 flex items-start gap-3">
              <div className="bg-indigo-50/50 p-2.5 rounded-lg text-indigo-600 shadow-sm border border-indigo-100 mt-1"><Bug size={20} className="animate-[bounce_3s_ease-in-out_infinite]" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fresh Maggot Terjual</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-xl lg:text-2xl font-black text-[#1e3a8a] tracking-tighter">
                    {new Intl.NumberFormat('id-ID').format(maggotYTD?.currFresh || 0)}
                  </h3>
                  <span className="text-sm font-bold text-slate-400">Kg</span>
                </div>
              </div>
            </div>
            {/* Doodle Art */}
            <div className="absolute -bottom-2 -right-4 text-indigo-100/40 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
              <svg width="100" height="80" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="50" r="10" opacity="0.6" />
                <circle cx="50" cy="50" r="15" opacity="0.8" />
                <circle cx="80" cy="50" r="10" opacity="0.6" />
              </svg>
            </div>
          </div>

        </div>
      </div>


      {/* ----------------- BOTTOM ROW (3 CHARTS) ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CHART 1: Konversi Input-Output */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h2 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-blue-500" />
              Konversi Input/Output
            </h2>
          </div>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bioData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} dy={10} padding={{ left: 30, right: 30 }} />
                <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="sampah" name="Sampah Organik (Kg)" fill="#1e3a8a" barSize={16} radius={[4, 4, 0, 0]} label={renderLabelKg} />
                <Bar dataKey="maggot" name="Fresh Maggot (Kg)" fill="#3b82f6" barSize={16} radius={[4, 4, 0, 0]} label={renderLabelKg} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#1e3a8a] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">SAMPAH (IN)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">MAGGOT (OUT)</span></div>
          </div>
        </div>

        {/* CHART 2: Tren Penjualan (Volume) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h2 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Box size={16} className="text-[#1e3a8a]" />
              Tren Volume Penjualan
            </h2>
          </div>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredFinancialData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} dy={10} padding={{ left: 30, right: 30 }} />
                <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="kasgot" name="Kasgot (Kg)" stackId="a" fill="#1e3a8a" barSize={24} />
                <Bar dataKey="kering" name="Maggot Kering (Kg)" stackId="a" fill="#f43f5e" barSize={24} />
                <Bar dataKey="fresh" name="Fresh Maggot (Kg)" stackId="a" fill="#3b82f6" barSize={24} radius={[4, 4, 0, 0]} label={renderLabelKg} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-3 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">FRESH</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#f43f5e] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">KERING</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#1e3a8a] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">KASGOT</span></div>
          </div>
        </div>

        {/* CHART 3: Tren Omzet (Revenue) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h2 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-[#f43f5e]" />
              Tren Omzet Produk
            </h2>
          </div>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredFinancialData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} dy={10} padding={{ left: 30, right: 30 }} />
                <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                <Tooltip cursor={{fill: '#f8fafc', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)} />
                <Line type="monotone" dataKey="omzet_kasgot" name="Omzet Kasgot" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} label={renderLineLabelRp} />
                <Line type="monotone" dataKey="omzet_kering" name="Omzet Kering" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} label={renderLineLabelRp} />
                <Line type="monotone" dataKey="omzet_fresh" name="Omzet Fresh" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} label={renderLineLabelRp} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-3 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#3b82f6]"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">FRESH</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#f43f5e]"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">KERING</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#1e3a8a]"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">KASGOT</span></div>
          </div>
        </div>

      </div>

      {/* ----------------- REKAPITULASI YTD ----------------- */}
      <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 mt-4">
        <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
          Rekapitulasi Year to Date (YTD)
        </h3>
        <div className="w-full overflow-x-auto minimal-scrollbar flex-1 flex flex-col justify-center">
          <table className="w-full text-xs md:text-sm border-collapse border border-slate-100 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 md:p-4 text-left font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">Variabel</th>
                <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">{Number(currentYear) - 1}</th>
                <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">{currentYear}</th>
                <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">Persentase YoY</th>
              </tr>
            </thead>
            <tbody>
              {[
                { variabel: 'Waste Managed (Kg)', prevYearData: maggotYTD?.prevWaste || 0, currYearData: maggotYTD?.currWaste || 0, percent: getPercentage(maggotYTD?.currWaste || 0, maggotYTD?.prevWaste || 0), isCurrency: false },
                { variabel: 'Fresh Maggot Terjual (Kg)', prevYearData: maggotYTD?.prevFresh || 0, currYearData: maggotYTD?.currFresh || 0, percent: getPercentage(maggotYTD?.currFresh || 0, maggotYTD?.prevFresh || 0), isCurrency: false },
                { variabel: 'Total Omzet Keseluruhan', prevYearData: maggotYTD?.prevOmzet || 0, currYearData: maggotYTD?.currOmzet || 0, percent: getPercentage(maggotYTD?.currOmzet || 0, maggotYTD?.prevOmzet || 0), isCurrency: true },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 md:p-4 font-semibold text-slate-600">{row.variabel}</td>
                  <td className="p-3 md:p-4 text-center text-slate-500 font-medium">
                    {row.isCurrency 
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(row.prevYearData) 
                      : new Intl.NumberFormat('id-ID').format(row.prevYearData)}
                  </td>
                  <td className="p-3 md:p-4 text-center font-extrabold text-[#1e3a8a]">
                    {row.isCurrency 
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(row.currYearData) 
                      : new Intl.NumberFormat('id-ID').format(row.currYearData)}
                  </td>
                  <td className={`p-3 md:p-4 text-center font-bold ${row.percent.startsWith('+') ? 'text-blue-600' : (row.percent === '-' ? 'text-slate-400' : 'text-rose-500')}`}>
                    {row.percent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default MaggotVisualization;
