import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Sparkles, DollarSign, Package, ShoppingBag } from 'lucide-react'; // icons imported

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

const AdvancedFishAnalytics = React.memo(function AdvancedFishAnalytics() {
  const { fisheryOverviewData, fisheryPortfolioRaw, fisheryYTD, currentYear } = useDashboardData();
  
  const [timeFilter, setTimeFilter] = useState(12);

  // Sliced data based on single filter
  const filteredOverviewData = useMemo(() => fisheryOverviewData.slice(-timeFilter), [fisheryOverviewData, timeFilter]);
  const slicedPortfolioRaw = useMemo(() => fisheryPortfolioRaw.slice(-timeFilter), [fisheryPortfolioRaw, timeFilter]);

  // Aggregate sliced portfolio data
  const fisheryPortfolio = useMemo(() => {
    const konsumsiMap = {};
    const bibitMap = {};

    slicedPortfolioRaw.forEach(monthData => {
      Object.entries(monthData.konsumsi).forEach(([k, v]) => {
        konsumsiMap[k] = (konsumsiMap[k] || 0) + v;
      });
      Object.entries(monthData.bibit).forEach(([k, v]) => {
        bibitMap[k] = (bibitMap[k] || 0) + v;
      });
    });

    const colors = ['#1e3a8a', '#3b82f6', '#f43f5e', '#64748b', '#0ea5e9', '#e11d48'];
    const formatPortfolio = (map) => {
      const d = Object.entries(map)
        .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
        .filter(item => item.value > 0);
      return d.length > 0 ? d : [{ name: 'Belum Ada Data', value: 1, color: '#e2e8f0' }];
    };

    return {
      konsumsi: formatPortfolio(konsumsiMap),
      bibit: formatPortfolio(bibitMap)
    };
  }, [slicedPortfolioRaw]);

  // AI Logic for Insight Analitik
  const generateCrossRevenueAI = () => {
    if (!filteredOverviewData || filteredOverviewData.length === 0) return "Belum ada data penjualan pada periode ini.";

    let totalKonsumsi = 0;
    let totalBibit = 0;
    let maxBulan = filteredOverviewData[0].month;
    let maxOmzet = 0;

    filteredOverviewData.forEach(d => {
      totalKonsumsi += d.konsumsi_rp || 0;
      totalBibit += d.bibit_rp || 0;
      if ((d.konsumsi_rp + d.bibit_rp) > maxOmzet) {
        maxOmzet = d.konsumsi_rp + d.bibit_rp;
        maxBulan = d.month;
      }
    });

    const total = totalKonsumsi + totalBibit;
    if (total === 0) return "Tidak ada transaksi tercatat di periode ini. Fokus pada strategi pemasaran dan edukasi calon pembeli.";

    const pctKonsumsi = Math.round((totalKonsumsi / total) * 100);
    const pctBibit = 100 - pctKonsumsi;

    const winner = totalKonsumsi > totalBibit ? "Ikan Konsumsi" : "Bibit Ikan";
    const winnerPct = totalKonsumsi > totalBibit ? pctKonsumsi : pctBibit;

    return (
      <div className="text-slate-600 font-medium leading-relaxed text-[13px] space-y-3">
        <p>
          Secara bulanan, puncak gairah pasar terjadi pada bulan <span className="font-bold text-[#1e3a8a]">{maxBulan}</span> dengan total omzet tertinggi menembus <span className="font-bold text-blue-600">{formatJuta(maxOmzet)}</span>.
        </p>
        <p>
          Secara keseluruhan dalam periode <span className="font-bold text-[#1e3a8a]">{filteredOverviewData[0].month} - {filteredOverviewData[filteredOverviewData.length - 1].month} {currentYear}</span>, total pendapatan mencapai <span className="font-bold text-blue-800">{formatRupiah(total)}</span>. Portofolio bisnis saat ini sangat condong pada penjualan <span className="font-bold text-blue-600">{winner}</span>, yang menguasai <span className="font-bold text-slate-800">{winnerPct}%</span> dari kue pendapatan.
        </p>
        <p>
          Jika dikomparasikan secara *Year-on-Year* (YoY), omzet YTD ini mencerminkan tren pertumbuhan positif bila dibandingkan dengan perolehan di tahun sebelumnya.
        </p>
        <div className="mt-3 bg-blue-50/60 p-3 rounded border border-blue-100 flex gap-3 items-start shadow-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xs italic text-blue-900">
            "Ibarat mesin ganda, lini {winner.toLowerCase()} saat ini bertindak sebagai lokomotif utama. Namun menjaga lini {winner === 'Ikan Konsumsi' ? 'bibit ikan' : 'ikan konsumsi'} tetap berjalan adalah strategi lindung nilai yang cerdas terhadap fluktuasi permintaan."
          </p>
        </div>
      </div>
    );
  };

  // Fallback mock data for YTD Table
  const prevYear = Number(currentYear) - 1;
  
  const getPercentage = (curr, prev) => {
    if (prev === 0) return '-';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
  };

  const YTD_TABLE_DATA = [
    { variabel: 'Penjualan Ikan Konsumsi (Kg)', prevYearData: fisheryYTD?.prevKonsumsi || 0, currYearData: fisheryYTD?.currKonsumsi || 0, percent: getPercentage(fisheryYTD?.currKonsumsi || 0, fisheryYTD?.prevKonsumsi || 0), isCurrency: false },
    { variabel: 'Penjualan Bibit Ikan (Ekor)', prevYearData: fisheryYTD?.prevBibit || 0, currYearData: fisheryYTD?.currBibit || 0, percent: getPercentage(fisheryYTD?.currBibit || 0, fisheryYTD?.prevBibit || 0), isCurrency: false },
    { variabel: 'Total Omzet Keseluruhan', prevYearData: fisheryYTD?.prevRevenue || 0, currYearData: fisheryYTD?.currRevenue || 0, percent: getPercentage(fisheryYTD?.currRevenue || 0, fisheryYTD?.prevRevenue || 0), isCurrency: true },
  ];

  const renderLineLabelRp = (props) => {
    const { x, y, value } = props;
    if (!value) return null;
    return (
      <text x={x} y={y - 12} fill="#1e3a8a" fontSize={11} fontWeight={700} textAnchor="middle">
        {formatJuta(value)}
      </text>
    );
  };

  const renderLabelKg = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} fill="#3b82f6" fontSize={10} fontWeight="bold" textAnchor="middle">
        {new Intl.NumberFormat('id-ID').format(value)}
      </text>
    );
  };

  const renderLabelEkor = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} fill="#f43f5e" fontSize={10} fontWeight="bold" textAnchor="middle">
        {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : new Intl.NumberFormat('id-ID').format(value)}
      </text>
    );
  };

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (!value) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
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
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue YTD</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {formatRupiah(fisheryYTD?.currRevenue || 0)}
            </h2>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-4 -right-2 text-blue-100/40 group-hover:translate-x-2 transition-transform duration-500 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 25 Q 25 5, 50 25 T 100 25" />
            </svg>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-sky-50/50 p-3 rounded-lg text-sky-600 border border-sky-100 relative z-10"><ShoppingBag size={24} className="animate-[bounce_3s_ease-in-out_infinite]" /></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Ikan Konsumsi YTD</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {new Intl.NumberFormat('id-ID').format(fisheryYTD?.currKonsumsi || 0)} <span className="text-lg text-slate-400 font-semibold">Kg</span>
            </h2>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-6 -right-6 text-sky-100/40 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 C 80 10, 90 50, 90 90 C 50 90, 10 90, 10 50 C 10 10, 50 10, 50 10 Z" opacity="0.6" />
            </svg>
          </div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-start gap-4 relative overflow-hidden group">
          <div className="bg-indigo-50/50 p-3 rounded-lg text-indigo-600 border border-indigo-100 relative z-10"><Package size={24} className="animate-[pulse_3s_ease-in-out_infinite]" /></div>
          <div className="flex-1 relative z-10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bibit Ikan YTD</p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1e3a8a]">
              {new Intl.NumberFormat('id-ID').format(fisheryYTD?.currBibit || 0)} <span className="text-lg text-slate-400 font-semibold">Ekor</span>
            </h2>
          </div>
          {/* Doodle Art */}
          <div className="absolute -bottom-4 -right-4 text-indigo-100/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="70" r="20" />
              <circle cx="70" cy="40" r="15" />
              <circle cx="50" cy="20" r="10" />
            </svg>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID (Matching Wireframe) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          
          {/* OVERVIEW PENJUALAN */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                Overview Penjualan
              </h3>
            </div>
            
            {/* Sub-row: 2 Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Chart: Konsumsi */}
              <div className="border border-slate-100 rounded-lg p-3 md:p-4 bg-slate-50/50 flex flex-col">
                <div className="flex-1 flex flex-col justify-end">
                  <div className="h-28 w-full mb-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                        <XAxis dataKey="month" hide={true} />
                        <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                        <Tooltip formatter={(val) => formatRupiah(val)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="konsumsi_rp" name="Omzet Konsumsi" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#1e3a8a' }} activeDot={{ r: 6 }} label={renderLineLabelRp} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={10} interval={0} />
                        <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Bar dataKey="konsumsi_kg" name="Ikan Konsumsi" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={24} label={renderLabelKg} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-4 mt-4">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#60a5fa] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">KONSUMSI (KG)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-[#1e3a8a]"></div><div className="w-2 h-2 rounded-full bg-[#1e3a8a] -ml-2.5 border border-white"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">OMZET (RP)</span></div>
                </div>
              </div>

              {/* Chart: Bibit */}
              <div className="border border-slate-100 rounded-lg p-3 md:p-4 bg-slate-50/50 flex flex-col">
                <div className="flex-1 flex flex-col justify-end">
                  <div className="h-28 w-full mb-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                        <XAxis dataKey="month" hide={true} />
                        <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                        <Tooltip formatter={(val) => formatRupiah(val)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="bibit_rp" name="Omzet Bibit" stroke="#be123c" strokeWidth={3} dot={{ r: 4, fill: '#be123c' }} activeDot={{ r: 6 }} label={renderLineLabelRp} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={10} interval={0} />
                        <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Bar dataKey="bibit_ekor" name="Bibit Ikan" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={24} label={renderLabelEkor} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-4 mt-4">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#fb7185] rounded-sm"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">BIBIT (EKOR)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-[#be123c]"></div><div className="w-2 h-2 rounded-full bg-[#be123c] -ml-2.5 border border-white"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">OMZET (RP)</span></div>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-lg p-3 md:p-4 bg-slate-50/50">
              <h4 className="text-[11px] font-bold text-[#1e3a8a] text-center mb-4 uppercase tracking-wider">Tren Omzet Keseluruhan (Rp)</h4>
              <div className="flex flex-wrap justify-center items-center gap-x-3 mb-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#1e3a8a]"></div><span className="text-[9px] font-bold text-gray-600 tracking-wider">TOTAL OMZET</span></div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={10} interval={0} />
                    <YAxis hide={true} domain={[0, dataMax => Math.max(10, Math.ceil((dataMax || 0) * 1.2))]} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} 
                      formatter={(val, name) => [formatRupiah(val), name]} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                    />
                    <Line type="monotone" dataKey="total_rp" name="Total Omzet" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#1e3a8a', strokeWidth: 2 }} activeDot={{ r: 6 }} label={renderLineLabelRp} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
                    <th className="p-3 md:p-4 text-center font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-200">Persentase</th>
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
                      <td className={`p-3 md:p-4 text-center font-bold ${row.percent.startsWith('+') ? 'text-blue-600' : (row.percent === '-' ? 'text-slate-400' : 'text-rose-500')}`}>
                        {row.percent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          
          {/* INSIGHT ANALITIK (50% Height) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col flex-1 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
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

          {/* SPECIES PORTFOLIO (PieCharts Reverted) (50% Height) */}
          <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col flex-1">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-widest">
                Species Portfolio (Omzet)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              
              {/* Pie Chart: Ikan Konsumsi */}
              <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ikan Konsumsi</h4>
                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fisheryPortfolio.konsumsi}
                        innerRadius="40%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {fisheryPortfolio.konsumsi.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val) => formatRupiah(val)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legends Konsumsi */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {fisheryPortfolio.konsumsi.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart: Bibit Ikan */}
              <div className="flex flex-col items-center justify-center w-full min-h-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bibit Ikan</h4>
                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fisheryPortfolio.bibit}
                        innerRadius="40%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {fisheryPortfolio.bibit.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val) => formatRupiah(val)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legends Bibit */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {fisheryPortfolio.bibit.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
});

export default AdvancedFishAnalytics;
