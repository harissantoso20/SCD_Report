import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, ComposedChart
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Sparkles } from 'lucide-react';

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
  const prevYearOmzet = 50000000;
  const prevYearTelur = 80000;
  const prevYearKohe = 500;

  const yoyOmzetPct = ((quailYTD.total_omzet - prevYearOmzet) / prevYearOmzet) * 100;
  const yoyTelurPct = ((quailYTD.total_qty_telur - prevYearTelur) / prevYearTelur) * 100;
  const yoyKohePct = ((quailYTD.total_qty_kohe - prevYearKohe) / prevYearKohe) * 100;

  const getYoYLabel = (pct) => {
    if (pct > 0) return <span className="text-blue-600 font-semibold">▲ +{pct.toFixed(1)}% dibanding tahun lalu</span>;
    if (pct < 0) return <span className="text-rose-500 font-semibold">▼ {pct.toFixed(1)}% dibanding tahun lalu</span>;
    return <span className="text-slate-500 font-semibold">- Sama dengan tahun lalu</span>;
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Total Produksi Telur (Butir)', prevYearData: prevYearTelur, currYearData: quailYTD.total_qty_telur, percent: yoyTelurPct > 0 ? `+${yoyTelurPct.toFixed(1)}%` : `${yoyTelurPct.toFixed(1)}%` },
    { variabel: 'Total Penjualan Kohe/Kotoran (Kg)', prevYearData: prevYearKohe, currYearData: quailYTD.total_qty_kohe, percent: yoyKohePct > 0 ? `+${yoyKohePct.toFixed(1)}%` : `${yoyKohePct.toFixed(1)}%` },
    { variabel: 'Total Omzet Keseluruhan (Rp)', prevYearData: prevYearOmzet, currYearData: quailYTD.total_omzet, percent: yoyOmzetPct > 0 ? `+${yoyOmzetPct.toFixed(1)}%` : `${yoyOmzetPct.toFixed(1)}%` },
  ];

  const pieData = [
    { name: 'Telur Puyuh Mentah', value: quailYTD.total_omzet_telur },
    { name: 'Kohe/Pupuk', value: quailYTD.total_omzet_kohe },
    { name: 'Pendapatan Lain', value: quailYTD.total_omzet_lainnya }
  ].filter(item => item.value > 0);
  
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
          Jika dikomparasikan secara *Year-on-Year* (YoY), performa komersial saat ini mencatat {yoyOmzetPct > 0 ? "tren pertumbuhan positif" : "terjadinya kontraksi pendapatan"} dibandingkan periode yang sama di tahun sebelumnya. Diversifikasi ke produk sekunder seperti pupuk kohe juga {yoyKohePct > 0 ? "berhasil menopang tambahan pendapatan operasional." : "perlu dimaksimalkan kembali serapan penualannya."}
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
      
      {/* ROW 1: TOP 3 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Omzet Keseluruhan YTD</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a] mb-2">
            {formatRupiah(quailYTD.total_omzet)}
          </h2>
          <div className="text-[11px]">
            {getYoYLabel(yoyOmzetPct)}
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-400">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Produksi Telur YTD</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a] mb-2">
            {new Intl.NumberFormat('id-ID').format(quailYTD.total_qty_telur)} <span className="text-lg text-slate-400 font-semibold">Butir</span>
          </h2>
          <div className="text-[11px]">
            {getYoYLabel(yoyTelurPct)}
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Penjualan Kohe YTD</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a] mb-2">
            {new Intl.NumberFormat('id-ID').format(quailYTD.total_qty_kohe)} <span className="text-lg text-slate-400 font-semibold">Kg</span>
          </h2>
          <div className="text-[11px]">
            {getYoYLabel(yoyKohePct)}
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          
          {/* THE CORE ENGINE: Composed Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col h-[380px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                Tren Volume vs. Omzet Telur
              </h3>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                  <YAxis yAxisId="left" hide={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" hide={true} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="qty_telur" name="Volume Telur (Butir)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} label={renderLabelButir} />
                  <Line yAxisId="right" type="monotone" dataKey="omzet_telur" name="Omzet Penjualan (Rp)" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#1e3a8a', strokeWidth: 2 }} activeDot={{ r: 6 }} label={renderLineLabelRp} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REKAPITULASI YTD */}
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
                    const isZero = row.percent === '0.0%';
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

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          
          {/* INSIGHT ANALITIK */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col flex-1 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
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

          {/* DYNAMICS MARKET: Dual Chart */}
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col h-[380px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                Dinamika Pasar & Diversifikasi
              </h3>
            </div>
            
            <div className="flex-1 grid grid-cols-1 gap-4">
              
              {/* Composition Donut */}
              <div className="flex flex-col">
                <h4 className="text-[11px] font-bold text-slate-500 text-center mb-2 uppercase tracking-wider">Komposisi Pendapatan YTD</h4>
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
                      <span className="text-xl lg:text-2xl font-black text-[#1e3a8a]">{formatJuta(quailYTD.total_omzet)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default QuailAnalytics;
