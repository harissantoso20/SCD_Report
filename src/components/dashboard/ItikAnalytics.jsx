import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList, Label
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Sparkles, DollarSign, Package, TrendingUp, Info, Activity } from 'lucide-react';

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

const ItikAnalytics = React.memo(function ItikAnalytics() {
  const { itikPetelurOverviewData, itikPetelurYTD } = useDashboardData();
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
    mentah_omzet, asin_mentah_omzet, asin_matang_omzet,
    mentah_harga, asin_mentah_harga, asin_matang_harga
  } = itikPetelurYTD;

  const yoyOmzetPct = prev_total_omzet ? (((total_omzet - prev_total_omzet) / prev_total_omzet) * 100).toFixed(0) : '-';
  const hilirisasiRatio = total_vol ? (((asin_mentah_vol + asin_matang_vol) / total_vol) * 100).toFixed(1) : 0;

  // Margin Analysis Data
  const marginData = [
    { name: 'Mentah', harga: mentah_harga, fill: '#94a3b8' },
    { name: 'Asin Mentah', harga: asin_mentah_harga, fill: '#3b82f6' },
    { name: 'Asin Matang', harga: asin_matang_harga, fill: '#1e3a8a' }
  ].filter(d => d.harga > 0);

  // Omzet Composition Data
  const compositionData = [
    { name: 'Telur Mentah', value: mentah_omzet, fill: '#93c5fd' }, // Biru Muda
    { name: 'Telur Asin Mentah', value: asin_mentah_omzet, fill: '#3b82f6' }, // Biru Sedang
    { name: 'Telur Asin Matang', value: asin_matang_omzet, fill: '#1e3a8a' } // Biru Tua
  ].filter(d => d.value > 0);

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 'bold' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const pctVolMatang = total_vol ? ((asin_matang_vol / total_vol) * 100).toFixed(1) : 0;
  const pctOmzetMatang = total_omzet ? ((asin_matang_omzet / total_omzet) * 100).toFixed(1) : 0;

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">

      {/* LAPISAN 1: Indikator Kinerja & Hilirisasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-emerald-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4">
          <div className="bg-emerald-50/50 p-3 rounded-lg text-emerald-600 border border-emerald-100"><DollarSign size={24} /></div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet Penjualan YTD</p>
            <div className="flex items-end gap-2">
              <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
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
        
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-sky-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4">
          <div className="bg-sky-50/50 p-3 rounded-lg text-sky-600 border border-sky-100"><Package size={24} /></div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Distribusi Telur YTD</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {formatNumber(total_vol)} <span className="text-lg text-slate-400 font-semibold">Butir</span>
            </h2>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-indigo-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden">
          <div className="bg-indigo-50/50 p-3 rounded-lg text-indigo-600 border border-indigo-100 relative z-10"><TrendingUp size={24} /></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rasio Hilirisasi</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {hilirisasiRatio}% <span className="text-sm text-slate-400 font-semibold">Olahan</span>
            </h2>
          </div>
          {/* Subtle decoration */}
          <div className="absolute -bottom-6 -right-6 text-indigo-100/40 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        {/* LAPISAN 2: Pembuktian Nilai Tambah */}
        <div className="xl:col-span-1 bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[320px]">
          <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Komparasi Harga Satuan</h3>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => formatRupiah(val)} />
                <Bar dataKey="harga" radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={true}>
                  {marginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="harga" position="top" style={{ fontSize: '10px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => formatRupiah(v)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LAPISAN 3: Analisis Portofolio Pendapatan */}
        <div className="xl:col-span-2 bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[320px]">
          <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Analisis Portofolio Pendapatan (YTD)</h3>
          
          <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
            {/* Panel Kiri: Donut Chart */}
            <div className="flex-1 w-full h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%" cy="50%" innerRadius="45%" outerRadius="80%" dataKey="value" stroke="#fff" strokeWidth={2}
                    labelLine={false} label={renderPieLabel}
                  >
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Panel Kanan: Horizontal Progress Bar */}
            <div className="flex-1 w-full flex flex-col justify-center gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-3">Kontribusi Telur Asin Matang</h4>
                
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Persentase Volume</span>
                    <span className="text-[#3b82f6]">{pctVolMatang}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-[#3b82f6] h-2.5 rounded-full" style={{ width: `${pctVolMatang}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Persentase Omzet</span>
                    <span className="text-[#1e3a8a]">{pctOmzetMatang}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-[#1e3a8a] h-2.5 rounded-full" style={{ width: `${pctOmzetMatang}%` }}></div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2 items-start">
                  <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-[10px] text-slate-600 leading-tight">
                    Volume {pctVolMatang}% mampu menghasilkan {pctOmzetMatang}% total omzet. Bukti efektivitas margin produk olahan matang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAPISAN 4: Tren Produksi & Stabilitas + Insight Analitik */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
        <div className="xl:col-span-3 bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[380px]">
          <div className="flex justify-between items-start md:items-center mb-4 flex-col md:flex-row gap-2">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-widest">Tren Produksi Gabungan</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#93c5fd]"></div> Mentah</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#3b82f6]"></div> Asin Mentah</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#1e3a8a]"></div> Asin Matang</div>
                <div className="flex items-center gap-1 ml-2"><div className="w-3 h-1 bg-[#10b981] rounded-full"></div> Omzet</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis yAxisId="left" hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                <YAxis yAxisId="right" orientation="right" hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val, name) => {
                    if (name === 'Omzet') return formatRupiah(val);
                    return formatNumber(val);
                  }} 
                />
                
                <Bar yAxisId="left" dataKey="mentah_vol" stackId="a" name="Telur Mentah" fill="#93c5fd" maxBarSize={40} />
                <Bar yAxisId="left" dataKey="asin_mentah_vol" stackId="a" name="Telur Asin Mentah" fill="#3b82f6" maxBarSize={40} />
                <Bar yAxisId="left" dataKey="asin_matang_vol" stackId="a" name="Telur Asin Matang" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                
                <Line yAxisId="right" type="monotone" dataKey="total_omzet" name="Omzet" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}>
                  <LabelList dataKey="total_omzet" position="top" style={{ fontSize: '10px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[380px]">
          <div className="flex items-center justify-between gap-2 mb-4 relative z-10 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                Insight Analitik
              </h3>
            </div>
            <FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />
          </div>
          <div className="text-[13px] text-slate-600 space-y-3 leading-relaxed font-medium flex-1 overflow-y-auto">
            <p>
              Tingkat hilirisasi produk itik petelur saat ini mencapai <span className="font-bold text-[#1e3a8a]">{hilirisasiRatio}%</span>. 
              Artinya, sebagian besar produksi sudah berhasil diolah menjadi nilai tambah, tidak sekadar dijual mentah.
            </p>
            <p>
              Dari sisi margin, Telur Asin Matang memberikan nilai jual tertinggi rata-rata <span className="font-bold text-emerald-600">{formatRupiah(asin_matang_harga)}/butir</span>.
            </p>
            <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start shadow-sm">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs italic text-blue-900">
                "Jika tinggi batang volume pada grafik tren menyusut secara konsisten, ini adalah sinyal biologis bahwa itik sudah memasuki masa afkir (tua) dan perlu peremajaan kandang."
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
});

export default ItikAnalytics;
