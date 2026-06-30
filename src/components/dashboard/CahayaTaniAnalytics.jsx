import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import { useCahayaTaniData } from '../../hooks/programs/useCahayaTaniData';
import GeminiInsight from './GeminiInsight';
import { Sparkles, ShoppingBag, Sprout, TrendingUp, Info } from 'lucide-react';

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const formatJuta = (val) => new Intl.NumberFormat('id-ID').format(val);
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

const CahayaTaniAnalytics = React.memo(function CahayaTaniAnalytics() {
  const { 
    cahayaTaniOverviewData, 
    cahayaTaniYTD,
    currentYear
  } = useCahayaTaniData();
  const [timeFilter, setTimeFilter] = useState(12);

  const filteredOverviewData = useMemo(() => {
    return cahayaTaniOverviewData.slice(-timeFilter);
  }, [cahayaTaniOverviewData, timeFilter]);

  const prevYear = Number(currentYear) - 1;

  const getPercentage = (curr, prev) => {
    if (prev === 0) return '-';
    const pct = ((curr - prev) / prev) * 100;
    return (
      <span className={pct > 0 ? 'text-blue-600' : pct < 0 ? 'text-rose-600' : 'text-slate-500'}>
        {pct > 0 ? '+' : ''}{pct.toFixed(0)}%
      </span>
    );
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Pembesaran Bibit (Batang)', prevYearData: cahayaTaniYTD.prev_total_pembesaran || 0, currYearData: cahayaTaniYTD.total_pembesaran || 0, percent: getPercentage(cahayaTaniYTD.total_pembesaran || 0, cahayaTaniYTD.prev_total_pembesaran || 0), isCurrency: false },
    { variabel: 'Penjualan Bibit (Batang)', prevYearData: cahayaTaniYTD.prev_total_vol || 0, currYearData: cahayaTaniYTD.total_vol || 0, percent: getPercentage(cahayaTaniYTD.total_vol || 0, cahayaTaniYTD.prev_total_vol || 0), isCurrency: false },
    { variabel: 'Total Omzet Keseluruhan', prevYearData: cahayaTaniYTD.prev_total_omzet || 0, currYearData: cahayaTaniYTD.total_omzet || 0, percent: getPercentage(cahayaTaniYTD.total_omzet || 0, cahayaTaniYTD.prev_total_omzet || 0), isCurrency: true },
  ];

  const stockToSalesRatio = (cahayaTaniYTD?.total_pembesaran || 0) > 0
    ? (((cahayaTaniYTD?.total_vol || 0) / (cahayaTaniYTD?.total_pembesaran || 0)) * 100).toFixed(1)
    : 0;

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

  const renderGaugeChart = () => {
    const ratioVal = Number(stockToSalesRatio);
    const data = [
      { name: 'Terjual', value: ratioVal > 100 ? 100 : ratioVal, fill: '#3b82f6' },
      { name: 'Menumpuk', value: ratioVal > 100 ? 0 : 100 - ratioVal, fill: '#e5e7eb' }
    ];
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className={`text-2xl font-extrabold ${Number(stockToSalesRatio) < 20 ? 'text-rose-500' : 'text-[#1e3a8a]'}`}>{stockToSalesRatio}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rasio Terjual</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">

      {/* ROW 1: TOP 3 KPIs (Siba Pembibitan Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-blue-50/50 p-3 rounded-lg text-blue-600 border border-blue-100 relative z-10"><span className="text-xl font-bold animate-[pulse_2s_ease-in-out_infinite]">Rp</span></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue YTD</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {formatRupiah(cahayaTaniYTD?.total_omzet || 0)}
            </h2>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-4 -right-2 text-blue-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 20 C 70 20, 80 40, 80 50 C 80 70, 60 80, 50 80 C 30 80, 20 60, 20 50 C 20 30, 40 20, 50 20 Z" opacity="0.6" />
            </svg>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-sky-50/50 p-3 rounded-lg text-sky-600 border border-sky-100 relative z-10"><ShoppingBag size={24} className="animate-[bounce_3s_ease-in-out_infinite]" /></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Penjualan Bibit YTD</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {formatNumber(cahayaTaniYTD?.total_vol || 0)} <span className="text-lg text-slate-400 font-semibold">Batang</span>
            </h2>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-6 -right-6 text-sky-100/40 group-hover:-translate-y-2 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 80 Q 50 20, 80 80" />
              <path d="M40 50 Q 60 20, 80 50" opacity="0.6" />
            </svg>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-indigo-50/50 p-3 rounded-lg text-indigo-600 border border-indigo-100 relative z-10"><Sprout size={24} className="animate-[pulse_3s_ease-in-out_infinite]" /></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stok Pembesaran Aktif</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {formatNumber(cahayaTaniYTD?.total_pembesaran || 0)} <span className="text-lg text-slate-400 font-semibold">Batang</span>
            </h2>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-2 -right-4 text-indigo-100/40 group-hover:translate-x-2 transition-transform duration-500 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 90 Q 50 90, 90 10 M 90 10 Q 70 30, 60 20 M 90 10 Q 70 50, 80 60" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Layout Adjustment */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch">
        
        {/* Left Column */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[380px]">
            <div className="flex justify-between items-start md:items-center mb-4 flex-col md:flex-row gap-2">
              <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-widest">Penjualan Bibit vs Omzet</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#1e3a8a]"></div> Pembesaran</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#3b82f6]"></div> Penjualan</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#10b981] rounded-full"></div> Omzet</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-0 flex flex-col gap-1">
              <div className="h-[45%] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredOverviewData} syncId="cahayaTani" margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" hide padding={{ left: 30, right: 30 }} />
                    <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val) => formatRupiah(val)} />
                    <Line type="monotone" dataKey="total_omzet" name="Omzet" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}>
                      <LabelList dataKey="total_omzet" position="top" style={{ fontSize: '10px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[55%] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredOverviewData} syncId="cahayaTani" margin={{ top: 0, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} padding={{ left: 30, right: 30 }} />
                    <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="pembesaran_vol" name="Pembesaran" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      <LabelList dataKey="pembesaran_vol" position="top" style={{ fontSize: '10px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                    </Bar>
                    <Bar dataKey="total_vol" name="Penjualan" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      <LabelList dataKey="total_vol" position="top" style={{ fontSize: '10px', fill: '#3b82f6', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Bottom section: PieChart & GaugeChart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Komposisi Omzet Pie Chart */}
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[220px] relative overflow-hidden">
              <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Komposisi Omzet (YTD)</h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sawit', value: cahayaTaniYTD.sawit_omzet, fill: '#f59e0b' },
                        { name: 'Kayu Putih', value: cahayaTaniYTD.kayu_putih_omzet, fill: '#10b981' },
                        { name: 'Lainnya', value: cahayaTaniYTD.lainnya_omzet, fill: '#8b5cf6' }
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" dataKey="value" stroke="#fff" strokeWidth={2}
                      labelLine={false} label={renderPieLabel}
                    >
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ratio Stock to Sale Gauge Chart */}
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[220px]">
              <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Ratio Stock to Sale</h3>
              <div className="flex-1 w-full relative">
                {renderGaugeChart()}
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Column: Insight Analitik */}
        <div className="xl:col-span-1 flex flex-col relative min-h-[300px] xl:min-h-0">
          <div className="xl:absolute xl:inset-0 flex flex-col h-full">
            <GeminiInsight 
              programName="Cahaya Tani"
              period={`${timeFilter} Bulan Terakhir (${currentYear})`}
              quantitativeData={{
                overview: filteredOverviewData,
                ytd: cahayaTaniYTD,
                ratio: stockToSalesRatio
              }}
              headerAction={<FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />}
            />
          </div>
        </div>

      </div>

      {/* Row: Rekapitulasi YTD Table */}
      <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-4 mb-4">
          Rekapitulasi Year to Date (YTD)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-[#1e3a8a] font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Variabel</th>
                <th className="px-6 py-4 text-right">{prevYear}</th>
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

export default CahayaTaniAnalytics;