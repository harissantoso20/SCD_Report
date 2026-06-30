import React, { useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { useEcogrowData } from '../../hooks/programs/useEcogrowData';
import GeminiInsight from './GeminiInsight';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, Sparkles } from 'lucide-react';

// Helpers
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val);
const formatJuta = (val) => {
  if (val >= 1000000) return new Intl.NumberFormat('id-ID').format(val);
  return `${(val / 1000).toFixed(0)} Rb`;
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
  const { 
    ecogrowOverviewData, 
    ecogrowYTD,
    currentYear
  } = useEcogrowData();
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

  // generateCrossRevenueAI removed - using Gemini AI instead

  // LAYER 2: Product Mix (Donut Chart)
  const getPercentageJSX = (curr, prev) => {
    if (prev === 0) return '-';
    const pct = ((curr - prev) / prev) * 100;
    return (
      <span className={pct > 0 ? 'text-blue-600' : pct < 0 ? 'text-rose-600' : 'text-slate-500'}>
        {pct > 0 ? '+' : ''}{pct.toFixed(0)}%
      </span>
    );
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Total Omzet Keseluruhan', prevYearData: ecogrowYTD.prev_total_omzet || 0, currYearData: ecogrowYTD.total_omzet || 0, percent: getPercentageJSX(ecogrowYTD.total_omzet || 0, ecogrowYTD.prev_total_omzet || 0), isCurrency: true }
  ];

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
      
      {/* MAIN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* ROW 1: Volume Penjualan (Span 2) */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-4">Volume Penjualan Bulanan</h3>
          <div className="flex-1 w-full relative">
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={volumeData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} dy={10} />
                  
                  {ikatProducts.length > 0 && (
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#3b82f6' }} />
                  )}
                  {kgProducts.length > 0 && (
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#d97706' }} />
                  )}
                  
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomVolumeTrendTooltip ecogrowYTD={ecogrowYTD} />} />
                  <Legend verticalAlign="top" height={70} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }} />
                  
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

        {/* ROW 1: Distribusi Omzet (Span 1) */}
        <div className="xl:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
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

        {/* ROW 1: Total Omzet Card (Span 1) */}
        <div className="xl:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-green-600 relative overflow-hidden group flex flex-col justify-center min-h-[300px]">
          <div className="absolute -right-4 -bottom-4 text-green-50/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <span style={{ fontSize: 100 }} className="font-bold">Rp</span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet Keseluruhan (YTD)</p>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-xl tracking-tight font-extrabold text-slate-800">{formatRupiah(ecogrowYTD.total_omzet)}</h2>
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

        {/* ROW 2: Tren Omzet Agregat (Span 2) */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[300px]">
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

        {/* ROW 2: INSIGHT ANALITIK (Span 2) */}
        <div className="xl:col-span-2 flex flex-col h-[300px]">
          <GeminiInsight 
            programName="Ecogrow"
            period={`${timeFilter} Bulan Terakhir (${currentYear})`}
            quantitativeData={{
              sales: filteredData,
              ytdSummary: ecogrowYTD,
              stats: filteredStats
            }}
            headerAction={<FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />}
          />
        </div>

      </div>

      {/* Row: Rekapitulasi YTD Table */}
      <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 mt-4">
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
};

export default EcogrowAnalytics;
