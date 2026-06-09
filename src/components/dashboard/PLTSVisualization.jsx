import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { Maximize, Minimize } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { MapPin, Building, Zap, Users } from '../Icons';

const PLTSVisualization = React.memo(function PLTSVisualization() {
  const pltsLocations = useAppStore((state) => state.pltsLocations);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
      mapRef.current.innerHTML = '';
    }

    const map = L.map(mapRef.current).setView([-3.5, 103.5], 6);
    mapInstance.current = map;
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps Satellite',
      maxZoom: 20
    }).addTo(map);

    const baseLat = -3.5;
    const baseLng = 103.5;

    const locs = pltsLocations || [];
    const bounds = L.latLngBounds([]);

    const COORDINATE_MAP = {
      "Talawi Mudik": { "lat": -0.5829123, "lng": 100.7159371 },
      "Trimulyo": { "lat": -5.171838, "lng": 105.115826 },
      "Tanjung Raja": { "lat": -3.7161975, "lng": 103.8004536 },
      "Nanjungan": { "lat": -3.6331314, "lng": 103.7262035 },
      "Rejosari Mataram": { "lat": -4.8466185, "lng": 105.3391385 },
      "Karang Raja": { "lat": -3.6816109, "lng": 103.8003334 },
      "Muara Lawai": { "lat": -3.650469, "lng": 103.7457736 },
      "Tanjung Agung": { "lat": -3.9438075, "lng": 103.7948504 },
      "Lugusari": { "lat": -5.3533811, "lng": 104.8699914 },
      "Tanjung Karangan": { "lat": -3.8947347, "lng": 103.7188515 },
      "Matas": { "lat": -3.954861, "lng": 103.845661 },
      "Muara Gula": { "lat": -3.5792181, "lng": 103.8098195 }
    };

    locs.forEach((loc, idx) => {
      // Use real coordinate if available, otherwise fallback
      const coords = COORDINATE_MAP[loc.location_name];
      const markerLat = coords ? coords.lat : (loc.lat != null ? loc.lat : (baseLat + (idx * 0.1)));
      const markerLng = coords ? coords.lng : (loc.lng != null ? loc.lng : (baseLng + (idx * 0.1)));
      
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

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [pltsLocations]);

  // Handle map resize when toggling full screen
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);
    }
  }, [isFullScreen]);

  const locs = pltsLocations || [];

  const groupedLocations = locs.reduce((acc, loc) => {
    let regionName = "Lainnya";
    if (loc.kabupaten && loc.provinsi) {
      const prefix = loc.kabupaten.toLowerCase().includes('kota') ? '' : 'Kab. ';
      regionName = `${prefix}${loc.kabupaten}, ${loc.provinsi}`;
    }
    if (!acc[regionName]) acc[regionName] = [];
    acc[regionName].push(loc);
    return acc;
  }, {});

  const totalLuas = locs.reduce((sum, item) => sum + (parseFloat(item.area_ha) || 0), 0);
  const totalKapasitas = locs.reduce((sum, item) => sum + (parseFloat(item.capacity_kwp) || 0), 0);
  const totalPetani = locs.reduce((sum, item) => sum + (parseInt(item.farmers) || 0), 0);

  return (
    <section className="bg-white rounded-md shadow-sm border border-gray-200 p-4 md:p-5">
      <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
        <MapPin size={18} className="text-[#1e3a8a]" />
        SEBARAN LOKASI PROGRAM
      </h2>
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* DAFTAR LOKASI (KIRI) */}
        <div className="lg:w-[28%] h-[420px] overflow-y-auto minimal-scrollbar pr-2 flex flex-col gap-4">
          {Object.entries(groupedLocations).map(([region, villages]) => (
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
          ))}
        </div>

        {/* PETA (TENGAH) */}
        <div className={isFullScreen ? "fixed inset-0 z-[9999] bg-slate-900 p-4 md:p-8 flex flex-col" : "lg:w-[48%] h-[420px] w-full border border-gray-300 rounded overflow-hidden relative"}>
          
          {isFullScreen && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin size={24} className="text-white" />
                SEBARAN LOKASI PLTS (FULL SCREEN)
              </h2>
              <button 
                onClick={() => setIsFullScreen(false)}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Minimize size={18} /> Tutup
              </button>
            </div>
          )}

          <div className="relative w-full h-full rounded overflow-hidden shadow-sm" style={{ flex: isFullScreen ? 1 : 'unset' }}>
            <div className="absolute top-2 right-2 z-[400]">
              {!isFullScreen && (
                <button 
                  onClick={() => setIsFullScreen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded shadow-md border border-slate-200 transition-colors"
                  title="Lihat Peta Penuh"
                >
                  <Maximize size={18} />
                </button>
              )}
            </div>
            <div className="w-full h-full bg-slate-100" ref={mapRef}></div>
          </div>
        </div>
        
        {/* STATISTIK (KANAN) */}
        <div className="lg:w-[24%] flex flex-col gap-4 justify-center">
          <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm relative z-10"><Building size={24} className="animate-[pulse_2s_ease-in-out_infinite]" /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">EXISTING</p>
              <p className="text-xl font-extrabold text-[#25326a]">{locs.length} <span className="text-sm font-semibold text-gray-600">Unit</span></p>
            </div>
            {/* Doodle Art */}
            <div className="absolute -bottom-4 -right-2 text-blue-200/40 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="40" width="60" height="60" rx="5" opacity="0.5" />
                <rect x="40" y="20" width="40" height="80" rx="5" opacity="0.8" />
              </svg>
            </div>
          </div>
          <div className="bg-sky-50/50 p-4 rounded border border-sky-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="bg-white p-2.5 rounded text-sky-700 shadow-sm relative z-10"><MapPin size={24} className="animate-[bounce_3s_ease-in-out_infinite]" /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL LUAS LAHAN</p>
              <p className="text-xl font-extrabold text-[#25326a]">{totalLuas} <span className="text-sm font-semibold text-gray-600">Ha</span></p>
            </div>
            {/* Doodle Art */}
            <div className="absolute -bottom-2 -right-4 text-sky-200/50 group-hover:translate-x-2 transition-transform duration-500 pointer-events-none">
              <svg width="80" height="60" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 40 L40 10 L70 40 L100 10" />
              </svg>
            </div>
          </div>
          <div className="bg-indigo-50/50 p-4 rounded border border-indigo-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="bg-white p-2.5 rounded text-indigo-700 shadow-sm relative z-10"><Zap size={24} className="animate-[pulse_3s_ease-in-out_infinite]" /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL KAPASITAS</p>
              <p className="text-xl font-extrabold text-[#25326a]">{totalKapasitas} <span className="text-sm font-semibold text-gray-600">kWp</span></p>
            </div>
            {/* Doodle Art */}
            <div className="absolute -bottom-4 -right-4 text-indigo-200/50 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
              <svg width="70" height="70" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,10 90,90 10,90" opacity="0.6" />
              </svg>
            </div>
          </div>
          <div className="bg-purple-50/50 p-4 rounded border border-purple-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="bg-white p-2.5 rounded text-purple-700 shadow-sm relative z-10"><Users size={24} className="animate-[bounce_4s_ease-in-out_infinite]" /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PENERIMA MANFAAT</p>
              <p className="text-xl font-extrabold text-[#25326a]">{totalPetani} <span className="text-sm font-semibold text-gray-600">Petani</span></p>
            </div>
            {/* Doodle Art */}
            <div className="absolute -bottom-2 -right-2 text-purple-200/50 group-hover:-rotate-6 transition-transform duration-500 pointer-events-none">
              <svg width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="70" r="20" />
                <circle cx="70" cy="40" r="15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PLTSVisualization;
