import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Sparkles, DollarSign, Package, Activity, Info } from 'lucide-react';

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const formatJuta = (val) => `${(val / 1000000).toFixed(1)} Jt`;
const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val);

const FilterButtons = ({ currentRange, setRange }) => (
  <div className="relative">
    <select
      value={currentRange}
      onChange={(e) => setRange(Number(e.target.value))}
      className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 text-[#1e3a8a] text-[10px] font-bold rounded pl-2 pr-6 py-1 cursor-pointer focus:outline-none shadow-sm transition-colors"
    >
      <option value={3}>3 BLN</option>
      <option value={6}>6 BLN</option>
      <option value={12}>12 BLN</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-[#1e3a8a]">
      <svg className="fill-current h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
    </div>
  </div>
);

const getPercentageJSX = (curr, prev) => {
  if (prev === 0) return '-';
  const pct = ((curr - prev) / prev) * 100;
  return (
    <span className={pct > 0 ? 'text-emerald-600' : pct < 0 ? 'text-rose-600' : 'text-slate-500'}>
      {pct > 0 ? '+' : ''}{pct.toFixed(0)}%
    </span>
  );
};

const ItikAnalytics = React.memo(function ItikAnalytics() {
  const { currentYear, itikPetelurOverviewData, itikPetelurYTD } = useDashboardData();
  const [timeFilter, setTimeFilter] = useState(12);

  const filteredOverviewData = useMemo(() => {
    return itikPetelurOverviewData.slice(-timeFilter);
  }, [itikPetelurOverviewData, timeFilter]);

  if (!filteredOverviewData || filteredOverviewData.length === 0) {
    return <p className="text-slate-500 italic text-sm">Data analitik belum tersedia untuk periode ini.</p>;
  }

  const {
    total_omzet, prev_total_omzet,
    total_vol, prev_total_vol,
    mentah_vol, asin_mentah_vol, asin_matang_vol,
    mentah_omzet, asin_mentah_omzet, asin_matang_omzet
  } = itikPetelurYTD;

  const yoyOmzetPct = prev_total_omzet ? (((total_omzet - prev_total_omzet) / prev_total_omzet) * 100).toFixed(0) : '-';

  // Omzet Composition Data for Donut Chart
  const compositionData = [
    { name: 'Telur Mentah', value: mentah_omzet, fill: '#93c5fd' }, 
    { name: 'Telur Asin Mentah', value: asin_mentah_omzet, fill: '#3b82f6' }, 
    { name: 'Telur Asin Matang', value: asin_matang_omzet, fill: '#1e3a8a' } 
  ].filter(d => d.value > 0);

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    // For donut chart, place label perfectly in the middle of the ring
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 'bold' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const generateItikInsight = () => {
    if (compositionData.length === 0) return "Belum ada penjualan tercatat.";
    
    // Sort to find top product
    const sortedProducts = [...compositionData].sort((a, b) => b.value - a.value);
    const topProduct = sortedProducts[0];
    const topPercent = ((topProduct.value / total_omzet) * 100).toFixed(0);

    let insightText = `Berdasarkan rekapitulasi data YTD, ${topProduct.name} menjadi kontributor utama dengan menyumbang ${topPercent}% dari total omzet (${formatRupiah(topProduct.value)}). `;
    
    if (Number(yoyOmzetPct) > 0) {
      insightText += `Secara keseluruhan, omzet tumbuh ${yoyOmzetPct}% dibanding tahun sebelumnya, menandakan ekspansi pasar yang sehat. `;
    } else if (Number(yoyOmzetPct) < 0) {
      insightText += `Omzet mengalami kontraksi sebesar ${Math.abs(yoyOmzetPct)}% dibanding tahun lalu. Diperlukan evaluasi strategi pemasaran atau pengecekan produktivitas ternak. `;
    }

    if (topProduct.name === 'Telur Asin Matang') {
      insightText += `Dominasi produk turunan matang membuktikan bahwa strategi hilirisasi telah berjalan optimal, memaksimalkan AOV (Average Order Value) untuk setiap butir telur.`;
    } else {
      insightText += `Disarankan untuk terus meningkatkan porsi produksi Telur Asin Matang guna mengoptimalkan margin keuntungan di masa depan.`;
    }

    return insightText;
  };

  const YTD_TABLE_DATA = [
    { 
      variabel: 'Penjualan Telur Mentah (Butir)', 
      prevYearData: 0, 
      currYearData: mentah_vol, 
      percent: getPercentageJSX(mentah_vol, 0), 
      isCurrency: false 
    },
    { 
      variabel: 'Penjualan Telur Asin Mentah (Butir)', 
      prevYearData: 0, 
      currYearData: asin_mentah_vol, 
      percent: getPercentageJSX(asin_mentah_vol, 0), 
      isCurrency: false 
    },
    { 
      variabel: 'Penjualan Telur Asin Matang (Butir)', 
      prevYearData: 0, 
      currYearData: asin_matang_vol, 
      percent: getPercentageJSX(asin_matang_vol, 0), 
      isCurrency: false 
    },
    { 
      variabel: 'Total Distribusi Keseluruhan (Butir)', 
      prevYearData: prev_total_vol || 0, 
      currYearData: total_vol || 0, 
      percent: getPercentageJSX(total_vol || 0, prev_total_vol || 0), 
      isCurrency: false 
    },
    { 
      variabel: 'Total Omzet Penjualan', 
      prevYearData: prev_total_omzet || 0, 
      currYearData: total_omzet || 0, 
      percent: getPercentageJSX(total_omzet || 0, prev_total_omzet || 0), 
      isCurrency: true 
    }
  ];

  const CustomChartTooltip = ({ active, payload, label, isCurrency }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-700 mb-1 border-b border-slate-100 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-500">{entry.name}:</span>
              <span className="font-bold text-[#1e3a8a]">
                {isCurrency ? formatRupiah(entry.value) : formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* LAYER 1: Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Omzet Penjualan YTD */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 text-emerald-50/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <DollarSign size={100} />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="bg-emerald-50/50 p-3 rounded-lg text-emerald-600 border border-emerald-100"><DollarSign size={24} /></div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet Penjualan YTD</p>
              <div className="flex items-end gap-2">
                <h2 className="text-xl lg:text-3xl font-extrabold text-[#1e3a8a]">
                  {formatRupiah(total_omzet)}
                </h2>
                {yoyOmzetPct !== '-' && (
                  <span className={`text-xs font-bold mb-1 ${Number(yoyOmzetPct) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {Number(yoyOmzetPct) >= 0 ? '▲' : '▼'} {Math.abs(yoyOmzetPct)}% YoY
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Distribusi Telur YTD */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-sky-500 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 text-sky-50/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Package size={100} />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="bg-sky-50/50 p-3 rounded-lg text-sky-600 border border-sky-100"><Package size={24} /></div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Distribusi Telur YTD</p>
              <h2 className="text-xl lg:text-3xl font-extrabold text-[#1e3a8a]">
                {formatNumber(total_vol)} <span className="text-lg text-slate-400 font-semibold">Butir</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 2: Portofolio Pendapatan & Insight Analitik */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        
        {/* Panel Portofolio Pendapatan (Donut Chart) */}
        <div className="xl:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[340px]">
          <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" /> Distribusi Omzet
          </h3>
          <div className="flex-1 w-full relative">
            {compositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                  <Pie
                    data={compositionData}
                    cx="50%" cy="45%" 
                    innerRadius={55} outerRadius={85} 
                    dataKey="value" stroke="#fff" strokeWidth={3}
                    labelLine={false} label={renderPieLabel}
                    isAnimationActive={true}
                  >
                  </Pie>
                  <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium italic">Belum ada data</div>
            )}
          </div>
        </div>

        {/* Panel Insight Analitik Dinamis */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4 relative z-10 border-b border-slate-100 pb-3">
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              Insight Analitik & Strategi
            </h3>
            <FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />
          </div>
          <div className="flex-1 flex flex-col relative z-10">
            <div className="text-[13px] text-slate-600 space-y-4 leading-relaxed font-medium">
              <p>{generateItikInsight()}</p>
              <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-100 flex gap-3 items-start shadow-sm mt-auto">
                <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900 mb-1">Rekomendasi Operasional</h4>
                  <p className="text-xs italic text-blue-800">
                    "Pantau terus grafik volume telur mentah pada panel di bawah. Jika rata-rata volume bulanan mulai stagnan atau menurun dalam 3 bulan terakhir, pertimbangkan untuk menyiapkan program peremajaan bebek petelur agar kapasitas produksi tetap terjamin."
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Info size={160} className="absolute -bottom-12 -right-12 text-blue-50 opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      {/* LAYER 3: Tren Penjualan Spesifik per Produk (Atas Bawah Layout) */}
      <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest mt-2 border-b border-slate-200 pb-2">
        Tren Penjualan Spesifik (Volume vs Omzet)
      </h3>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        
        {/* Panel Mentah */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[420px]">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-500 mb-4 border-b border-slate-100 pb-2">
            Telur Mentah
          </h4>
          
          {/* Top Chart: Volume Bar */}
          <div className="flex-1 w-full min-h-0 relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip isCurrency={false} />} />
                <Bar dataKey="mentah_vol" name="Volume" fill="#93c5fd" radius={[3, 3, 0, 0]} maxBarSize={30}>
                  <LabelList dataKey="mentah_vol" position="top" style={{ fontSize: '9px', fill: '#64748b', fontWeight: 'bold' }} formatter={(v) => formatJuta(v).replace(' Jt','J')} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bottom Chart: Omzet Line */}
          <div className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                <Line type="monotone" dataKey="mentah_omzet" name="Omzet" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}>
                  <LabelList dataKey="mentah_omzet" position="top" style={{ fontSize: '9px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => formatJuta(v).replace(' Jt','J')} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel Asin Mentah */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[420px]">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-[#3b82f6] mb-4 border-b border-slate-100 pb-2">
            Telur Asin Mentah
          </h4>
          
          <div className="flex-1 w-full min-h-0 relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip isCurrency={false} />} />
                <Bar dataKey="asin_mentah_vol" name="Volume" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={30}>
                  <LabelList dataKey="asin_mentah_vol" position="top" style={{ fontSize: '9px', fill: '#64748b', fontWeight: 'bold' }} formatter={(v) => formatJuta(v).replace(' Jt','J')} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                <Line type="monotone" dataKey="asin_mentah_omzet" name="Omzet" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}>
                  <LabelList dataKey="asin_mentah_omzet" position="top" style={{ fontSize: '9px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => formatJuta(v).replace(' Jt','J')} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel Asin Matang */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[420px]">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-[#1e3a8a] mb-4 border-b border-slate-100 pb-2">
            Telur Asin Matang
          </h4>
          
          <div className="flex-1 w-full min-h-0 relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip isCurrency={false} />} />
                <Bar dataKey="asin_matang_vol" name="Volume" fill="#1e3a8a" radius={[3, 3, 0, 0]} maxBarSize={30}>
                  <LabelList dataKey="asin_matang_vol" position="top" style={{ fontSize: '9px', fill: '#64748b', fontWeight: 'bold' }} formatter={(v) => formatJuta(v).replace(' Jt','J')} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 w-full min-h-0 relative border-t border-slate-50 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                <Line type="monotone" dataKey="asin_matang_omzet" name="Omzet" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}>
                  <LabelList dataKey="asin_matang_omzet" position="top" style={{ fontSize: '9px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => formatJuta(v).replace(' Jt','J')} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LAYER 4: Rekapitulasi YTD Table */}
      <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 mt-2">
        <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-4 mb-4">
          Rekapitulasi Year to Date (YTD)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-[#1e3a8a] font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Variabel</th>
                <th className="px-6 py-4 text-right">{Number(currentYear) - 1}</th>
                <th className="px-6 py-4 text-right">{currentYear}</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Persentase YoY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {YTD_TABLE_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{row.variabel}</td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {row.isCurrency ? formatRupiah(row.prevYearData) : formatNumber(row.prevYearData)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#1e3a8a]">
                    {row.isCurrency ? formatRupiah(row.currYearData) : formatNumber(row.currYearData)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
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

export default ItikAnalytics;
