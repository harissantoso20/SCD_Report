import React, { useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, Sparkles } from 'lucide-react';

// Helpers
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatJuta = (val) => {
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
  return `Rp ${(val / 1000).toFixed(0)} Rb`;
};
const getPercentage = (curr, prev) => {
  if (prev === 0) return '-';
  const pct = ((curr - prev) / prev) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
};

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#0ea5e9'];

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
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

const CustomVolumeTrendTooltip = ({ active, payload, label, ecogrowYTD }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-md border border-slate-200 text-xs z-50 relative">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            if (entry.value === 0) return null;
            const unit = ecogrowYTD?.items?.[entry.name]?.unit || '';
            return (
              <p key={`item-${index}`} style={{ color: entry.color }} className="font-semibold flex justify-between gap-4">
                <span>{entry.name}</span>
                <span>{new Intl.NumberFormat('id-ID').format(entry.value)} <span className="text-slate-500 font-medium">({unit})</span></span>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const EcogrowAnalytics = () => {
  const { currentYear, ecogrowOverviewData, ecogrowYTD } = useDashboardData();
  const [timeFilter, setTimeFilter] = useState(3);
  const filteredData = ecogrowOverviewData.slice(-timeFilter);

  // LAYER 1: Financial Performance
  const isPositive = ecogrowYTD.total_omzet >= ecogrowYTD.prev_total_omzet;
  const isZero = ecogrowYTD.prev_total_omzet === 0;
  const yoyPercent = getPercentage(ecogrowYTD.total_omzet, ecogrowYTD.prev_total_omzet);

  const topCrop = useMemo(() => {
    let top = { name: '-', omzet: 0, percent: 0 };
    const total = ecogrowYTD.total_omzet;
    if (total === 0) return top;

    Object.entries(ecogrowYTD.items).forEach(([name, data]) => {
      if (data.omzet > top.omzet) {
        top = { name, omzet: data.omzet, percent: ((data.omzet / total) * 100).toFixed(0) };
      }
    });
    return top;
  }, [ecogrowYTD]);

  const filteredStats = useMemo(() => {
    let total = 0;
    const itemMap = {};
    filteredData.forEach(d => {
      total += d.total_omzet;
      Object.entries(d.items || {}).forEach(([name, data]) => {
        if (!itemMap[name]) itemMap[name] = 0;
        itemMap[name] += data.omzet;
      });
    });

    let topName = '-';
    let topOmzet = 0;
    Object.entries(itemMap).forEach(([name, omzet]) => {
      if (omzet > topOmzet) {
        topOmzet = omzet;
        topName = name;
      }
    });

    return {
      total,
      topName,
      topPercent: total > 0 ? ((topOmzet / total) * 100).toFixed(0) : 0
    };
  }, [filteredData]);

  // AI Logic for Insight Analitik
  const generateCrossRevenueAI = () => {
    if (!filteredData || filteredData.length === 0) return "Belum ada data penjualan pada periode ini.";
    
    if (filteredStats.total === 0) return "Tidak ada transaksi tercatat di periode yang dipilih. Fokus pada strategi pemasaran dan pengelolaan panen.";
    
    const topVeg = filteredStats.topName;
    const perc = filteredStats.topPercent;

    let maxBulan = filteredData[0].month;
    let maxOmzet = 0;
    filteredData.forEach(d => {
      if (d.total_omzet > maxOmzet) {
        maxOmzet = d.total_omzet;
        maxBulan = d.month;
      }
    });

    const startMonth = filteredData[0].month;
    const endMonth = filteredData[filteredData.length - 1].month;
    
    return (
      <div className="text-slate-600 font-medium leading-relaxed text-[13px] space-y-3">
        <p>
          Secara bulanan, puncak gairah pasar terjadi pada bulan <span className="font-bold text-[#1e3a8a]">{maxBulan}</span> dengan total omzet tertinggi menembus <span className="font-bold text-blue-600">{formatJuta(maxOmzet)}</span>.
        </p>
        <p>
          Secara keseluruhan dalam periode <span className="font-bold text-[#1e3a8a]">{startMonth} - {endMonth} {currentYear}</span>, total pendapatan mencapai <span className="font-bold text-blue-800">{formatRupiah(filteredStats.total)}</span>. Portofolio bisnis saat ini sangat condong pada penjualan <span className="font-bold text-blue-600">{topVeg}</span>, yang menguasai <span className="font-bold text-slate-800">{perc}%</span> dari kue pendapatan.
        </p>
        <p>
          Jika dikomparasikan secara *Year-on-Year* (YoY), omzet periode ini mencerminkan tren penjualan komoditas yang dinamis bila dibandingkan dengan performa di tahun sebelumnya.
        </p>
        <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start shadow-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xs italic text-blue-900">
            "Ibarat pondasi, lini penjualan {topVeg.toLowerCase()} saat ini bertindak sebagai lokomotif utama. Namun menjaga lini sayuran lainnya tetap tumbuh adalah strategi lindung nilai yang cerdas terhadap fluktuasi permintaan."
          </p>
        </div>
      </div>
    );
  };

  // LAYER 2: Product Mix (Donut Chart)
  const pieData = useMemo(() => {
    return Object.entries(ecogrowYTD.items)
      .filter(([_, data]) => data.omzet > 0)
      .map(([name, data]) => ({ name, value: data.omzet }))
      .sort((a, b) => b.value - a.value);
  }, [ecogrowYTD]);

  // LAYER 3: Volume Leaderboard (Monthly Sales Volume)
  const volumeData = useMemo(() => {
    return filteredData.map(d => {
      const monthData = { month: d.month };
      Object.entries(d.items || {}).forEach(([name, data]) => {
        monthData[name] = data.qty || 0;
      });
      return monthData;
    });
  }, [filteredData]);

  const productKeys = Object.keys(ecogrowYTD.items);
  const ikatProducts = productKeys.filter(k => ecogrowYTD.items[k]?.unit === 'Ikat');
  const kgProducts = productKeys.filter(k => ecogrowYTD.items[k]?.unit === 'Kg');

  // LAYER 4: Aggregate Revenue Trend
  const areaData = filteredData.map(d => ({ month: d.month, Total: d.total_omzet }));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* LAYER 1: Financial KPIs & Insight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Omzet Card (Span 1) */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-green-600 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-green-50/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <DollarSign size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet Keseluruhan (YTD)</p>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-3xl font-extrabold text-slate-800">{formatRupiah(ecogrowYTD.total_omzet)}</h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isPositive ? 'bg-green-100 text-green-700' : isZero ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'}`}>
                {isPositive && !isZero ? <TrendingUp size={14} /> : !isZero ? <TrendingDown size={14} /> : null}
                {yoyPercent} YoY
              </span>
              <span className="text-[10px] font-semibold text-slate-400">vs {Number(currentYear) - 1}</span>
            </div>
          </div>
        </div>

        {/* INSIGHT ANALITIK (Span 2) */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              Insight Analitik
            </h3>
            <FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />
          </div>
          <div className="flex-1 flex flex-col justify-center relative z-10">
            {generateCrossRevenueAI()}
          </div>
          <Sparkles size={140} className="absolute -bottom-10 -right-10 text-blue-50 opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* LAYER 2: Product Mix */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
            <PieChartIcon size={16} className="text-green-600" /> Distribusi Omzet (YTD)
          </h3>
          <div className="flex-1 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium italic">Belum ada data</div>
            )}
            {pieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-15px]">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Total</span>
                <span className="text-sm font-black text-slate-800">{formatJuta(ecogrowYTD.total_omzet)}</span>
              </div>
            )}
          </div>
        </div>

        {/* LAYER 3: Volume */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-4">Volume Penjualan Bulanan</h3>
          <div className="flex-1 w-full relative">
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} dy={10} />
                  
                  {ikatProducts.length > 0 && (
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#3b82f6' }} />
                  )}
                  {kgProducts.length > 0 && (
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#d97706' }} />
                  )}
                  
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomVolumeTrendTooltip ecogrowYTD={ecogrowYTD} />} />
                  <Legend verticalAlign="top" height={30} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }} />
                  
                  {ikatProducts.map((key, idx) => (
                    <Bar key={key} dataKey={key} yAxisId="left" name={`${key} (Ikat)`} stackId="ikat" fill={COLORS[idx % COLORS.length]} barSize={30} />
                  ))}
                  {kgProducts.map((key, idx) => (
                    <Bar key={key} dataKey={key} yAxisId="right" name={`${key} (Kg)`} stackId="kg" fill={COLORS[(idx + ikatProducts.length) % COLORS.length]} barSize={30} />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium italic">Belum ada data</div>
            )}
          </div>
        </div>
      </div>

      {/* LAYER 4: Time-Series Aggregate */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">Tren Omzet Agregat</h3>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 30, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={10} />
              <YAxis hide />
              <Tooltip 
                formatter={(value) => [formatRupiah(value), "Total Omzet"]}
                contentStyle={{ borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="Total" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)">
                <LabelList dataKey="Total" position="top" formatter={(val) => formatJuta(val)} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#16a34a' }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default EcogrowAnalytics;
