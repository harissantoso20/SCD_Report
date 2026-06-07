// src/components/DashboardView.js

import React, { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PROGRAMS, PROGRAM_IMAGES, PROGRAM_DETAILS, MAP_LOCATIONS, CHART_DATA_SALES } from '../data/mockData';
import { ChevronDown, MapPin, Building, Zap, Users, TrendingUp, FileImage, FileText, TableIcon, CheckCircle, Paperclip, Plus } from './Icons';
import * as L from 'leaflet';
import useAppStore from '../store/useAppStore';

export default function DashboardView() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);

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

    MAP_LOCATIONS.forEach(loc => {
      L.marker([loc.lat, loc.lng]).addTo(map)
        .bindPopup(`
          <div class="text-xs">
            <b class="text-[#1e3a8a] text-sm">${loc.nama}</b><br/>
            Kapasitas: ${loc.kwp} kWp<br/>
            Luas Lahan: ${loc.luas} Ha<br/>
            Penerima Manfaat: ${loc.petani} Petani
          </div>
        `);
    });

    return () => map.remove();
  }, [selectedProgram]);

  // Formatter Rupiah untuk LineChart
  const formatRupiahChart = React.useCallback((value) => `Rp ${(value / 1000000).toFixed(1)} Jt`, []);

  return (
    <div className="flex flex-col gap-10">
      
      {/* Header Layout Dashboard */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-3 tracking-tight leading-tight">
              {selectedProgram}
            </h2>
            <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed border-l-4 border-[#1e3a8a] pl-3">
              {details.desc}
            </p>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative z-50 mt-6 lg:mt-0">
            <div className="flex-1 relative">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">
                Periode
              </label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-sm p-2 pl-3 text-sm text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-shadow" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
            <div className="flex-1 relative z-50">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">
                Program
              </label>
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 rounded-sm p-2 pl-3 text-sm text-gray-800 appearance-none focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white cursor-pointer transition-shadow" 
                  value={selectedProgram} 
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  {PROGRAMS.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" size={16} />
              </div>
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
            <div className="lg:w-2/3 h-[420px] w-full border border-gray-300 rounded overflow-hidden" ref={mapRef}></div>
            
            <div className="lg:w-1/3 flex flex-col gap-4 justify-center">
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Building size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">EXISTING</p>
                  <p className="text-xl font-extrabold text-[#25326a]">11 <span className="text-sm font-semibold text-gray-600">Unit</span></p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><MapPin size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL LUAS LAHAN</p>
                  <p className="text-xl font-extrabold text-[#25326a]">638 <span className="text-sm font-semibold text-gray-600">Ha</span></p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Zap size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL KAPASITAS</p>
                  <p className="text-xl font-extrabold text-[#25326a]">318 <span className="text-sm font-semibold text-gray-600">kWp</span></p>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PENERIMA MANFAAT</p>
                  <p className="text-xl font-extrabold text-[#25326a]">1.189 <span className="text-sm font-semibold text-gray-600">Petani</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>
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
                  <LineChart data={CHART_DATA_SALES} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={14}/> LOKASI</p>
              <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{details.lokasi}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users size={14}/> PENERIMA MANFAAT</p>
              <p className="text-[13px] font-semibold text-gray-800 leading-relaxed">{details.penerima}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-r border-gray-100 pr-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CheckCircle size={14}/> OBJEKTIF & KPI</p>
              <p className="text-[13px] font-medium text-gray-700 leading-relaxed text-justify">{details.objektif}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp size={14}/> TPB/SDGS</p>
              <p className="text-[13px] font-semibold text-[#1e3a8a]">{details.tpb}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 justify-center pl-2">
            <div className="bg-[#f8f9fa] p-4 rounded-md border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a8a]"></div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">ANGGARAN 2026</p>
              <p className="text-[18px] font-extrabold text-[#1e3a8a] tracking-tight">{details.anggaran}</p>
            </div>
            <div className="bg-[#f8f9fa] p-4 rounded-md border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">REALISASI BIAYA 2026</p>
              <p className="text-[18px] font-extrabold text-green-600 tracking-tight">{details.realisasi}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-gray-100">
          <div>
            <p className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-2">PROGRESS BULAN LALU</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 min-h-[80px] italic">Memuat rekapan progress kualitatif dari database...</div>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-2">RENCANA KERJA BULAN INI</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 min-h-[80px] italic">Memuat rencana tindak lanjut dari database...</div>
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
