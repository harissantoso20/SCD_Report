// src/components/DashboardView.js

import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, BarChart, Bar, Area, PieChart, Pie, Cell } from 'recharts';
import { PROGRAMS, PROGRAM_IMAGES, PROGRAM_DETAILS, MAP_LOCATIONS, CHART_DATA_SALES } from '../data/mockData';
import { ChevronDown, MapPin, Building, Zap, Users, TrendingUp, FileImage, FileText, TableIcon, CheckCircle, Paperclip, Plus, Truck } from './Icons';
import * as L from 'leaflet';
import useAppStore from '../store/useAppStore';
const MAGGOT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];
const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function DashboardView() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);
  
  const programContext = useAppStore((state) => state.programContext);
  const pltsLocations = useAppStore((state) => state.pltsLocations);
  const monthlyProgress = useAppStore((state) => state.monthlyProgress);
  const salesData = useAppStore((state) => state.salesData);
  const programListFromStore = useAppStore((state) => state.programList);
  const fetchData = useAppStore((state) => state.fetchData);

  const availablePrograms = programListFromStore?.length > 0 ? programListFromStore : PROGRAMS;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);
  const details = React.useMemo(() => PROGRAM_DETAILS[selectedProgram] || PROGRAM_DETAILS["default"], [selectedProgram]);
  
  const isSalesProgram = React.useMemo(() => [
    "Budidaya Maggot BSF", "Budidaya Ikan Air Tawar", "SIBA Pembibitan", 
    "Budidaya Puyuh Petelur (Seleman)", "Budidaya Puyuh Petelur (Darmo)", 
    "EcoGrow Mom Utun Makmur", "Poktan Cahaya Tani", "Budidaya Itik Petelur"
  ].includes(selectedProgram), [selectedProgram]);
  
  const mapRef = useRef(null);

  // Inisialisasi Peta Leaflet (Berjalan hanya saat program PLTS dipilih)
  useEffect(() => {
    if (selectedProgram !== "PLTS Irigasi" || !mapRef.current) return;
    
    if (mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
      mapRef.current.innerHTML = '';
    }

    const map = L.map(mapRef.current).setView([-3.5, 103.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const baseLat = -3.5;
    const baseLng = 103.5;

    const locs = pltsLocations && pltsLocations.length > 0 ? pltsLocations : MAP_LOCATIONS.map(m => ({ location_name: m.nama, capacity_kwp: m.kwp, area_ha: m.luas, farmers: m.petani }));
    const bounds = L.latLngBounds([]);

    locs.forEach((loc, idx) => {
      const markerLat = loc.lat != null ? loc.lat : (baseLat + (idx * 0.1));
      const markerLng = loc.lng != null ? loc.lng : (baseLng + (idx * 0.1));
      
      bounds.extend([markerLat, markerLng]);

      L.marker([markerLat, markerLng]).addTo(map)
        .bindPopup(`
          <div class="text-xs p-1">
            <b class="text-[#1e3a8a] text-sm">${loc.location_name}</b><br/>
            ${loc.kecamatan ? `<span class="text-gray-500 font-medium">${loc.kecamatan}, ${loc.kabupaten}, ${loc.provinsi}</span><br/>` : ''}
            <div class="mt-2 border-t border-gray-200 pt-2 text-gray-700">
              Kapasitas: <b>${loc.capacity_kwp} kWp</b><br/>
              Luas Lahan: <b>${loc.area_ha} Ha</b><br/>
              Penerima Manfaat: <b>${loc.farmers} Petani</b>
            </div>
            ${loc.map_link ? `<a href="${loc.map_link}" target="_blank" class="text-blue-600 font-medium hover:underline mt-2 inline-block">Buka di Google Maps ↗</a>` : ''}
          </div>
        `);
    });

    if (locs.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => map.remove();
  }, [selectedProgram, pltsLocations]);

  // Formatter Rupiah untuk LineChart
  const formatRupiahChart = React.useCallback((value) => `Rp ${(value / 1000000).toFixed(1)} Jt`, []);

  // Helpers untuk Maggot Chart (Layer 2)
  const renderMaggotLayer2Label = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} fill="#6b7280" fontSize={10} fontWeight="bold" textAnchor="middle">
        {value > 1000 ? (value / 1000).toFixed(1).replace('.0', '') + ' K' : value}
      </text>
    );
  };

  // Helpers untuk Maggot Chart (Layer 3A)
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

  // Month names moved to module scope to avoid infinite re-renders.

  const [yearlyProgress, setYearlyProgress] = React.useState([]);
  const [yearlySales, setYearlySales] = React.useState([]);

  React.useEffect(() => {
    if (!programContext?.id) return;
    
    const currentYear = selectedDate ? selectedDate.split('-')[0] : new Date().getFullYear().toString();
    
    const fetchYearlyData = async () => {
      // Dummy implementation
      const dummyProgress = [{ id: 1, period_date: `${currentYear}-01-01` }];
      setYearlyProgress(dummyProgress);
      setYearlySales([]);
    };
    fetchYearlyData();
  }, [selectedProgram, programContext, selectedDate]);

  const maggotBioconversionData = React.useMemo(() => {
    if (selectedProgram !== "Budidaya Maggot BSF") return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, sampah: 0, maggot: 0 }; });

    yearlyProgress.forEach(p => {
      const monthIdx = new Date(p.period_date).getMonth();
      if (dataMap[monthIdx]) {
        dataMap[monthIdx].sampah += (Number(p.extra_fields?.sampah_organik) || 0);
        const sales = yearlySales.filter(s => s.monthly_progress_id === p.id && s.product_name === "Fresh Maggot");
        dataMap[monthIdx].maggot += sales.reduce((sum, s) => sum + (s.qty || 0), 0);
      }
    });
    const validData = Object.values(dataMap).filter(item => item.sampah > 0 || item.maggot > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [selectedProgram, yearlyProgress, yearlySales]);

  const maggotFinancialData = React.useMemo(() => {
    if (selectedProgram !== "Budidaya Maggot BSF") return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, fresh: 0, kering: 0, kasgot: 0, omzet: 0 }; });

    yearlyProgress.forEach(p => {
      const monthIdx = new Date(p.period_date).getMonth();
      if (dataMap[monthIdx]) {
        const sales = yearlySales.filter(s => s.monthly_progress_id === p.id);
        sales.forEach(s => {
          if (s.product_name === "Fresh Maggot") dataMap[monthIdx].fresh += (s.qty || 0);
          if (s.product_name === "Maggot Kering") dataMap[monthIdx].kering += (s.qty || 0);
          if (s.product_name === "Kasgot") dataMap[monthIdx].kasgot += (s.qty || 0);
          dataMap[monthIdx].omzet += (s.revenue || 0);
        });
      }
    });
    const validData = Object.values(dataMap).filter(item => item.omzet > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [selectedProgram, yearlyProgress, yearlySales]);

  const maggotPortfolioData = React.useMemo(() => {
    if (selectedProgram !== "Budidaya Maggot BSF") return [];
    let freshRev = 0, keringRev = 0, kasgotRev = 0;
    yearlyProgress.forEach(p => {
      const sales = yearlySales.filter(s => s.monthly_progress_id === p.id);
      sales.forEach(s => {
        if (s.product_name === "Fresh Maggot") freshRev += (s.revenue || 0);
        if (s.product_name === "Maggot Kering") keringRev += (s.revenue || 0);
        if (s.product_name === "Kasgot") kasgotRev += (s.revenue || 0);
      });
    });
    return [
      { name: 'Fresh Maggot', value: freshRev, color: '#eab308' },
      { name: 'Maggot Kering', value: keringRev, color: '#f59e0b' },
      { name: 'Kasgot', value: kasgotRev, color: '#1e3a8a' },
    ].filter(item => item.value > 0);
  }, [selectedProgram, yearlyProgress, yearlySales]);

  const dynamicSalesChartData = React.useMemo(() => {
    if (!isSalesProgram || selectedProgram === "Budidaya Maggot BSF") return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, Omzet: 0 }; });

    yearlyProgress.forEach(p => {
      const monthIdx = new Date(p.period_date).getMonth();
      if (dataMap[monthIdx]) {
        const sales = yearlySales.filter(s => s.monthly_progress_id === p.id);
        dataMap[monthIdx].Omzet += sales.reduce((sum, s) => sum + (s.revenue || 0), 0);
      }
    });
    const validData = Object.values(dataMap).filter(item => item.Omzet > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [isSalesProgram, selectedProgram, yearlyProgress, yearlySales]);

  const totalWasteManaged = React.useMemo(() => {
    return maggotBioconversionData.reduce((sum, item) => sum + item.sampah, 0);
  }, [maggotBioconversionData]);

  const totalOmzet = React.useMemo(() => {
    return maggotPortfolioData.reduce((sum, item) => sum + item.value, 0);
  }, [maggotPortfolioData]);

  const currentMonthStr = selectedDate ? selectedDate.split('-')[1] : "01";
  const currentYearStr = selectedDate ? selectedDate.split('-')[0] : "2026";
  
  const handleMonthChange = (e) => {
    setSelectedDate(`${currentYearStr}-${e.target.value}-01`);
  };

  const handleYearChange = (e) => {
    setSelectedDate(`${e.target.value}-${currentMonthStr}-01`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Layout Dashboard */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="lg:w-1/2 flex flex-col justify-center gap-5">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-3 tracking-tight leading-tight">
              {selectedProgram}
            </h2>
            <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed border-l-4 border-[#1e3a8a] pl-3">
              {details.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative z-50">
            {/* Program Dropdown */}
            <div className="relative">
              <select 
                className="appearance-none bg-[#f8f9fa] border border-gray-200 text-[#25326a] font-bold text-[13px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] cursor-pointer shadow-sm uppercase tracking-wide"
                value={selectedProgram} 
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                {availablePrograms.map(prog => (
                  <option key={prog} value={prog}>{prog.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#25326a] pointer-events-none" size={18} strokeWidth={2.5} />
            </div>

            {/* Month Dropdown */}
            <div className="relative">
              <select 
                className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[14px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                value={currentMonthStr}
                onChange={handleMonthChange}
              >
                {INDO_MONTHS.map((m, i) => {
                  const val = (i + 1).toString().padStart(2, '0');
                  return <option key={val} value={val}>{m}</option>;
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} strokeWidth={2.5} />
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <select 
                className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[14px] rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                value={currentYearStr}
                onChange={handleYearChange}
              >
                {[2023, 2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[220px] lg:min-h-0">
          <img src={bannerImage} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
        </div>
      </div>

      {/* VISUALISASI KONDISIONAL (LEVEL 2) */}
      {selectedProgram === "PLTS Irigasi" ? (
        <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
          <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-[#1e3a8a]" />
            SEBARAN LOKASI PROGRAM
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* DAFTAR LOKASI (KIRI) */}
            <div className="lg:w-[28%] h-[420px] overflow-y-auto minimal-scrollbar pr-2 flex flex-col gap-4">
              {(() => {
                const locs = pltsLocations && pltsLocations.length > 0 ? pltsLocations : MAP_LOCATIONS.map(m => ({ location_name: m.nama, capacity_kwp: m.kwp, area_ha: m.luas, farmers: m.petani }));
                const grouped = locs.reduce((acc, loc) => {
                  let regionName = "Lainnya";
                  if (loc.kabupaten && loc.provinsi) {
                    const prefix = loc.kabupaten.toLowerCase().includes('kota') ? '' : 'Kab. ';
                    regionName = `${prefix}${loc.kabupaten}, ${loc.provinsi}`;
                  }
                  if (!acc[regionName]) acc[regionName] = [];
                  acc[regionName].push(loc);
                  return acc;
                }, {});

                return Object.entries(grouped).map(([region, villages]) => (
                  <div key={region} className="bg-gray-50 border border-gray-200 rounded p-3">
                    <h4 className="font-bold text-[11px] text-[#1e3a8a] uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-2">{region}</h4>
                    <div className="flex flex-col gap-2.5">
                      {villages.map((v, i) => (
                        <div key={i}>
                          <a href={v.map_link || '#'} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-start gap-1">
                            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                            <span>Desa {v.location_name}</span>
                          </a>
                          <p className="text-[10px] text-gray-500 mt-0.5 pl-4">{v.capacity_kwp} kWp • {v.area_ha} Ha • {v.farmers} Petani</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* PETA (TENGAH) */}
            <div className="lg:w-[48%] h-[420px] w-full border border-gray-300 rounded overflow-hidden" ref={mapRef}></div>
            
            {/* STATISTIK (KANAN) */}
            <div className="lg:w-[24%] flex flex-col gap-4 justify-center">
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Building size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">EXISTING</p>
                  <p className="text-xl font-extrabold text-[#25326a]">{pltsLocations?.length || 0} <span className="text-sm font-semibold text-gray-600">Unit</span></p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><MapPin size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL LUAS LAHAN</p>
                  <p className="text-xl font-extrabold text-[#25326a]">{pltsLocations?.reduce((sum, item) => sum + (parseFloat(item.area_ha) || 0), 0)} <span className="text-sm font-semibold text-gray-600">Ha</span></p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Zap size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL KAPASITAS</p>
                  <p className="text-xl font-extrabold text-[#25326a]">{pltsLocations?.reduce((sum, item) => sum + (parseFloat(item.capacity_kwp) || 0), 0)} <span className="text-sm font-semibold text-gray-600">kWp</span></p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PENERIMA MANFAAT</p>
                  <p className="text-xl font-extrabold text-[#25326a]">{pltsLocations?.reduce((sum, item) => sum + (parseInt(item.farmers) || 0), 0)} <span className="text-sm font-semibold text-gray-600">Petani</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : selectedProgram === "Budidaya Maggot BSF" ? (
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
      ) : isSalesProgram ? (
        <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
          <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#1e3a8a]" />
            OVERVIEW
          </h2>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 flex flex-col">
              <div className="h-[300px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicSalesChartData.length > 0 ? dynamicSalesChartData : CHART_DATA_SALES} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dy={10} />
                    <YAxis tickFormatter={formatRupiahChart} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dx={-10} />
                    <Tooltip 
                      formatter={(value) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value), "Total Omzet"]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="Omzet" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-l-4 border-yellow-400 pl-2">REKAPITULASI YEAR TO DATE (YTD)</h3>
                <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8f9fa] text-[#25326a] font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 uppercase tracking-wider text-[11px]">VARIABEL</th>
                        <th className="px-4 py-3 text-right uppercase tracking-wider text-[11px]">2025</th>
                        <th className="px-4 py-3 text-right uppercase tracking-wider text-[11px]">2026</th>
                        <th className="px-4 py-3 text-right uppercase tracking-wider text-[11px]">PERSENTASE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">Total Omzet Penjualan</td>
                        <td className="px-4 py-3 text-right text-gray-600">Rp 12.710.000</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">Rp 57.100.000</td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">+349%</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">Capaian Target Produksi</td>
                        <td className="px-4 py-3 text-right text-gray-600">65%</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">92%</td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">+27%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 flex flex-col border border-indigo-100 rounded-md bg-indigo-50/30 items-center justify-center min-h-[300px] p-6 text-center shadow-inner relative overflow-hidden group cursor-help">
              <div className="absolute inset-0 bg-[#1e3a8a]/5 group-hover:bg-[#1e3a8a]/10 transition-colors"></div>
              <FileImage size={40} className="text-indigo-300 mb-3 relative z-10" />
              <p className="text-indigo-800/60 font-semibold text-sm relative z-10 uppercase tracking-widest">Placement Infografis</p>
              <p className="text-indigo-800/40 text-xs mt-2 relative z-10">Area alokasi untuk infografis analitik lanjutan sesuai spesifikasi desain.</p>
            </div>
          </div>
        </section>
      ) : (
         <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
          <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
            <FileText size={18} className="text-[#1e3a8a]" />
            OVERVIEW INFOGRAFIS
          </h2>
          <div className="w-full flex flex-col border border-indigo-100 rounded-md bg-indigo-50/30 items-center justify-center min-h-[400px] p-6 text-center shadow-inner relative overflow-hidden group cursor-help">
              <div className="absolute inset-0 bg-[#1e3a8a]/5 group-hover:bg-[#1e3a8a]/10 transition-colors"></div>
              <FileImage size={48} className="text-indigo-300 mb-3 relative z-10" />
              <p className="text-indigo-800/60 font-semibold text-sm relative z-10 uppercase tracking-widest">Placement Infografis Laporan</p>
              <p className="text-indigo-800/40 text-xs mt-2 relative z-10 max-w-md">Program ini tidak bersifat kuantitatif secara langsung. Area ini digunakan untuk meletakkan poster infografis kualitatif.</p>
            </div>
         </section>
      )}

      {/* RINGKASAN PROGRAM (Level 3) */}
      <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
        <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
          <TableIcon size={18} className="text-[#1e3a8a]" />
          RINGKASAN PROGRAM
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={14}/> LOKASI</p>
              <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{programContext?.location || details.lokasi}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users size={14}/> PENERIMA MANFAAT</p>
              <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{programContext?.beneficiaries || details.penerima}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CheckCircle size={14}/> OBJEKTIF</p>
              <p className="text-[13px] font-medium text-gray-700 leading-relaxed text-justify">{programContext?.objective || details.objektif}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CheckCircle size={14}/> KPI</p>
              <p className="text-[13px] font-medium text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{programContext?.kpi || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp size={14}/> TPB/SDGS</p>
              <p className="text-[13px] font-semibold text-[#1e3a8a]">{programContext?.tpb || details.tpb}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 justify-center pl-2">
            <div className="bg-[#f8f9fa] p-4 rounded-md border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a8a]"></div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">ANGGARAN</p>
              <p className="text-[18px] font-extrabold text-[#1e3a8a] tracking-tight">{programContext?.budget_text || details.anggaran}</p>
            </div>
            <div className="bg-[#f8f9fa] p-4 rounded-md border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">REALISASI BIAYA</p>
              <p className="text-[18px] font-extrabold text-green-600 tracking-tight">{monthlyProgress?.budget_realization_text || "-"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-gray-100">
          <div>
            <p className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-2">PROGRESS BULAN LALU</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 min-h-[80px] italic">
              {monthlyProgress?.past_month_realization || "Belum ada rekapan progress."}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-2">RENCANA KERJA BULAN INI</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 min-h-[80px] italic">
              {monthlyProgress?.next_month_plan || "Belum ada rencana tindak lanjut."}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <Paperclip size={18} className="text-[#1e3a8a]" /> EVIDEN PROGRES (GALERI)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-32 bg-gray-200 rounded-md bg-cover bg-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity" style={{backgroundImage: `url('https://images.unsplash.com/photo-1509391366360-1e97b524c5bb?auto=format&fit=crop&w=400&q=80')`}}></div>
            <div className="h-32 bg-gray-200 rounded-md bg-cover bg-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity" style={{backgroundImage: `url('https://images.unsplash.com/photo-1592424001807-6b45f448b1bb?auto=format&fit=crop&w=400&q=80')`}}></div>
            <div className="h-32 bg-gray-200 rounded-md bg-cover bg-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity" style={{backgroundImage: `url('https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=400&q=80')`}}></div>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-gray-500 hover:text-[#1e3a8a] hover:border-[#1e3a8a] hover:bg-blue-50/30 transition-all cursor-pointer shadow-sm">
              <div className="flex flex-col items-center">
                <Plus size={24} className="mb-1" />
                <span className="text-sm font-semibold tracking-wide">3 FOTO LAINNYA</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
