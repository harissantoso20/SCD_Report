import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import { usePembibitanData } from '../../hooks/programs/usePembibitanData';
import { TrendingUp, AlertTriangle } from '../Icons';
import { Sparkles, ShoppingBag, Sprout } from 'lucide-react';
import GeminiInsight from './GeminiInsight';

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

const AdvancedPembibitanAnalytics = React.memo(function AdvancedPembibitanAnalytics() {
  const { 
    pembibitanOverviewData, 
    pembibitanYTD,
    currentYear
  } = usePembibitanData();
  const [timeFilter, setTimeFilter] = useState(12);

  const filteredOverviewData = useMemo(() => {
    return pembibitanOverviewData.slice(-timeFilter);
  }, [pembibitanOverviewData, timeFilter]);

  const prevYear = Number(currentYear) - 1;

  const getPercentage = (curr, prev) => {
    if (prev === 0) return '-';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Pembesaran Bibit (Batang)', prevYearData: pembibitanYTD?.prevPembesaran || 0, currYearData: pembibitanYTD?.currPembesaran || 0, percent: getPercentage(pembibitanYTD?.currPembesaran || 0, pembibitanYTD?.prevPembesaran || 0), isCurrency: false },
    { variabel: 'Penjualan Bibit (Batang)', prevYearData: pembibitanYTD?.prevPenjualan || 0, currYearData: pembibitanYTD?.currPenjualan || 0, percent: getPercentage(pembibitanYTD?.currPenjualan || 0, pembibitanYTD?.prevPenjualan || 0), isCurrency: false },
    { variabel: 'Penjualan Polybag (Ea)', prevYearData: pembibitanYTD?.prevPolybag || 0, currYearData: pembibitanYTD?.currPolybag || 0, percent: getPercentage(pembibitanYTD?.currPolybag || 0, pembibitanYTD?.prevPolybag || 0), isCurrency: false },
    { variabel: 'Total Omzet Keseluruhan', prevYearData: pembibitanYTD?.prevRevenue || 0, currYearData: pembibitanYTD?.currRevenue || 0, percent: getPercentage(pembibitanYTD?.currRevenue || 0, pembibitanYTD?.prevRevenue || 0), isCurrency: true },
  ];

  const stockToSalesRatio = (pembibitanYTD?.currPembesaran || 0) > 0
    ? (((pembibitanYTD?.currPenjualan || 0) / (pembibitanYTD?.currPembesaran || 0)) * 100).toFixed(1)
    : 0;

  const deltaOmzet = (pembibitanYTD?.currRevenue || 0) - (pembibitanYTD?.prevRevenue || 0);

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

  const renderAIInsight = () => {
    if (filteredOverviewData.length === 0) return <p className="text-slate-500 italic text-sm">Data analitik belum tersedia untuk periode ini.</p>;
    
    const startMonth = filteredOverviewData[0]?.month || 'JAN';
    const endMonth = filteredOverviewData[filteredOverviewData.length - 1]?.month || '';

    let peakMonth = '';
    let peakOmzet = 0;
    filteredOverviewData.forEach(d => {
      if (d.total_rp > peakOmzet) {
        peakOmzet = d.total_rp;
        peakMonth = d.month;
      }
    });

    const formatPeak = (val) => {
      if (val >= 1000000) return new Intl.NumberFormat('id-ID').format(val);
      if (val >= 1000) return (val / 1000).toFixed(1) + ' Rb';
      return formatRupiah(val);
    };

    const totalRevenue = pembibitanYTD?.currRevenue || 0;
    const bibitOmzet = pembibitanYTD?.currBibitOmzet || 0;
    const polybagOmzet = pembibitanYTD?.currPolybagOmzet || 0;

    let dominantProduct = "Bibit Tanaman";
    let dominantPercentage = 0;
    if (totalRevenue > 0) {
      if (bibitOmzet >= polybagOmzet) {
        dominantPercentage = ((bibitOmzet / totalRevenue) * 100).toFixed(0);
      } else {
        dominantProduct = "Media Tanam (Polybag)";
        dominantPercentage = ((polybagOmzet / totalRevenue) * 100).toFixed(0);
      }
    }

    const yoyStatus = deltaOmzet >= 0 ? "tren pertumbuhan positif" : "tren penurunan";

    return (
      <div className="text-slate-600 font-medium leading-relaxed text-[13px] space-y-3">
        <p>
          Secara bulanan, puncak gairah pasar terjadi pada bulan <span className="font-bold text-[#1e3a8a]">{peakMonth || '-'}</span> dengan total omzet tertinggi menembus <span className="font-bold text-[#1e3a8a]">{peakOmzet > 0 ? formatPeak(peakOmzet) : '-'}</span>.
        </p>
        <p>
          Secara keseluruhan dalam periode <span className="font-bold text-[#1e3a8a]">{startMonth} - {endMonth} {currentYear}</span>, total pendapatan mencapai <span className="font-bold text-[#1e3a8a]">{formatRupiah(totalRevenue)}</span>. Portofolio bisnis saat ini sangat condong pada penjualan <span className="font-bold text-[#1e3a8a]">{dominantProduct}</span>, yang menguasai <span className="font-bold text-slate-800">{dominantPercentage}%</span> dari kue pendapatan.
        </p>
        <p>
          Jika dikomparasikan secara <span className="italic">*Year-on-Year*</span> (YoY), omzet YTD ini mencerminkan {yoyStatus} bila dibandingkan dengan perolehan di tahun sebelumnya.
        </p>
        <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start shadow-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xs italic text-blue-900">
            "Fokus pada pengelolaan siklus pembesaran yang lebih adaptif terhadap permintaan pasar akan meminimalisir penumpukan stok bibit (overstock) dan memaksimalkan perputaran modal."
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">

      {/* ROW 1: TOP 3 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-blue-50/50 p-3 rounded-lg text-blue-600 border border-blue-100 relative z-10"><span className="text-xl font-bold animate-[pulse_2s_ease-in-out_infinite]">Rp</span></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue YTD</p>
            <h2 className="text-lg xl:text-xl tracking-tight font-extrabold text-[#1e3a8a]">
              {formatRupiah(pembibitanYTD?.currRevenue || 0)}
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
            <h2 className="text-lg xl:text-xl tracking-tight font-extrabold text-[#1e3a8a]">
              {formatNumber(pembibitanYTD?.currPenjualan || 0)} <span className="text-lg text-slate-400 font-semibold">Batang</span>
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
            <h2 className="text-lg xl:text-xl tracking-tight font-extrabold text-[#1e3a8a]">
              {formatNumber(pembibitanYTD?.currPembesaran || 0)} <span className="text-lg text-slate-400 font-semibold">Batang</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-stretch">

        {/* LEFT COLUMN (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Row 1: Penjualan Bibit & Penjualan Media Tanam */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Penjualan Bibit (Formerly Overview Produksi) */}
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[340px]">
              <div className="flex justify-between items-start md:items-center mb-4 flex-col md:flex-row gap-2">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Penjualan Bibit</h3>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#1e3a8a]"></div> Pembesaran</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#3b82f6]"></div> Penjualan</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#f43f5e] rounded-full"></div> Omzet</div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 flex flex-col gap-1">
                <div className="h-[45%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredOverviewData} syncId="pembibitan1" margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" hide padding={{ left: 30, right: 30 }} />
                      <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="total_rp" name="Omzet (Rp)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}>
                        <LabelList dataKey="total_rp" position="top" style={{ fontSize: '10px', fill: '#e11d48', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[55%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredOverviewData} syncId="pembibitan1" margin={{ top: 0, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} padding={{ left: 30, right: 30 }} />
                      <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="pembesaran_batang" name="Pembesaran (Btg)" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        <LabelList dataKey="pembesaran_batang" position="top" style={{ fontSize: '10px', fill: '#64748b', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                      </Bar>
                      <Bar dataKey="penjualan_batang" name="Penjualan (Btg)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        <LabelList dataKey="penjualan_batang" position="top" style={{ fontSize: '10px', fill: '#3b82f6', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Penjualan Media Tanam */}
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[340px]">
              <div className="flex justify-between items-start md:items-center mb-4 flex-col md:flex-row gap-2">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Penjualan Media Tanam</h3>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#10b981]"></div> Terjual</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#059669] rounded-full"></div> Omzet</div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 flex flex-col gap-1">
                <div className="h-[45%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredOverviewData} syncId="pembibitan2" margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" hide padding={{ left: 30, right: 30 }} />
                      <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="polybag_omzet" name="Omzet (Rp)" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}>
                        <LabelList dataKey="polybag_omzet" position="top" style={{ fontSize: '10px', fill: '#047857', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[55%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredOverviewData} syncId="pembibitan2" margin={{ top: 0, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} padding={{ left: 30, right: 30 }} />
                      <YAxis hide domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="polybag_sold" name="Terjual (Pcs)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        <LabelList dataKey="polybag_sold" position="top" style={{ fontSize: '10px', fill: '#10b981', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

          </div>

          {/* Row 2: Rekapitulasi YTD */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5">
            <h2 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
              REKAPITULASI YEAR TO DATE (YTD)
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-xs md:text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 md:p-4 text-left font-bold text-[#1e3a8a] uppercase tracking-wider">Variabel</th>
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider">{prevYear}</th>
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider">{currentYear}</th>
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider">Persentase YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {YTD_TABLE_DATA.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 md:p-4 font-semibold text-slate-600">{row.variabel}</td>
                      <td className="p-3 md:p-4 text-center text-slate-500 font-medium">
                        {row.isCurrency 
                          ? formatRupiah(row.prevYearData) 
                          : new Intl.NumberFormat('id-ID').format(row.prevYearData)}
                      </td>
                      <td className="p-3 md:p-4 text-center font-extrabold text-[#1e3a8a]">
                        {row.isCurrency 
                          ? formatRupiah(row.currYearData) 
                          : new Intl.NumberFormat('id-ID').format(row.currYearData)}
                      </td>
                      <td className={`p-3 md:p-4 text-center font-bold ${typeof row.percent === 'string' && row.percent.startsWith('+') ? 'text-blue-600' : (row.percent === '0%' || row.percent === '-' ? 'text-slate-400' : 'text-rose-500')}`}>
                        {row.percent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (xl:col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-4 min-w-0">
          {/* Rasio: Bibit vs Media Tanam & Stok to Sale */}
          <div className="grid grid-cols-2 gap-4">

            {/* Rasio Bibit vs Media Tanam */}
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4 flex flex-col items-center relative overflow-hidden h-[180px]">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center mb-1 leading-tight">Rasio Bibit<br />vs Media Tanam</h3>
              <div className="flex-1 w-full relative -mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(() => {
                        const d = [
                          { name: 'Bibit', value: pembibitanYTD?.currBibitOmzet || 0, fill: '#3b82f6' },
                          { name: 'Media Tanam', value: pembibitanYTD?.currPolybagOmzet || 0, fill: '#10b981' }
                        ].filter(d => d.value > 0);
                        return d.length > 0 ? d : [{ name: 'Belum Ada Data', value: 1, fill: '#e2e8f0' }];
                      })()}
                      cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" stroke="#fff" strokeWidth={2}
                    >
                      <LabelList dataKey="name" position="outside" offset={8} style={{ fontSize: '9px', fontWeight: 600, fill: '#64748b' }} />
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Rasio Stok to Sale */}
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4 flex flex-col items-center relative overflow-hidden h-[180px]">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center mb-1 leading-tight">Rasio Stok<br />To Sale</h3>
              <div className="flex-1 w-full relative flex items-center justify-center">
                {renderGaugeChart()}
              </div>
            </section>
            
          </div>

          {/* Insight Analitik */}
          <div className="flex flex-col flex-1 relative min-h-[300px] xl:min-h-0">
            <div className="xl:absolute xl:inset-0 flex flex-col h-full">
              <GeminiInsight 
                programName="Pembibitan Tanaman"
              period={`${timeFilter} Bulan Terakhir (${currentYear})`}
              quantitativeData={{
                overview: filteredOverviewData,
                ytdSummary: pembibitanYTD
              }}
              headerAction={<FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
});

export default AdvancedPembibitanAnalytics;