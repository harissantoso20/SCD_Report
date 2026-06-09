import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, LabelList
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

const AdvancedFishAnalytics = React.memo(function AdvancedFishAnalytics() {
  const { fisheryOverviewData, fisheryPortfolioRaw, fisheryYTD, currentYear } = useDashboardData();
  
  const [timeFilter, setTimeFilter] = useState(12);

  // Sliced data based on single filter
  const filteredOverviewData = fisheryOverviewData.slice(-timeFilter);
  const slicedPortfolioRaw = fisheryPortfolioRaw.slice(-timeFilter);

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
    const formatPortfolio = (map) => Object.entries(map)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
      .filter(item => item.value > 0);

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
  const YTD_TABLE_DATA = [
    { variabel: 'Penjualan Ikan Konsumsi (Kg)', prevYearData: 1090, currYearData: fisheryYTD.total_konsumsi_kg, percent: '+3%' },
    { variabel: 'Penjualan Bibit Ikan (Ekor)', prevYearData: 0, currYearData: fisheryYTD.total_bibit_ekor, percent: '+100%' },
    { variabel: 'Total Omzet Keseluruhan', prevYearData: 36695000, currYearData: fisheryYTD.total_revenue, percent: '+9%' },
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
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-600">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue YTD</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a]">
            {formatRupiah(fisheryYTD.total_revenue)}
          </h2>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-400">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Ikan Konsumsi YTD</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a]">
            {new Intl.NumberFormat('id-ID').format(fisheryYTD.total_konsumsi_kg)} <span className="text-lg text-slate-400 font-semibold">Kg</span>
          </h2>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-900">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bibit Ikan YTD</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1e3a8a]">
            {new Intl.NumberFormat('id-ID').format(fisheryYTD.total_bibit_ekor)} <span className="text-lg text-slate-400 font-semibold">Ekor</span>
          </h2>
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
              <div className="border border-slate-100 rounded-lg p-3 md:p-4 bg-slate-50/50">
                <h4 className="text-[11px] font-bold text-[#1e3a8a] text-center mb-4 uppercase tracking-wider">Penjualan Ikan Konsumsi (Kg)</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={10} interval={0} />
                      <YAxis hide={true} domain={[0, 'dataMax * 1.2']} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      <Bar dataKey="konsumsi_kg" name="Ikan Konsumsi" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} label={renderLabelKg} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart: Bibit */}
              <div className="border border-slate-100 rounded-lg p-3 md:p-4 bg-slate-50/50">
                <h4 className="text-[11px] font-bold text-[#1e3a8a] text-center mb-4 uppercase tracking-wider">Penjualan Bibit Ikan (Ekor)</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={10} interval={0} />
                      <YAxis hide={true} domain={[0, 'dataMax * 1.2']} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      <Bar dataKey="bibit_ekor" name="Bibit Ikan" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} label={renderLabelEkor} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sub-row: Total Omzet Line Chart */}
            <div className="border border-slate-100 rounded-lg p-3 md:p-4 bg-slate-50/50">
              <h4 className="text-[11px] font-bold text-[#1e3a8a] text-center mb-4 uppercase tracking-wider">Total Omzet Keseluruhan (Rp)</h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredOverviewData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={10} interval={0} />
                    <YAxis hide={true} domain={[0, 'dataMax * 1.2']} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc', strokeDasharray: '3 3' }} 
                      formatter={(val) => [formatRupiah(val), 'Total Omzet']} 
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
                      <td className="p-3 md:p-4 text-center text-slate-500 font-medium">{row.prevYearData.toLocaleString('id-ID')}</td>
                      <td className="p-3 md:p-4 text-center font-extrabold text-[#1e3a8a]">{row.currYearData.toLocaleString('id-ID')}</td>
                      <td className={`p-3 md:p-4 text-center font-bold ${row.percent.startsWith('+') ? 'text-blue-600' : 'text-rose-500'}`}>
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
