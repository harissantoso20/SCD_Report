import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, ComposedChart
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Sparkles, DollarSign, Box, Bird } from 'lucide-react';

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

const QuailAnalytics = React.memo(function QuailAnalytics() {
  const { quailOverviewData, quailYTD, currentYear } = useDashboardData();
  const [timeFilter, setTimeFilter] = useState(12);

  const filteredOverviewData = quailOverviewData.slice(-timeFilter);

  const prevYear = Number(currentYear) - 1;

  const getPercentage = (curr, prev) => {
    if (prev === 0) return '-';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Total Produksi Telur (Butir)', prevYearData: quailYTD.prev_total_qty_telur, currYearData: quailYTD.total_qty_telur, percent: getPercentage(quailYTD.total_qty_telur, quailYTD.prev_total_qty_telur) },
    { variabel: 'Total Penjualan Kohe/Kotoran (Kg)', prevYearData: quailYTD.prev_total_qty_kohe, currYearData: quailYTD.total_qty_kohe, percent: getPercentage(quailYTD.total_qty_kohe, quailYTD.prev_total_qty_kohe) },
    { variabel: 'Total Omzet Keseluruhan (Rp)', prevYearData: quailYTD.prev_total_omzet, currYearData: quailYTD.total_omzet, percent: getPercentage(quailYTD.total_omzet, quailYTD.prev_total_omzet) }
  ];

  const pieData = (() => {
    const d = [
      { name: 'Telur', value: quailYTD.total_omzet_telur || 0, fill: '#3b82f6' },
      { name: 'Kohe', value: quailYTD.total_omzet_kohe || 0, fill: '#8b5cf6' }
    ].filter(item => item.value > 0);
    return d.length > 0 ? d : [{ name: 'Belum Ada Data', value: 1, fill: '#e2e8f0' }];
  })();
  
  const COLORS = ['#3b82f6', '#1e3a8a', '#f43f5e'];

  const renderAIInsight = () => {
    if (filteredOverviewData.length === 0) return <p className="text-slate-500 italic text-sm">Data analitik belum tersedia untuk periode ini.</p>;

    const startMonth = filteredOverviewData[0].month;
    const endMonth = filteredOverviewData[filteredOverviewData.length - 1].month;

    const peakMonthData = [...filteredOverviewData].sort((a, b) => b.total_omzet - a.total_omzet)[0];
    const peakTelurData = [...filteredOverviewData].sort((a, b) => b.qty_telur - a.qty_telur)[0];
    
    let peakStatement = '';
    if (peakMonthData && peakMonthData.total_omzet > 0) {
      peakStatement = `Secara bulanan, rekor omzet tertinggi terjadi pada bulan ${peakMonthData.month} senilai ${formatJuta(peakMonthData.total_omzet)}. Sementara itu, puncak produksi telur terbesar dicapai pada bulan ${peakTelurData.month} dengan volume ${new Intl.NumberFormat('id-ID').format(peakTelurData.qty_telur)} Butir.`;
    }

    const totalTelur = quailYTD.total_qty_telur;
    const avgPrice = Math.round(quailYTD.total_omzet_telur / (totalTelur || 1));
    const isPriceHealthy = avgPrice >= 400;

    return (
      <div className="text-slate-600 font-medium leading-relaxed text-[13px] space-y-3">
        {peakStatement && <p><span className="font-bold text-[#1e3a8a]">{peakStatement}</span></p>}
        <p>
          Secara keseluruhan dalam periode <span className="font-bold text-[#1e3a8a]">{startMonth} - {endMonth} {currentYear}</span>, total produksi telur puyuh mencapai <span className="font-bold text-blue-600">{new Intl.NumberFormat('id-ID').format(totalTelur)} Butir</span> dengan akumulasi pendapatan keseluruhan menyentuh <span className="font-bold text-blue-800">{formatRupiah(quailYTD.total_omzet)}</span>. Rata-rata harga jual telur di pasar berada di kisaran Rp {avgPrice}/butir. 
        </p>
        <p>
          Jika dikomparasikan secara *Year-on-Year* (YoY), {quailYTD.prev_total_omzet > 0 ? (quailYTD.total_omzet > quailYTD.prev_total_omzet ? "performa komersial saat ini mencatat tren pertumbuhan positif dibandingkan periode yang sama di tahun sebelumnya." : "terjadinya kontraksi pendapatan") : "belum ada data historis yang memadai untuk menghitung pertumbuhan komersial secara akurat."} Diversifikasi ke produk sekunder seperti pupuk kohe juga {quailYTD.prev_total_qty_kohe > 0 ? (quailYTD.total_qty_kohe > quailYTD.prev_total_qty_kohe ? "berhasil menopang tambahan pendapatan operasional." : "perlu dimaksimalkan kembali serapan penualannya.") : "merupakan strategi potensial untuk menopang tambahan pendapatan operasional."}
        </p>
        <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start relative z-10 shadow-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xs italic text-blue-900">
            {isPriceHealthy 
              ? '"Ibarat kapal yang sedang berlayar dengan angin buritan, tingginya volume produksi telur yang diiringi dengan harga jual yang kuat menjadi kunci sukses dalam mendulang cuan dari budidaya ini."' 
              : '"Ibarat mendayung perahu melompati ombak, manajemen harus pandai menjaga efisiensi harga pakan ketika harga jual rata-rata telur sedang tertekan, sembari memaksimalkan serapan produk sampingan seperti kohe untuk meminimalisir fluktuasi arus kas."'}
          </p>
        </div>
      </div>
    );
  };

  const renderLabelButir = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} fill="#64748b" fontSize={10} fontWeight="bold" textAnchor="middle">
        {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : new Intl.NumberFormat('id-ID').format(value)}
      </text>
    );
  };

  const renderLineLabelRp = (props) => {
    const { x, y, value } = props;
    if (!value) return null;
    return (
      <text x={x} y={y - 12} fill="#1e3a8a" fontSize={11} fontWeight={700} textAnchor="middle">
        {formatJuta(value)}
      </text>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">
      
      {/* MAIN LAYOUT GRID (3 Kolom: 2 Kiri, 1 Kanan) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        
        {/* LEFT COLUMN (Span 2) */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          
          {/* ROW 1: TOP 3 KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
              <div className="bg-blue-50/50 p-3 rounded-lg text-blue-600 border border-blue-100 relative z-10"><DollarSign size={24} className="animate-[pulse_2s_ease-in-out_infinite]" /></div>
              <div className="flex flex-col mb-1 relative z-10">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Total Omzet YTD</span>
                <span className="text-xl xl:text-2xl font-extrabold text-[#1e3a8a]">{formatRupiah(quailYTD.total_omzet)}</span>
              </div>
              {/* Doodle Art */}
              <div className="absolute -bottom-6 -right-4 text-blue-100/40 group-hover:-translate-y-2 group-hover:rotate-6 transition-transform duration-500 pointer-events-none">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,10 90,90 10,90" opacity="0.6" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
              <div className="bg-sky-50/50 p-3 rounded-lg text-sky-600 border border-sky-100 relative z-10"><Box size={24} className="animate-[bounce_3s_ease-in-out_infinite]" /></div>
              <div className="flex flex-col mb-1 relative z-10">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Vol. Penjualan Telur</span>
                <span className="text-xl xl:text-2xl font-extrabold text-[#1e3a8a]">{new Intl.NumberFormat('id-ID').format(quailYTD.total_qty_telur)} <span className="text-sm font-semibold text-slate-400">Butir</span></span>
              </div>
              {/* Doodle Art */}
              <div className="absolute -bottom-4 -right-4 text-sky-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="50" cy="50" rx="30" ry="40" opacity="0.7" transform="rotate(20 50 50)" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
              <div className="bg-indigo-50/50 p-3 rounded-lg text-indigo-600 border border-indigo-100 relative z-10"><Box size={24} className="animate-[pulse_3s_ease-in-out_infinite]" /></div>
              <div className="flex flex-col mb-1 relative z-10">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mb-1">Total Penjualan Kohe YTD</span>
                <span className="text-xl xl:text-2xl font-extrabold text-[#1e3a8a]">{new Intl.NumberFormat('id-ID').format(quailYTD.total_qty_kohe)} <span className="text-sm font-semibold text-slate-400">Kg</span></span>
              </div>
              {/* Doodle Art */}
              <div className="absolute -bottom-2 -right-4 text-indigo-100/40 group-hover:translate-x-2 transition-transform duration-500 pointer-events-none">
                <svg width="120" height="80" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 40 C 20 10, 40 50, 60 20 S 80 0, 100 10" />
                </svg>
              </div>
            </div>
          </div>

          {/* ROW 2: DUAL CHARTS (Telur vs Kohe) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Chart Telur */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[340px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                  Tren Penjualan Telur Puyuh
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#3b82f6]"></div> Vol (Butir)</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#1e3a8a] rounded-full"></div> Omzet (Rp)</div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 flex flex-col gap-1">
                <div className="h-[45%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredOverviewData} syncId="quailTelur" margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" hide={true} padding={{ left: 30, right: 30 }} />
                      <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="omzet_telur" name="Omzet (Rp)" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 3, fill: '#fff', stroke: '#1e3a8a', strokeWidth: 2 }} activeDot={{ r: 5 }} label={renderLineLabelRp} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[55%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredOverviewData} syncId="quailTelur" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} padding={{ left: 30, right: 30 }} />
                      <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Bar dataKey="qty_telur" name="Vol (Butir)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} label={renderLabelButir} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart Kohe */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[340px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                  Tren Penjualan Kohe
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#8b5cf6]"></div> Vol (Kg)</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-1 bg-[#4c1d95] rounded-full"></div> Omzet (Rp)</div>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 flex flex-col gap-1">
                <div className="h-[45%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredOverviewData} syncId="quailKohe" margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" hide={true} padding={{ left: 30, right: 30 }} />
                      <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="omzet_kohe" name="Omzet (Rp)" stroke="#4c1d95" strokeWidth={3} dot={{ r: 3, fill: '#fff', stroke: '#4c1d95', strokeWidth: 2 }} activeDot={{ r: 5 }} label={renderLineLabelRp} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[55%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredOverviewData} syncId="quailKohe" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} padding={{ left: 30, right: 30 }} />
                      <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                      <Tooltip cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Bar dataKey="qty_kohe" name="Vol (Kg)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} label={renderLabelButir} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: REKAPITULASI YTD */}
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col flex-1">
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
              Rekapitulasi Year to Date (YTD)
            </h3>
            <div className="w-full overflow-x-auto minimal-scrollbar flex-1 flex flex-col justify-center">
              <table className="w-full text-xs md:text-sm border-collapse border border-slate-100 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 md:p-4 text-left font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">Variabel</th>
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">{prevYear}</th>
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">{currentYear}</th>
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">Persentase YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {YTD_TABLE_DATA.map((row, idx) => {
                    const isPositive = row.percent.startsWith('+');
                    const isZero = row.percent === '0.0%' || row.percent === '-';
                    return (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 md:p-4 font-semibold text-slate-600">{row.variabel}</td>
                        <td className="p-3 md:p-4 text-center text-slate-500 font-medium">
                          {row.variabel.includes('Rp') ? formatRupiah(row.prevYearData) : row.prevYearData.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 md:p-4 text-center font-extrabold text-[#1e3a8a]">
                          {row.variabel.includes('Rp') ? formatRupiah(row.currYearData) : row.currYearData.toLocaleString('id-ID')}
                        </td>
                        <td className={`p-3 md:p-4 text-center font-bold ${isPositive ? 'text-blue-600' : isZero ? 'text-slate-500' : 'text-rose-500'}`}>
                          {row.percent}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN (Span 1) */}
        <div className="xl:col-span-1 flex flex-col gap-4 h-full">
          
          {/* INSIGHT ANALITIK */}
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

          {/* RASIO DIVERSIFIKASI */}
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[300px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                Rasio Diversifikasi YTD
              </h3>
            </div>
            
            <div className="flex-1 flex flex-col relative">
              <h4 className="text-[11px] font-bold text-slate-500 text-center mb-2 uppercase tracking-wider">Komposisi Pendapatan</h4>
              <div className="flex-1 w-full min-h-0 relative">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="75%"
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
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total</span>
                    <span className="text-lg xl:text-xl font-black text-[#1e3a8a]">{formatJuta(quailYTD.total_omzet)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
});

export default QuailAnalytics;
