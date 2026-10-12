import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import { useLingkarTambangData } from '../../hooks/programs/useLingkarTambangData';
import GeminiInsight from './GeminiInsight';
import BeneficiaryPanel from './BeneficiaryPanel';
import {
  Sprout, ShoppingBag, TrendingUp, Scale, DollarSign, Layers, Activity,
  PieChart as PieIcon, BarChart2
} from 'lucide-react';

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
const formatJuta = (val) => {
  if (!val) return '0';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} Jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} Rb`;
  return val.toString();
};

const VARIETY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

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
      <svg className="fill-current h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
);

const ChartCard = ({ title, icon: Icon, iconColor, children, filterRange, setFilterRange }) => (
  <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
      <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
        <Icon size={18} className={iconColor} />
        {title}
      </h3>
      {setFilterRange && <FilterButtons currentRange={filterRange} setRange={setFilterRange} />}
    </div>
    <div className="w-full h-[300px]">
      {children}
    </div>
  </section>
);

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '11px', fontWeight: 'bold' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const GrowthBadge = ({ curr, prev }) => {
  if (!prev || prev === 0) return curr > 0
    ? <span className="text-emerald-600 font-semibold">+100%</span>
    : <span className="text-slate-400">—</span>;
  const pct = ((curr - prev) / prev) * 100;
  return (
    <span className={pct > 0 ? 'text-emerald-600 font-semibold' : pct < 0 ? 'text-rose-600 font-semibold' : 'text-slate-500 font-semibold'}>
      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
};

const LingkarTambangAnalytics = React.memo(function LingkarTambangAnalytics() {
  const {
    lingkarTambangOverviewData,
    lingkarTambangYTD,
    currentYear,
  } = useLingkarTambangData();

  const [filter1, setFilter1] = useState(12); // Panen & Penjualan
  const [filter2, setFilter2] = useState(12); // Finansial
  const prevYear = Number(currentYear) - 1;

  const filteredData1 = useMemo(() => lingkarTambangOverviewData.slice(-filter1), [lingkarTambangOverviewData, filter1]);
  const filteredData2 = useMemo(() => lingkarTambangOverviewData.slice(-filter2), [lingkarTambangOverviewData, filter2]);

  // Dual Pie Data: Omzet & Volume
  const omzetPieData = useMemo(() => {
    if (!lingkarTambangYTD.product_mix || lingkarTambangYTD.product_mix.length === 0) {
      return [{ name: 'Melon Inthanon', value: 1, fill: '#10b981' }];
    }
    return lingkarTambangYTD.product_mix
      .map((item, idx) => ({
        name: item.name,
        value: item.omzet || 0,
        fill: VARIETY_COLORS[idx % VARIETY_COLORS.length]
      }))
      .filter(d => d.value > 0);
  }, [lingkarTambangYTD.product_mix]);

  const volumePieData = useMemo(() => {
    if (!lingkarTambangYTD.product_mix || lingkarTambangYTD.product_mix.length === 0) {
      return [{ name: 'Melon Inthanon', value: 1, fill: '#10b981' }];
    }
    return lingkarTambangYTD.product_mix
      .map((item, idx) => ({
        name: item.name,
        value: item.panen_kg || item.penjualan_kg || 0,
        fill: VARIETY_COLORS[idx % VARIETY_COLORS.length]
      }))
      .filter(d => d.value > 0);
  }, [lingkarTambangYTD.product_mix]);

  const legendItems = useMemo(() => {
    if (!lingkarTambangYTD.product_mix || lingkarTambangYTD.product_mix.length === 0) {
      return [{ name: 'Melon Inthanon', fill: '#10b981' }];
    }
    return lingkarTambangYTD.product_mix.map((item, idx) => ({
      name: item.name,
      fill: VARIETY_COLORS[idx % VARIETY_COLORS.length]
    }));
  }, [lingkarTambangYTD.product_mix]);

  // Gauge
  const rate = Number(lingkarTambangYTD.sell_through_rate) || 0;
  const clampedRate = Math.min(100, Math.max(0, rate));
  const gaugeData = [
    { name: 'Terserap Pasar', value: clampedRate, fill: clampedRate >= 80 ? '#10b981' : clampedRate >= 50 ? '#f59e0b' : '#ef4444' },
    { name: 'Belum Terjual', value: 100 - clampedRate, fill: '#e2e8f0' }
  ];

  const YTD_ROWS = [
    { label: 'Total Produksi Panen', unit: 'Kg', curr: lingkarTambangYTD.total_panen_kg, prev: lingkarTambangYTD.prev_total_panen_kg, isCurrency: false },
    { label: 'Total Produksi Panen', unit: 'Buah', curr: lingkarTambangYTD.total_panen_buah, prev: lingkarTambangYTD.prev_total_panen_buah, isCurrency: false },
    { label: 'Volume Terjual', unit: 'Kg', curr: lingkarTambangYTD.total_penjualan_kg, prev: lingkarTambangYTD.prev_total_penjualan_kg, isCurrency: false },
    { label: 'Volume Terjual', unit: 'Buah', curr: lingkarTambangYTD.total_penjualan_buah, prev: lingkarTambangYTD.prev_total_penjualan_buah, isCurrency: false },
    { label: 'Rata-Rata Bobot Buah', unit: 'Kg/Buah', curr: lingkarTambangYTD.avg_bobot_buah, prev: lingkarTambangYTD.prev_total_panen_buah > 0 ? (lingkarTambangYTD.prev_total_panen_kg / lingkarTambangYTD.prev_total_panen_buah).toFixed(2) : 0, isCurrency: false },
    { label: 'Total Omzet Penjualan', unit: '', curr: lingkarTambangYTD.total_omzet, prev: lingkarTambangYTD.prev_total_omzet, isCurrency: true },
    { label: 'Total Biaya Operasional', unit: '', curr: lingkarTambangYTD.total_operasional, prev: lingkarTambangYTD.prev_total_operasional, isCurrency: true },
    { label: 'Laba Bersih Operasional', unit: '', curr: lingkarTambangYTD.total_laba_bersih, prev: lingkarTambangYTD.prev_total_laba_bersih, isCurrency: true },
  ];

  return (
    <div className="w-full flex flex-col gap-5 font-sans text-slate-800">

      {/* ── ROW 1: KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-emerald-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600 border border-emerald-100 z-10 relative">
            <Sprout size={24} className="animate-[pulse_3s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Panen (YTD)</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">{formatNumber(lingkarTambangYTD.total_panen_kg)} <span className="text-sm font-semibold text-slate-400">Kg</span></h2>
            <p className="text-[11px] font-medium text-slate-500 mt-1"><span className="font-bold text-emerald-700">{formatNumber(lingkarTambangYTD.total_panen_buah)}</span> Buah Dipanen</p>
          </div>
          <div className="absolute -bottom-4 -right-2 text-emerald-100/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="90" height="90" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" opacity="0.4" /></svg>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600 border border-blue-100 z-10 relative">
            <ShoppingBag size={24} className="animate-[bounce_3s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet Penjualan</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">Rp {formatRupiah(lingkarTambangYTD.total_omzet)}</h2>
            <p className="text-[11px] font-medium text-slate-500 mt-1"><span className="font-bold text-blue-700">{formatNumber(lingkarTambangYTD.total_penjualan_kg)} Kg</span> Terjual ({lingkarTambangYTD.sell_through_rate}%)</p>
          </div>
          <div className="absolute -bottom-4 -right-2 text-blue-100/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="90" height="90" viewBox="0 0 100 100" fill="currentColor"><path d="M20 80 Q 50 20, 80 80 Z" opacity="0.4" /></svg>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-amber-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600 border border-amber-100 z-10 relative">
            <Scale size={24} />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rata-Rata Bobot Buah</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">{lingkarTambangYTD.avg_bobot_buah} <span className="text-sm font-semibold text-slate-400">Kg/Buah</span></h2>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Harga Rata-Rata: <span className="font-bold text-amber-700">Rp {formatRupiah(lingkarTambangYTD.avg_harga_jual)}/Kg</span></p>
          </div>
          <div className="absolute -bottom-4 -right-2 text-amber-100/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="90" height="90" viewBox="0 0 100 100" fill="currentColor"><rect x="25" y="25" width="50" height="50" rx="10" opacity="0.4" /></svg>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-teal-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-teal-50 p-3 rounded-lg text-teal-600 border border-teal-100 z-10 relative">
            <DollarSign size={24} />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Laba Operasional Bersih</p>
            <h2 className={`text-xl lg:text-2xl font-extrabold ${lingkarTambangYTD.total_laba_bersih >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              Rp {formatRupiah(lingkarTambangYTD.total_laba_bersih)}
            </h2>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Biaya Ops: <span className="font-bold text-slate-700">Rp {formatRupiah(lingkarTambangYTD.total_operasional)}</span></p>
          </div>
          <div className="absolute -bottom-4 -right-2 text-teal-100/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="90" height="90" viewBox="0 0 100 100" fill="currentColor"><polygon points="50,15 90,85 10,85" opacity="0.4" /></svg>
          </div>
        </div>
      </div>

      {/* ── ROW 2 & 3: DUAL CHARTS LANDSCAPE (PRODUKSI VS PENJUALAN & FINANSIAL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Tren Produksi Panen vs Volume Penjualan"
          icon={Activity}
          iconColor="text-emerald-600"
          filterRange={filter1}
          setFilterRange={setFilter1}
        >
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Produksi Panen (Kg)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-600" /> Volume Terjual (Kg)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-amber-500 rounded-full" /> Serapan Pasar (%)</div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={filteredData1} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" domain={[0, 'auto']} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#f59e0b' }} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
                formatter={(val, name) => [name === 'Serapan Pasar' ? `${val}%` : `${formatNumber(val)} Kg`, name]}
              />
              <Bar yAxisId="left" dataKey="panen_kg" name="Produksi Panen" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32}>
                <LabelList dataKey="panen_kg" position="top" style={{ fontSize: '10px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
              </Bar>
              <Bar yAxisId="left" dataKey="penjualan_kg" name="Volume Terjual" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32}>
                <LabelList dataKey="penjualan_kg" position="top" style={{ fontSize: '10px', fill: '#1d4ed8', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="absorption_rate" name="Serapan Pasar" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Analisis Finansial: Omzet vs Biaya Operasional"
          icon={BarChart2}
          iconColor="text-blue-600"
          filterRange={filter2}
          setFilterRange={setFilter2}
        >
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-600" /> Omzet Penjualan</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-400" /> Biaya Operasional</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-emerald-500 rounded-full" /> Laba Bersih</div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={filteredData2} margin={{ top: 10, right: 20, left: 15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatJuta} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
                formatter={(val, name) => [`Rp ${formatRupiah(val)}`, name]}
              />
              <Bar dataKey="omzet" name="Omzet Penjualan" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32}>
                <LabelList dataKey="omzet" position="top" style={{ fontSize: '10px', fill: '#1d4ed8', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
              </Bar>
              <Bar dataKey="biaya_operasional" name="Biaya Operasional" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={32}>
                <LabelList dataKey="biaya_operasional" position="top" style={{ fontSize: '10px', fill: '#e11d48', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
              </Bar>
              <Line type="monotone" dataKey="laba_bersih" name="Laba Bersih" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── ROW 4: DUAL PIE CHARTS (VARIETAS) + GAUGE + GEMINI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* Pie — Komposisi Varietas (Omzet & Volume) */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[350px] lg:col-span-12 xl:col-span-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-[12px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon size={16} className="text-emerald-600" />
              Komposisi Varietas
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Omzet & Volume
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 min-h-0 pt-1">
            {/* Donut 1: Omzet */}
            <div className="flex flex-col items-center h-full min-h-0">
              <span className="text-[11px] font-bold text-[#1e3a8a] bg-blue-50/70 border border-blue-100 px-2.5 py-0.5 rounded-full mb-1">
                Omzet (Rp)
              </span>
              <div className="w-full flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={omzetPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="75%"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {omzetPieData.map((entry, idx) => (
                        <Cell key={`omzet-cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`Rp ${formatRupiah(v)}`, 'Omzet']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut 2: Volume */}
            <div className="flex flex-col items-center h-full min-h-0">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50/70 border border-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
                Volume (Kg)
              </span>
              <div className="w-full flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={volumePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="75%"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {volumePieData.map((entry, idx) => (
                        <Cell key={`vol-cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${formatNumber(v)} Kg`, 'Volume']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Shared Legend at bottom */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-50 mt-1">
            {legendItems.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.fill }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gauge — Serapan Pasar */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[350px] lg:col-span-6 xl:col-span-3">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-[12px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={16} className="text-blue-600" />
              Efektivitas Serapan Pasar
            </h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie data={gaugeData} cx="50%" cy="90%" startAngle={180} endAngle={0}
                  innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                  {gaugeData.map((entry, idx) => <Cell key={`gauge-${idx}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-10 flex flex-col items-center">
              <span className={`text-3xl font-extrabold ${clampedRate >= 80 ? 'text-emerald-600' : clampedRate >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                {lingkarTambangYTD.sell_through_rate}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absorption Rate</span>
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-500 font-medium mt-1">
            Rasio penjualan terhadap total hasil panen kebun.
          </p>
        </div>

        {/* Gemini Insight */}
        <div className="h-[350px] flex flex-col lg:col-span-6 xl:col-span-4">
          <GeminiInsight
            programName="Suscomdev Lingkar Tambang (Smart Green House Melon)"
            period={`Tahun ${currentYear}`}
            quantitativeData={{
              total_panen_kg: lingkarTambangYTD.total_panen_kg,
              total_panen_buah: lingkarTambangYTD.total_panen_buah,
              total_penjualan_kg: lingkarTambangYTD.total_penjualan_kg,
              total_omzet: lingkarTambangYTD.total_omzet,
              total_operasional: lingkarTambangYTD.total_operasional,
              laba_bersih: lingkarTambangYTD.total_laba_bersih,
              rata_rata_bobot_buah_kg: lingkarTambangYTD.avg_bobot_buah,
              rasio_serapan_pasar_persen: lingkarTambangYTD.sell_through_rate,
              varietas_melon: lingkarTambangYTD.product_mix
            }}
            qualitativeData={{
              fokus: "Budidaya melon premium sistem smart green house di Desa Lingga (Lawang Kidul)",
              kpi: "Produktivitas panen, stabilitas mutu buah (grade A), serta daya serap pasar regional"
            }}
          />
        </div>
      </div>

      {/* ── ROW 5 & 6 (LANDSCAPE DUAL PANELS): YTD TABLE & DATA ANGGOTA BINAAN ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Layers size={18} className="text-emerald-600" />
              Evaluasi Kinerja Kumulatif (YTD Perbandingan {prevYear} vs {currentYear})
            </h3>
            <div className="overflow-x-auto minimal-scrollbar">
              <table className="w-full text-[12px] text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="px-3.5 py-2.5 border-b border-slate-200">Indikator Kinerja</th>
                    <th className="px-3.5 py-2.5 border-b border-slate-200 text-right">YTD {prevYear}</th>
                    <th className="px-3.5 py-2.5 border-b border-slate-200 text-right">YTD {currentYear}</th>
                    <th className="px-3.5 py-2.5 border-b border-slate-200 text-center">Pertumbuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {YTD_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800">{row.label} {row.unit && <span className="text-slate-400 font-normal">({row.unit})</span>}</td>
                      <td className="px-3.5 py-2.5 text-right font-medium text-slate-500">
                        {row.isCurrency ? `Rp ${formatRupiah(row.prev)}` : `${formatNumber(row.prev)} ${row.unit}`}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-[#1e3a8a]">
                        {row.isCurrency ? `Rp ${formatRupiah(row.curr)}` : `${formatNumber(row.curr)} ${row.unit}`}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <GrowthBadge curr={Number(row.curr)} prev={Number(row.prev)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="flex flex-col">
          <BeneficiaryPanel />
        </div>
      </div>

    </div>
  );
});

export default LingkarTambangAnalytics;
