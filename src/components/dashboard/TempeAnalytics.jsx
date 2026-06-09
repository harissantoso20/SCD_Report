import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, ComposedChart
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Sparkles, DollarSign, Box, ShoppingBag } from 'lucide-react';

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const formatJuta = (val) => `${(val / 1000000).toFixed(1)} Jt`;

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
      <svg className="fill-current h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

const TempeAnalytics = React.memo(function TempeAnalytics() {
  const { tempeOverviewData, tempeYTD, currentYear } = useDashboardData();
  const [timeFilter, setTimeFilter] = useState(12);

  const filteredOverviewData = tempeOverviewData.slice(-timeFilter);

  const filteredTotals = useMemo(() => {
    return filteredOverviewData.reduce((acc, curr) => {
      acc.mentah += curr.omzet_mentah;
      acc.olahan += curr.omzet_olahan;
      acc.lainnya += curr.omzet_lainnya;
      acc.total += curr.total_omzet;
      return acc;
    }, { mentah: 0, olahan: 0, lainnya: 0, total: 0 });
  }, [filteredOverviewData]);

  const prevYear = Number(currentYear) - 1;
  const prevYearOmzet = 0;
  const prevYearMentah = 0;
  const prevYearOlahan = 0;



  const pieData = [
    { name: 'Tempe Papan / Mentah', value: filteredTotals.mentah },
    { name: 'Olahan Tempe (Keripik, dll)', value: filteredTotals.olahan },
    { name: 'Pendapatan Lain', value: filteredTotals.lainnya }
  ].filter(item => item.value > 0);
  
  const COLORS = ['#3b82f6', '#1e3a8a', '#f43f5e']; // Soft Blue, Deep Navy, Soft Rose

  const renderAIInsight = () => {
    if (filteredOverviewData.length === 0) return <p className="text-slate-500 italic text-sm">Data analitik belum tersedia untuk periode ini.</p>;

    const startMonth = filteredOverviewData[0].month;
    const endMonth = filteredOverviewData[filteredOverviewData.length - 1].month;

    const peakMonthData = [...filteredOverviewData].sort((a, b) => b.total_omzet - a.total_omzet)[0];
    
    let peakStatement = '';
    if (peakMonthData && peakMonthData.total_omzet > 0) {
      peakStatement = `Secara bulanan, rekor omzet tertinggi terjadi pada bulan ${peakMonthData.month} senilai ${formatJuta(peakMonthData.total_omzet)}.`;
    }

    const totalMentah = tempeYTD.total_qty_mentah;
    const totalOlahan = tempeYTD.total_qty_olahan;
    
    const avgPriceMentah = totalMentah > 0 ? Math.round(tempeYTD.total_omzet_mentah / totalMentah) : 15000;
    const avgPriceOlahan = totalOlahan > 0 ? Math.round(tempeYTD.total_omzet_olahan / totalOlahan) : 120000;
    const isOlahanProfitable = avgPriceOlahan > avgPriceMentah * 2;

    return (
      <div className="text-slate-600 font-medium leading-relaxed text-[13px] space-y-3">
        {peakStatement && <p><span className="font-bold text-[#1e3a8a]">{peakStatement}</span></p>}
        <p>
          Secara keseluruhan dalam periode <span className="font-bold text-[#1e3a8a]">{startMonth} - {endMonth} {currentYear}</span>, volume penjualan Tempe Mentah menyentuh <span className="font-bold text-blue-600">{new Intl.NumberFormat('id-ID').format(totalMentah)} Kg</span>, sementara produk Olahan Tempe terserap pasar sebesar <span className="font-bold text-blue-900">{new Intl.NumberFormat('id-ID').format(totalOlahan)} Kg</span>. Perpaduan keduanya sukses mencetak akumulasi omzet <span className="font-bold text-blue-700">{formatRupiah(tempeYTD.total_omzet)}</span>.
        </p>
        <p>
          Jika dikomparasikan secara *Year-on-Year* (YoY), {prevYearOmzet > 0 ? (tempeYTD.total_omzet > prevYearOmzet ? "performa komersial mencatat pertumbuhan positif dibandingkan tahun sebelumnya" : "terjadi kontraksi pendapatan") : "belum ada data historis yang memadai untuk menghitung pertumbuhan komersial secara akurat"}. Di sisi lain, harga jual Olahan Tempe (rata-rata Rp {new Intl.NumberFormat('id-ID').format(avgPriceOlahan)}/Kg) terbukti jauh lebih tinggi dibandingkan harga Mentah (rata-rata Rp {new Intl.NumberFormat('id-ID').format(avgPriceMentah)}/Kg).
        </p>
        <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start relative z-10 shadow-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xs italic text-blue-900">
            {isOlahanProfitable 
              ? '"Ibarat menyulap pasir menjadi kaca, mengolah tempe papan menjadi varian turunan mampu mendongkrak margin keuntungan berkali-kali lipat. Fokus pada strategi hilirisasi ini akan sangat krusial bagi ketahanan finansial program."' 
              : '"Meskipun hilirisasi sedang berjalan, manajemen perlu terus menggali inovasi varian olahan dan mengoptimalkan efisiensi produksi agar nilai tambah ekonomi dapat terealisasi secara maksimal di pasaran."'}
          </p>
        </div>
      </div>
    );
  };

  const renderLabelKg = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} fill="#64748b" fontSize={10} fontWeight="bold" textAnchor="middle">
        {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : new Intl.NumberFormat('id-ID').format(value)}
      </text>
    );
  };

  const renderLineLabelRp = (props) => {
    const { x, y, value, stroke } = props;
    if (!value) return null;
    return (
      <text x={x} y={y - 12} fill={stroke} fontSize={11} fontWeight={700} textAnchor="middle">
        {formatJuta(value)}
      </text>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">
      
      {/* ROW 1: TOP 3 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-blue-50/50 p-3 rounded-lg text-blue-600 border border-blue-100 relative z-10"><DollarSign size={24} className="animate-[pulse_2s_ease-in-out_infinite]" /></div>
          <div className="flex flex-col mb-1 relative z-10">
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Total Omzet Keseluruhan YTD</span>
            <span className="text-xl xl:text-2xl font-extrabold text-[#1e3a8a]">{formatRupiah(tempeYTD.total_omzet)}</span>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-6 -right-6 text-blue-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" opacity="0.5" />
              <circle cx="70" cy="30" r="20" opacity="0.8" />
            </svg>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-sky-50/50 p-3 rounded-lg text-sky-600 border border-sky-100 relative z-10"><Box size={24} className="animate-[bounce_3s_ease-in-out_infinite]" /></div>
          <div className="flex flex-col mb-1 relative z-10">
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Vol. Jual Tempe Mentah</span>
            <span className="text-xl xl:text-2xl font-extrabold text-[#1e3a8a]">{new Intl.NumberFormat('id-ID').format(tempeYTD.total_qty_mentah)} <span className="text-sm font-semibold text-slate-400">Kg</span></span>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-2 -right-4 text-sky-100/40 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-500 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 40 L40 10 L70 40 L100 10" />
            </svg>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-indigo-50/50 p-3 rounded-lg text-indigo-600 border border-indigo-100 relative z-10"><ShoppingBag size={24} className="animate-[pulse_3s_ease-in-out_infinite]" /></div>
          <div className="flex flex-col mb-1 relative z-10">
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Vol. Jual Olahan Tempe</span>
            <span className="text-xl xl:text-2xl font-extrabold text-[#1e3a8a]">{new Intl.NumberFormat('id-ID').format(tempeYTD.total_qty_olahan)} <span className="text-sm font-semibold text-slate-400">Kg</span></span>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-4 -right-2 text-indigo-100/40 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="60" height="60" rx="10" transform="rotate(15 50 50)" />
              <rect x="30" y="30" width="40" height="40" rx="5" transform="rotate(-10 50 50)" />
            </svg>
          </div>
        </div>
      </div>

      {/* ROW 2: TREN VOLUME & KOMPOSISI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* LEFT COLUMN: TREN VOLUME */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[380px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
              Tren Volume vs. Omzet Kategori
            </h3>
            <div className="flex flex-wrap justify-end items-center gap-2 md:gap-3 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#3b82f6]"></div> Vol Mentah</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#1e3a8a]"></div> Vol Olahan</div>
              <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#3b82f6] rounded-full"></div> Omzet Mentah</div>
              <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#1e3a8a] rounded-full"></div> Omzet Olahan</div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0 flex flex-col gap-1">
            <div className="h-[45%] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredOverviewData} syncId="tempeChart" margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" hide={true} padding={{ left: 30, right: 30 }} />
                  <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                  <Tooltip cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="omzet_mentah" name="Omzet Mentah (Rp)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} label={renderLineLabelRp} />
                  <Line type="monotone" dataKey="omzet_olahan" name="Omzet Olahan (Rp)" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#1e3a8a', strokeWidth: 2 }} activeDot={{ r: 6 }} label={renderLineLabelRp} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[55%] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredOverviewData} syncId="tempeChart" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} padding={{ left: 30, right: 30 }} />
                  <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                  <Tooltip cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Bar dataKey="qty_mentah" name="Vol. Tempe Mentah (Kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} label={renderLabelKg} />
                  <Bar dataKey="qty_olahan" name="Vol. Olahan Tempe (Kg)" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={16} label={renderLabelKg} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: KOMPOSISI */}
        <div className="lg:col-span-1 bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[380px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
              Komposisi Portofolio
            </h3>
          </div>
          
          <div className="flex-1 w-full min-h-0 relative flex flex-col justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatRupiah(val)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-xs italic">Belum ada data pendapatan</p>
              </div>
            )}
            {pieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-15px]">
                <span className="text-[11px] text-slate-500 font-bold uppercase">Total Omzet</span>
                <span className="text-lg xl:text-xl font-black text-[#1e3a8a]">{formatJuta(filteredTotals.total)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: INSIGHT ANALITIK */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            Insight Analitik
          </h3>
          <FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />
        </div>
        
        <div className="flex-1 flex flex-col justify-center relative z-10">
          {renderAIInsight()}
        </div>
        <Sparkles size={140} className="absolute -bottom-10 -right-10 text-blue-50 opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
      </div>

    </div>
  );
});

export default TempeAnalytics;
