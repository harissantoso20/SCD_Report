import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, PieChart, Pie, Cell, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis, LabelList, LineChart
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { TrendingUp, AlertTriangle } from '../Icons';
import { Sparkles, DollarSign, ShoppingBag, Sprout } from 'lucide-react';

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
      <svg className="fill-current h-2.5 w-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

const AdvancedPembibitanAnalytics = React.memo(function AdvancedPembibitanAnalytics() {
  const { pembibitanOverviewData, pembibitanYTD, currentYear } = useDashboardData();
  const [timeFilter, setTimeFilter] = useState(12);

  const filteredOverviewData = pembibitanOverviewData.slice(-timeFilter);
  
  const prevYear = Number(currentYear) - 1;

  // Mock prev year data to match scenario
  const prevData = currentYear === '2026' ? {
    pembesaran: 87045,
    penjualan: 49395,
    polybag: 0,
    omzet: 254975000
  } : {
    pembesaran: 0,
    penjualan: 0,
    polybag: 0,
    omzet: 0
  };

  const getPercentage = (curr, prev) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Pembesaran Bibit (Batang)', prevYearData: prevData.pembesaran, currYearData: pembibitanYTD.total_pembesaran, percent: getPercentage(pembibitanYTD.total_pembesaran, prevData.pembesaran) },
    { variabel: 'Penjualan Bibit (Batang)', prevYearData: prevData.penjualan, currYearData: pembibitanYTD.total_penjualan, percent: getPercentage(pembibitanYTD.total_penjualan, prevData.penjualan) },
    { variabel: 'Penjualan Polybag (Ea)', prevYearData: prevData.polybag, currYearData: pembibitanYTD.total_polybag, percent: getPercentage(pembibitanYTD.total_polybag, prevData.polybag) },
    { variabel: 'Total Omzet Keseluruhan', prevYearData: prevData.omzet, currYearData: pembibitanYTD.total_omzet, percent: getPercentage(pembibitanYTD.total_omzet, prevData.omzet) },
  ];

  const stockToSalesRatio = pembibitanYTD.total_pembesaran > 0 
    ? ((pembibitanYTD.total_penjualan / pembibitanYTD.total_pembesaran) * 100).toFixed(1)
    : 0;
  
  const deltaOmzet = pembibitanYTD.total_omzet - prevData.omzet;

  const renderGaugeChart = () => {
    const data = [
      { name: 'Terjual', value: Number(stockToSalesRatio), fill: '#3b82f6' },
      { name: 'Menumpuk', value: 100 - Number(stockToSalesRatio), fill: '#e5e7eb' }
    ];
    return (
      <div className="relative w-full h-[180px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 flex flex-col items-center">
          <span className={`text-2xl font-extrabold ${Number(stockToSalesRatio) < 20 ? 'text-rose-500' : 'text-[#1e3a8a]'}`}>{stockToSalesRatio}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rasio Terjual</span>
        </div>
      </div>
    );
  };

  const renderAIInsight = () => {
    if (filteredOverviewData.length === 0) return <p className="text-slate-500 italic text-sm">Data analitik belum tersedia untuk periode ini.</p>;
    
    const startMonth = pembibitanOverviewData[0]?.month || 'JAN';
    const endMonth = pembibitanOverviewData[pembibitanOverviewData.length - 1]?.month || '';

    let ratioStatus = '';
    let ratioColor = '';
    const ratioNum = Number(stockToSalesRatio);
    if (ratioNum >= 50) {
      ratioStatus = 'cukup sehat';
      ratioColor = 'text-blue-500';
    } else if (ratioNum >= 20) {
      ratioStatus = 'perlu ditingkatkan';
      ratioColor = 'text-sky-500';
    } else {
      ratioStatus = 'sangat rendah';
      ratioColor = 'text-rose-500';
    }

    let omzetText = '';
    if (deltaOmzet > 0) {
      omzetText = <span className="font-medium text-blue-600">Dibandingkan dengan tahun sebelumnya ({prevYear}), performa tahun ini mencatat lonjakan omzet sebesar {formatRupiah(Math.abs(deltaOmzet))}, mengonfirmasi tren pertumbuhan komersial yang sangat positif.</span>;
    } else if (deltaOmzet < 0) {
      omzetText = <span>Namun jika dibandingkan dengan tahun sebelumnya ({prevYear}), performa komersial mengalami kontraksi parah. Terdapat <span className="font-bold text-rose-500">penurunan omzet (Lost Revenue) sebesar {formatRupiah(Math.abs(deltaOmzet))}</span>, yang mensyaratkan manajemen untuk segera turun tangan membenahi rantai pasok dan mencari *offtaker* baru.</span>;
    } else {
      omzetText = <span className="font-medium text-slate-500">Secara komparatif, omzet tahun ini tercatat stagnan atau sama persis dengan pencapaian tahun {prevYear}.</span>;
    }

    const peakMonthData = [...filteredOverviewData].sort((a, b) => b.total_rp - a.total_rp)[0];
    let peakStatement = null;
    if (peakMonthData && peakMonthData.total_rp > 0) {
      peakStatement = <p>Secara bulanan, omzet tertinggi pada periode ini berhasil dicetak pada bulan <span className="font-bold text-[#1e3a8a]">{peakMonthData.month}</span> senilai <span className="font-bold text-blue-600">{formatRupiah(peakMonthData.total_rp)}</span>.</p>;
    }

    return (
      <div className="text-slate-600 font-medium leading-relaxed text-[13px] space-y-3">
        {peakStatement}
        <p>
          Secara keseluruhan dalam periode <span className="font-bold text-[#1e3a8a]">{startMonth} - {endMonth} {currentYear}</span>, rasio penjualan terhadap pembesaran bibit tercatat pada level yang <span className={`font-bold ${ratioColor}`}>{ratioStatus} ({stockToSalesRatio}%)</span>. {ratioNum < 20 ? "Tingginya aktivitas pembesaran bibit di fasilitas tidak diiringi dengan tingkat penyerapan pasar yang sepadan, memicu risiko penumpukan stok." : "Aktivitas produksi bibit berhasil diserap dengan cukup baik oleh pasar, menjaga arus kas tetap sehat."}
        </p>
        <p>
          {omzetText}
        </p>
        <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start relative z-10 shadow-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xs italic text-blue-900">
            {ratioNum < 20 
              ? '"Ibarat sebuah waduk, saat ini debit air (produksi bibit) jauh melebihi kapasitas saluran irigasi (penjualan). Jika keran distribusi tidak segera diperluas ke pasar baru, waduk ini berisiko meluap dan membebani biaya pemeliharaan."' 
              : '"Ibarat sistem perpipaan yang efisien, aliran pasokan bibit dari hulu (pembesaran) saat ini mengalir lancar menuju hilir (penjualan), menciptakan siklus perputaran stok dan modal yang sangat sehat."'}
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
          <div className="bg-blue-50/50 p-3 rounded-lg text-blue-600 border border-blue-100 relative z-10"><DollarSign size={24} className="animate-[pulse_2s_ease-in-out_infinite]" /></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue YTD</p>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a]">
              {formatRupiah(pembibitanYTD.total_omzet)}
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
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a]">
              {formatNumber(pembibitanYTD.total_penjualan)} <span className="text-lg text-slate-400 font-semibold">Batang</span>
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
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a]">
              {formatNumber(pembibitanYTD.total_pembesaran)} <span className="text-lg text-slate-400 font-semibold">Batang</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        
        {/* Insight Analitik Panel */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 xl:col-span-1 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              Insight Analitik
            </h3>
            <FilterButtons currentRange={timeFilter} setRange={setTimeFilter} />
          </div>
          <div className="flex-1 relative z-10">
            {renderAIInsight()}
          </div>
          <Sparkles size={140} className="absolute -bottom-10 -right-10 text-blue-50 opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
        </section>

        {/* Chart Panels */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 md:col-span-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Overview Produksi</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredOverviewData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '10px' }} iconType="circle"/>
                  <Bar yAxisId="left" dataKey="pembesaran_batang" name="Pembesaran (Batang)" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="pembesaran_batang" position="top" style={{fontSize: '10px', fill: '#64748b', fontWeight: 'bold'}} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                  </Bar>
                  <Bar yAxisId="left" dataKey="penjualan_batang" name="Penjualan (Batang)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList dataKey="penjualan_batang" position="top" style={{fontSize: '10px', fill: '#3b82f6', fontWeight: 'bold'}} formatter={(v) => v > 0 ? formatNumber(v) : ''} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="total_rp" name="Omzet (Rp)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}>
                    <LabelList dataKey="total_rp" position="top" style={{fontSize: '10px', fill: '#e11d48', fontWeight: 'bold'}} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center mb-2">Stock to Sales Ratio</h3>
            {renderGaugeChart()}
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col justify-between">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Pricing Trend (Harga Bibit Rata-Rata)</h3>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredOverviewData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Line type="monotone" dataKey="avg_harga_bibit" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}>
                    <LabelList dataKey="avg_harga_bibit" position="top" style={{fontSize: '10px', fill: '#f43f5e', fontWeight: 'bold'}} formatter={(v) => v > 0 ? formatRupiah(v) : ''} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400">Fluktuasi harga jual per bulan</p>
            </div>
          </section>

        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 xl:col-span-1">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Ancillary Revenue</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Omzet Bibit', value: pembibitanYTD.total_bibit_omzet, fill: '#3b82f6' },
                      { name: 'Omzet Polybag', value: pembibitanYTD.total_polybag_omzet, fill: '#1e3a8a' }
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    <LabelList dataKey="name" position="outside" offset={15} style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }} />
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {pembibitanYTD.total_polybag_omzet === 0 && (
              <div className="text-center mt-2 text-xs text-rose-500 font-medium">
                Peringatan: Belum ada pendapatan dari produk sampingan!
              </div>
            )}
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 xl:col-span-2">
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
                    <td className="p-3 md:p-4 text-center text-slate-500 font-medium">{row.prevYearData.toLocaleString('id-ID')}</td>
                    <td className="p-3 md:p-4 text-center font-extrabold text-[#1e3a8a]">{row.currYearData.toLocaleString('id-ID')}</td>
                    <td className={`p-3 md:p-4 text-center font-bold ${row.percent.startsWith('+') ? 'text-blue-600' : (row.percent === '0%' ? 'text-slate-400' : 'text-rose-500')}`}>
                      {row.percent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </div>
  );
});

export default AdvancedPembibitanAnalytics;
