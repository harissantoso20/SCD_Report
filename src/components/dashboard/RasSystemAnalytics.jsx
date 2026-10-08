import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import { useRasSystemData } from '../../hooks/programs/useRasSystemData';
import GeminiInsight from './GeminiInsight';
import BeneficiaryPanel from './BeneficiaryPanel';
import {
  Fish, Leaf, DollarSign, TrendingUp, Layers, Activity, BarChart2,
  PieChart as PieIcon
} from 'lucide-react';

/* ─── Formatters ─── */
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
const formatShort = (val) => {
  if (!val || val === 0) return '0';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} Jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} Rb`;
  return String(val);
};

/* ─── Filter Dropdown ─── */
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

/* ─── Reusable Chart Section ─── */
const ChartCard = ({ title, icon: Icon, iconColor, legend, filterRange, setFilterRange, height = 300, children }) => (
  <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
      <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
        <Icon size={18} className={iconColor} />
        {title}
      </h3>
      {setFilterRange && <FilterButtons currentRange={filterRange} setRange={setFilterRange} />}
    </div>
    {legend && (
      <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 mb-3 flex-wrap">
        {legend}
      </div>
    )}
    <div style={{ height }}>
      {children}
    </div>
  </section>
);

/* ─── Pie label ─── */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '11px', fontWeight: 'bold' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ─── Growth badge ─── */
const GrowthBadge = ({ curr, prev }) => {
  if (!prev || prev === 0) return curr > 0
    ? <span className="text-emerald-600 font-semibold">Baru</span>
    : <span className="text-slate-400">—</span>;
  const pct = ((curr - prev) / prev) * 100;
  return (
    <span className={pct > 0 ? 'text-emerald-600 font-semibold' : pct < 0 ? 'text-rose-600 font-semibold' : 'text-slate-500 font-semibold'}>
      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
};

/* ════════════════════════════════════════════════════════════ */
const RasSystemAnalytics = React.memo(function RasSystemAnalytics() {
  const { rasMonthlyData, rasSpeciesData, rasYTD, currentYear } = useRasSystemData();

  const [filter1, setFilter1] = useState(12); // Grafik 1: Omzet Ikan vs Sayur
  const [filter2, setFilter2] = useState(12); // Grafik 2: Volume
  const [filter3, setFilter3] = useState(12); // Grafik 3: Finansial
  const [pieTarget, setPieTarget] = useState('ikan');

  const filteredData1 = useMemo(() => rasMonthlyData.slice(-filter1), [rasMonthlyData, filter1]);
  const filteredData2 = useMemo(() => rasMonthlyData.slice(-filter2), [rasMonthlyData, filter2]);
  const filteredData3 = useMemo(() => rasMonthlyData.slice(-filter3), [rasMonthlyData, filter3]);

  const prevYear = Number(currentYear) - 1;

  /* ── Pie data ── */
  const pieData = useMemo(() => {
    const src = pieTarget === 'ikan' ? rasSpeciesData.ikan : rasSpeciesData.sayur;
    if (!src || src.length === 0) {
      const fill = pieTarget === 'ikan' ? '#93c5fd' : '#86efac';
      return [{ name: 'Belum Ada Data', omzet: 1, qty: 0, fill }];
    }
    return src;
  }, [pieTarget, rasSpeciesData]);

  /* ── YTD rows ── */
  const YTD_ROWS = [
    { label: 'Total Pembesaran Ikan', unit: 'Ekor', curr: rasYTD.total_pembesaran_ekor, prev: rasYTD.prev_total_pembesaran_ekor, isCurrency: false },
    { label: 'Volume Ikan Terjual', unit: 'Kg', curr: rasYTD.total_ikan_kg, prev: rasYTD.prev_total_ikan_kg, isCurrency: false },
    { label: 'Volume Sayur Terjual', unit: 'Kg', curr: rasYTD.total_sayur_kg, prev: rasYTD.prev_total_sayur_kg, isCurrency: false },
    { label: 'Omzet Ikan Konsumsi', unit: '', curr: rasYTD.total_ikan_omzet, prev: rasYTD.prev_total_ikan_omzet, isCurrency: true },
    { label: 'Omzet Sayur Hidroponik', unit: '', curr: rasYTD.total_sayur_omzet, prev: rasYTD.prev_total_sayur_omzet, isCurrency: true },
    { label: 'Total Omzet Gabungan', unit: '', curr: rasYTD.total_omzet, prev: rasYTD.prev_total_omzet, isCurrency: true },
    { label: 'Total Biaya Operasional', unit: '', curr: rasYTD.total_biaya, prev: rasYTD.prev_total_biaya, isCurrency: true },
    { label: 'Laba Bersih Operasional', unit: '', curr: rasYTD.laba_bersih, prev: rasYTD.prev_laba_bersih, isCurrency: true },
  ];

  return (
    <div className="w-full flex flex-col gap-5 font-sans text-slate-800">

      {/* ── ROW 1: KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1 — Pembesaran */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-900 border border-blue-100 z-10 relative">
            <Fish size={24} className="animate-[pulse_3s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Pembesaran Ikan</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {formatNumber(rasYTD.total_pembesaran_ekor)} <span className="text-sm font-semibold text-slate-400">Ekor</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Stok siklus budidaya aktif (YTD)</p>
          </div>
          <div className="absolute -bottom-3 -right-3 text-blue-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="88" height="88" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="45" opacity="0.5" /></svg>
          </div>
        </div>

        {/* Card 2 — Omzet Ikan */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600 border border-blue-100 z-10 relative">
            <Fish size={24} className="animate-[bounce_3s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Omzet Ikan Konsumsi</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              Rp {formatRupiah(rasYTD.total_ikan_omzet)}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {formatNumber(rasYTD.total_ikan_kg)} Kg · Rp {formatRupiah(rasYTD.avg_harga_ikan)}/Kg
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 text-blue-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="88" height="88" viewBox="0 0 100 100" fill="currentColor"><path d="M10 50 Q50 10, 90 50 Q50 90, 10 50Z" opacity="0.5" /></svg>
          </div>
        </div>

        {/* Card 3 — Omzet Sayur */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-green-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-green-50 p-3 rounded-lg text-green-600 border border-green-100 z-10 relative">
            <Leaf size={24} className="animate-[pulse_3s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Omzet Sayur Hidroponik</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              Rp {formatRupiah(rasYTD.total_sayur_omzet)}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {formatNumber(rasYTD.total_sayur_kg)} Kg · Rp {formatRupiah(rasYTD.avg_harga_sayur)}/Kg
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 text-green-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="88" height="88" viewBox="0 0 100 100" fill="currentColor"><polygon points="50,10 90,85 10,85" opacity="0.5" /></svg>
          </div>
        </div>

        {/* Card 4 — Laba Bersih */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-teal-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-teal-50 p-3 rounded-lg text-teal-600 border border-teal-100 z-10 relative">
            <DollarSign size={24} />
          </div>
          <div className="flex-1 z-10 relative">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Laba Operasional Bersih</p>
            <h2 className={`text-xl lg:text-2xl font-extrabold ${rasYTD.laba_bersih >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
              Rp {formatRupiah(rasYTD.laba_bersih)}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total Omzet: Rp {formatRupiah(rasYTD.total_omzet)}
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 text-teal-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="88" height="88" viewBox="0 0 100 100" fill="currentColor"><rect x="15" y="15" width="70" height="70" rx="12" opacity="0.5" /></svg>
          </div>
        </div>
      </div>

      {/* ── ROW 2: GRAFIK 1 — OMZET IKAN VS SAYUR ── */}
      <ChartCard
        title="Tren Omzet: Ikan Konsumsi vs Sayur Hidroponik"
        icon={Activity}
        iconColor="text-blue-600"
        filterRange={filter1}
        setFilterRange={setFilter1}
        height={300}
        legend={
          <>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-700" /> Ikan Konsumsi</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Sayur Hidroponik</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-amber-500 rounded-full" /> Total Omzet</div>
          </>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData1} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatShort} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
              formatter={(val, name) => [`Rp ${formatRupiah(val)}`, name]}
            />
            <Bar dataKey="ikan_omzet" name="Ikan Konsumsi" stackId="a" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={48}>
              <LabelList dataKey="ikan_omzet" position="top" style={{ fontSize: '10px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatShort(v) : ''} />
            </Bar>
            <Bar dataKey="sayur_omzet" name="Sayur Hidroponik" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={48} />
            <Line type="monotone" dataKey="total_omzet" name="Total Omzet" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── ROW 3: GRAFIK 2 — VOLUME PRODUKSI ── */}
      <ChartCard
        title="Tren Volume: Ikan Terjual (Kg) & Pembesaran (Ekor)"
        icon={BarChart2}
        iconColor="text-violet-600"
        filterRange={filter2}
        setFilterRange={setFilter2}
        height={300}
        legend={
          <>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-700" /> Ikan Terjual (Kg)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Sayur Terjual (Kg)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-violet-500 rounded-full" /> Pembesaran (Ekor)</div>
          </>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData2} margin={{ top: 10, right: 50, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
            <YAxis yAxisId="kg" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" />
            <YAxis yAxisId="ekor" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8b5cf6' }} unit=" ekor" />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
              formatter={(val, name) => [name === 'Pembesaran Ikan' ? `${formatNumber(val)} Ekor` : `${formatNumber(val)} Kg`, name]}
            />
            <Bar yAxisId="kg" dataKey="ikan_kg" name="Ikan Terjual" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={38}>
              <LabelList dataKey="ikan_kg" position="top" style={{ fontSize: '10px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
            </Bar>
            <Bar yAxisId="kg" dataKey="sayur_kg" name="Sayur Terjual" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={38}>
              <LabelList dataKey="sayur_kg" position="top" style={{ fontSize: '10px', fill: '#15803d', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
            </Bar>
            <Line yAxisId="ekor" type="monotone" dataKey="pembesaran_ekor" name="Pembesaran Ikan" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── ROW 4: GRAFIK 3 — FINANSIAL ── */}
      <ChartCard
        title="Analisis Finansial: Omzet vs Biaya Operasional vs Laba"
        icon={TrendingUp}
        iconColor="text-teal-600"
        filterRange={filter3}
        setFilterRange={setFilter3}
        height={300}
        legend={
          <>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-700" /> Total Omzet</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-rose-400" /> Biaya Operasional</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-teal-500 rounded-full" /> Laba Bersih</div>
          </>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData3} margin={{ top: 10, right: 20, left: 15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatShort} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
              formatter={(val, name) => [`Rp ${formatRupiah(val)}`, name]}
            />
            <Bar dataKey="total_omzet" name="Total Omzet" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={38}>
              <LabelList dataKey="total_omzet" position="top" style={{ fontSize: '10px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatShort(v) : ''} />
            </Bar>
            <Bar dataKey="biaya_operasional" name="Biaya Operasional" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={38}>
              <LabelList dataKey="biaya_operasional" position="top" style={{ fontSize: '10px', fill: '#e11d48', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatShort(v) : ''} />
            </Bar>
            <Line type="monotone" dataKey="laba_bersih" name="Laba Bersih" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── ROW 5: PIE CHART + GEMINI INSIGHT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pie — Kontribusi Spesies/Varietas */}
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[340px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-[12px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon size={16} className="text-blue-600" />
              Kontribusi Omzet per Spesies
            </h3>
            <div className="flex bg-slate-100 p-0.5 rounded text-[10px] font-bold">
              <button type="button" onClick={() => setPieTarget('ikan')}
                className={`px-2 py-0.5 rounded ${pieTarget === 'ikan' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>
                🐟 Ikan
              </button>
              <button type="button" onClick={() => setPieTarget('sayur')}
                className={`px-2 py-0.5 rounded ${pieTarget === 'sayur' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>
                🌿 Sayur
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius="38%" outerRadius="76%"
                  dataKey="omzet" labelLine={false} label={renderPieLabel} stroke="#fff" strokeWidth={2}>
                  {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(val) => `Rp ${formatRupiah(val)}`} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gemini AI Insight */}
        <div className="lg:col-span-2 h-[340px] flex flex-col">
          <GeminiInsight
            programName="Budidaya Ikan RAS System & Hidroponik Sayur"
            period={`Tahun ${currentYear}`}
            quantitativeData={{
              total_pembesaran_ikan_ekor: rasYTD.total_pembesaran_ekor,
              volume_ikan_terjual_kg: rasYTD.total_ikan_kg,
              omzet_ikan_konsumsi_rp: rasYTD.total_ikan_omzet,
              rata_rata_harga_ikan_per_kg: rasYTD.avg_harga_ikan,
              volume_sayur_terjual_kg: rasYTD.total_sayur_kg,
              omzet_sayur_hidroponik_rp: rasYTD.total_sayur_omzet,
              rata_rata_harga_sayur_per_kg: rasYTD.avg_harga_sayur,
              total_omzet_gabungan_rp: rasYTD.total_omzet,
              total_biaya_operasional_rp: rasYTD.total_biaya,
              laba_bersih_rp: rasYTD.laba_bersih,
              spesies_ikan: rasSpeciesData.ikan.map(d => ({ nama: d.name, omzet: d.omzet, qty_kg: d.qty })),
              varietas_sayur: rasSpeciesData.sayur.map(d => ({ nama: d.name, omzet: d.omzet, qty_kg: d.qty })),
            }}
            qualitativeData={{
              fokus: 'Kolam Pangan Terpadu RAS (Recirculating Aquaculture System) + Hidroponik sayur, Desa Keban Agung (Lawang Kidul)',
              kpi: 'Pertumbuhan stok budidaya ikan, volume penjualan ikan konsumsi & sayur hidroponik, efisiensi biaya operasional sistem sirkulasi tertutup',
            }}
          />
        </div>
      </div>

      {/* ── ROW 6: YTD TABLE ── */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5">
        <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-600" />
          Evaluasi Kinerja Kumulatif YTD — {prevYear} vs {currentYear}
        </h3>
        <div className="overflow-x-auto minimal-scrollbar">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200">Indikator Kinerja</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">YTD {prevYear}</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">YTD {currentYear}</th>
                <th className="px-4 py-3 border-b border-slate-200 text-center">Pertumbuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {YTD_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {row.label} {row.unit && <span className="text-slate-400 font-normal">({row.unit})</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-500">
                    {row.isCurrency ? `Rp ${formatRupiah(row.prev)}` : `${formatNumber(row.prev)} ${row.unit}`}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#1e3a8a]">
                    {row.isCurrency ? `Rp ${formatRupiah(row.curr)}` : `${formatNumber(row.curr)} ${row.unit}`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <GrowthBadge curr={Number(row.curr)} prev={Number(row.prev)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* DATA ANGGOTA BINAAN */}
      <BeneficiaryPanel />

    </div>
  );
});

export default RasSystemAnalytics;
