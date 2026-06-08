import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ComposedChart, Line, PieChart, Pie, Cell } from 'recharts';
import useAppStore from '../../store/useAppStore';
import { PROGRAM_IMAGES, PROGRAM_DETAILS } from '../../data/mockData';
import { Zap, TrendingUp, Truck, CheckCircle } from '../Icons';
import { useDashboardData } from '../../hooks/useDashboardData';

// Helpers untuk Maggot Chart
const renderMaggotLayer2Label = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 8} fill="#6b7280" fontSize={10} fontWeight="bold" textAnchor="middle">
      {value > 1000 ? (value / 1000).toFixed(1).replace('.0', '') + ' K' : value}
    </text>
  );
};

const renderMaggotLayer3LineLabel = (props) => {
  const { x, y, value } = props;
  if (value === 0) return <text x={x} y={y - 12} fill="#374151" fontSize={11} fontWeight="bold" textAnchor="middle">0</text>;
  return (
    <text x={x} y={y - 12} fill="#374151" fontSize={11} fontWeight="bold" textAnchor="middle">
      {(value / 1000000).toFixed(1).replace('.0', '') + ' Jt'}
    </text>
  );
};

const renderMaggotLayer3BarLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y + 12} fill="#fff" fontSize={10} fontWeight="bold" textAnchor="middle">
      {value}
    </text>
  );
};

export default function MaggotVisualization() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  
  const { 
    maggotBioconversionData, 
    maggotFinancialData, 
    maggotPortfolioData, 
    totalWasteManaged, 
    totalOmzet 
  } = useDashboardData();

  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);
  const details = React.useMemo(() => PROGRAM_DETAILS[selectedProgram] || PROGRAM_DETAILS["default"], [selectedProgram]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* KOLOM KIRI (2/3) */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Baris Atas Kiri: Waste Managed & Ekuivalensi */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* 1A. Waste Managed */}
          <div className="md:w-1/3 bg-green-50 rounded-xl shadow-sm border border-green-100 p-6 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="relative z-10 animate-[pulse_4s_ease-in-out_infinite]">
              <p className="text-[11px] font-extrabold text-green-700 uppercase tracking-widest mb-2">Waste Managed (YTD)</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-green-900 tracking-tighter">
                  {new Intl.NumberFormat('id-ID').format(totalWasteManaged)}
                </h3>
                <span className="text-lg font-bold text-green-700">Kg</span>
              </div>
              <p className="text-sm font-semibold text-green-800 mt-2">Sampah Organik</p>
            </div>
            {/* Sparkline decoration */}
            <div className="absolute -bottom-6 -right-6 text-green-200/50 group-hover:translate-x-2 transition-transform duration-500">
                <svg width="150" height="100" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 40 C 20 35, 40 45, 60 20 S 80 0, 100 5" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* 1B. Ilustrasi Kontekstual */}
          <div className="md:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-6 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="bg-green-50 p-4 rounded-full text-green-600 border border-green-100 shadow-sm shrink-0 flex items-center justify-center relative">
              {/* Decorative looping rings */}
              <div className="absolute inset-0 rounded-full border border-green-400 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
              <Truck size={32} className="animate-[bounce_2s_infinite] relative z-10" />
            </div>
            <div>
              <h4 className="text-[13px] font-black text-[#25326a] uppercase tracking-wider mb-2 group-hover:text-green-700 transition-colors">Ekuivalensi Dampak Lingkungan</h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                ♻️ Mengurai <strong className="text-green-700">{new Intl.NumberFormat('id-ID').format(totalWasteManaged)} Kg</strong> sampah organik setara dengan <strong>mencegah timbunan limbah dari ±150 rumah tangga</strong> selama sebulan penuh. Budidaya Maggot secara signifikan memperpanjang umur TPA (Tempat Pembuangan Akhir).
              </p>
            </div>
          </div>
        </div>

        {/* Baris Bawah Kiri: Konversi & Tren Penjualan */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* 2A. Konversi Input Output */}
          <div className="md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-[14px] font-black text-[#25326a] uppercase tracking-wider border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              <Zap size={18} className="text-[#f59e0b]" />
              Konversi Input - Output
            </h2>
            <div className="h-[240px] w-full px-2 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maggotBioconversionData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} dy={10} />
                  <YAxis hide={true} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sampah" name="Sampah Organik (Kg)" fill="#1e3a8a" barSize={24} radius={[4, 4, 0, 0]} label={renderMaggotLayer2Label} />
                  <Bar dataKey="maggot" name="Fresh Maggot (Kg)" fill="#f59e0b" barSize={16} radius={[3, 3, 0, 0]} label={renderMaggotLayer2Label} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend Konversi */}
            <div className="flex justify-center items-center gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#1e3a8a] rounded-sm"></div>
                <span className="text-[10px] font-bold text-gray-600 tracking-wider">SAMPAH (INPUT)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-sm"></div>
                <span className="text-[10px] font-bold text-gray-600 tracking-wider">MAGGOT (OUTPUT)</span>
              </div>
            </div>
          </div>

          {/* 2B. Tren Penjualan & Omzet */}
          <div className="md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-[14px] font-black text-[#25326a] uppercase tracking-wider border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#10b981]" />
              Tren Penjualan
            </h2>
            <div className="h-[240px] w-full px-2 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={maggotFinancialData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} dy={10} />
                  <YAxis yAxisId="left" hide={true} />
                  <YAxis yAxisId="right" orientation="right" hide={true} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  
                  <Bar yAxisId="left" dataKey="kasgot" name="Kasgot (Kg)" stackId="a" fill="#1e3a8a" barSize={24} />
                  <Bar yAxisId="left" dataKey="kering" name="Maggot Kering (Kg)" stackId="a" fill="#f59e0b" barSize={24} />
                  <Bar yAxisId="left" dataKey="fresh" name="Fresh Maggot (Kg)" stackId="a" fill="#eab308" barSize={24} radius={[4, 4, 0, 0]} label={renderMaggotLayer3BarLabel} />
                  
                  <Line yAxisId="right" type="monotone" dataKey="omzet" name="Total Omzet (Rp)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#10b981' }} activeDot={{ r: 6 }} label={renderMaggotLayer3LineLabel} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* Legend Penjualan */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#eab308] rounded-sm"></div>
                <span className="text-[10px] font-bold text-gray-600 tracking-wider">FRESH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#f59e0b] rounded-sm"></div>
                <span className="text-[10px] font-bold text-gray-600 tracking-wider">KERING</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#1e3a8a] rounded-sm"></div>
                <span className="text-[10px] font-bold text-gray-600 tracking-wider">KASGOT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 bg-[#10b981] relative"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-[#10b981] bg-white"></div></div>
                <span className="text-[10px] font-bold text-gray-600 tracking-wider">OMZET</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* KOLOM KANAN (1/3) */}
      <div className="flex flex-col gap-6">
        
        {/* Hero Banner */}
        <div className="flex-1 min-h-[200px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
          <img src={bannerImage} alt={selectedProgram} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a8a]/90 via-[#1e3a8a]/40 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-white font-black text-2xl mb-1 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]">{selectedProgram}</h3>
            <p className="text-white/90 text-xs font-medium line-clamp-3 leading-relaxed drop-shadow-sm">{details.desc}</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[300px]">
          <h2 className="text-[14px] font-black text-[#25326a] uppercase tracking-wider border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-[#1e3a8a]" />
            Pie Chart
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maggotPortfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {maggotPortfolioData.map((entry, index) => (
                      <Cell key={"cell-" + index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value), "Omzet"]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12 animate-[pulse_4s_ease-in-out_infinite]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
              <span className="text-lg font-black text-[#25326a]">
                {(totalOmzet / 1000000).toFixed(1).replace('.0', '')} Jt
              </span>
            </div>
            
            {/* Legend Pie Chart */}
            <div className="w-full mt-4 flex flex-col gap-2">
              {maggotPortfolioData.map((item, i) => (
                <div key={i} className="flex items-center justify-between hover:bg-gray-50 p-1 rounded transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full group-hover:scale-110 transition-transform" style={{backgroundColor: item.color}}></div>
                    <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider group-hover:text-[#25326a] transition-colors">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-900 group-hover:text-[#25326a] transition-colors">
                    {totalOmzet > 0 ? Math.round((item.value / totalOmzet) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
