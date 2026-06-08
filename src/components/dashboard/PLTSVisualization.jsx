import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import useAppStore from '../../store/useAppStore';
import { MAP_LOCATIONS } from '../../data/mockData';
import { MapPin, Building, Zap, Users } from '../Icons';

export default function PLTSVisualization() {
  const pltsLocations = useAppStore((state) => state.pltsLocations);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
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
  }, [pltsLocations]);

  const locs = pltsLocations && pltsLocations.length > 0 ? pltsLocations : MAP_LOCATIONS.map(m => ({ location_name: m.nama, capacity_kwp: m.kwp, area_ha: m.luas, farmers: m.petani }));

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
    <section className="bg-white rounded-md shadow-sm border border-gray-200 p-5 md:p-6">
      <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-5 flex items-center gap-2">
        <MapPin size={18} className="text-[#1e3a8a]" />
        SEBARAN LOKASI PROGRAM
      </h2>
      <div className="flex flex-col lg:flex-row gap-6">
        
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
        <div className="lg:w-[48%] h-[420px] w-full border border-gray-300 rounded overflow-hidden" ref={mapRef}></div>
        
        {/* STATISTIK (KANAN) */}
        <div className="lg:w-[24%] flex flex-col gap-4 justify-center">
          <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Building size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">EXISTING</p>
              <p className="text-xl font-extrabold text-[#25326a]">{locs.length} <span className="text-sm font-semibold text-gray-600">Unit</span></p>
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><MapPin size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL LUAS LAHAN</p>
              <p className="text-xl font-extrabold text-[#25326a]">{totalLuas} <span className="text-sm font-semibold text-gray-600">Ha</span></p>
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Zap size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TOTAL KAPASITAS</p>
              <p className="text-xl font-extrabold text-[#25326a]">{totalKapasitas} <span className="text-sm font-semibold text-gray-600">kWp</span></p>
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded border border-blue-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="bg-white p-2.5 rounded text-[#1e3a8a] shadow-sm"><Users size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PENERIMA MANFAAT</p>
              <p className="text-xl font-extrabold text-[#25326a]">{totalPetani} <span className="text-sm font-semibold text-gray-600">Petani</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
