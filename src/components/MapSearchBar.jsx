import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as L from 'leaflet';
import { Search, X, MapPin, Compass, ChevronRight, BarChart2, Globe, Loader2, ExternalLink } from 'lucide-react';

const SEKTOR_COLORS = {
  'Perkebunan': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Peternakan': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Perikanan': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Industri': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Infrastruktur': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Default': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
};

function getSektorStyle(sektorName) {
  if (!sektorName) return SEKTOR_COLORS.Default;
  const s = sektorName.toLowerCase();
  if (s.includes('kebun') || s.includes('tani')) return SEKTOR_COLORS.Perkebunan;
  if (s.includes('ternak')) return SEKTOR_COLORS.Peternakan;
  if (s.includes('ikan') || s.includes('ras') || s.includes('air')) return SEKTOR_COLORS.Perikanan;
  if (s.includes('industri') || s.includes('maggot') || s.includes('olah')) return SEKTOR_COLORS.Industri;
  if (s.includes('infra') || s.includes('plts') || s.includes('irigasi')) return SEKTOR_COLORS.Infrastruktur;
  return SEKTOR_COLORS[sektorName] || SEKTOR_COLORS.Default;
}

export default function MapSearchBar({
  mapInstance,
  markersList = [],
  initialBounds,
  onNavigateToProgram,
  isFullScreen = false
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'program' | 'geo'
  const [geoResults, setGeoResults] = useState([]);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const universalPinRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter program / local locations based on query
  const programResults = useMemo(() => {
    if (!markersList || markersList.length === 0) return [];
    const q = query.trim().toLowerCase();
    if (!q) return markersList.slice(0, 8); // Tampilkan beberapa awal jika kosong

    return markersList.filter((item) => {
      const prog = (item.programName || '').toLowerCase();
      const desa = (item.desaName || '').toLowerCase();
      const kec = (item.kecamatan || '').toLowerCase();
      const kab = (item.kabupaten || '').toLowerCase();
      const sek = (item.sektor || '').toLowerCase();
      return prog.includes(q) || desa.includes(q) || kec.includes(q) || kab.includes(q) || sek.includes(q);
    });
  }, [markersList, query]);

  // Debounced Universal Geocoding search (seperti Google Maps / OSM)
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setGeoResults([]);
      setIsGeoLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGeoLoading(true);

    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&addressdetails=1&limit=5&countrycodes=id`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setGeoResults(data || []);
        } else {
          setGeoResults([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setGeoResults([]);
        }
      } finally {
        setIsGeoLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Remove universal pin from map if exists
  const removeUniversalPin = () => {
    if (universalPinRef.current && mapInstance) {
      mapInstance.removeLayer(universalPinRef.current);
      universalPinRef.current = null;
    }
  };

  // Handle click on Program / Ring 1 marker
  const handleSelectProgram = (item) => {
    removeUniversalPin();
    setSelectedItem(item);
    setQuery(item.programName || item.desaName || '');
    setIsOpen(false);

    if (mapInstance && item.lat && item.lng) {
      mapInstance.flyTo([item.lat, item.lng], 16, {
        animate: true,
        duration: 1.2
      });

      markersList.forEach((m) => {
        if (m.marker) {
          if (m.id === item.id) {
            m.marker.setOpacity(1.0);
            setTimeout(() => {
              m.marker.openPopup();
            }, 600);
          } else {
            m.marker.setOpacity(0.35);
          }
        }
      });
    }
  };

  // Handle click on Universal Geocoded Location
  const handleSelectGeoLocation = (geo) => {
    const lat = parseFloat(geo.lat);
    const lon = parseFloat(geo.lon);
    if (isNaN(lat) || isNaN(lon) || !mapInstance) return;

    removeUniversalPin();

    setSelectedItem({ id: `geo-${geo.place_id}`, name: geo.display_name, lat, lon });
    setQuery(geo.name || geo.display_name.split(',')[0] || query);
    setIsOpen(false);

    // Dim all program markers so the universal point stands out
    markersList.forEach((m) => {
      if (m.marker) m.marker.setOpacity(0.3);
    });

    // Fly to coordinates
    mapInstance.flyTo([lat, lon], 15, {
      animate: true,
      duration: 1.2
    });

    // Create distinctive Google Maps-style red pin
    const pinHtml = `
      <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); cursor: pointer;">
        <div style="background-color: #ef4444; color: white; padding: 6px; border-radius: 9999px; border: 2.5px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #ef4444; margin-top: -2px;"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-universal-geo-pin',
      html: pinHtml,
      iconSize: [32, 44],
      iconAnchor: [16, 44]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstance);
    universalPinRef.current = marker;

    const gMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    const cleanTitle = geo.name || geo.display_name.split(',')[0];

    marker.bindPopup(`
      <div class="text-xs p-1.5 min-w-[210px] max-w-[280px]">
        <div class="font-bold text-red-600 border-b border-gray-100 pb-1 mb-1.5 flex items-center gap-1.5 text-sm">
          <span>📍 ${cleanTitle}</span>
        </div>
        <p class="text-gray-600 text-[11px] leading-snug mb-2 font-medium">${geo.display_name}</p>
        <div class="text-[9.5px] text-gray-400 font-mono mb-2">
          Lat: ${lat.toFixed(5)}, Long: ${lon.toFixed(5)}
        </div>
        <div class="pt-1.5 border-t border-gray-100">
          <a href="${gMapsUrl}" target="_blank" rel="noopener noreferrer" 
             class="flex items-center justify-center gap-1.5 w-full bg-[#1e3a8a] hover:bg-blue-800 text-white px-3 py-1.5 rounded text-[11px] font-bold transition-colors no-underline shadow-xs">
            🗺 Buka di Google Maps ↗
          </a>
        </div>
      </div>
    `).openPopup();
  };

  // Reset view to default program bounds
  const handleResetView = () => {
    setQuery('');
    setSelectedItem(null);
    setIsOpen(false);
    removeUniversalPin();

    if (mapInstance) {
      markersList.forEach((m) => {
        if (m.marker) m.marker.setOpacity(1.0);
      });

      if (initialBounds && initialBounds.isValid()) {
        mapInstance.fitBounds(initialBounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setSelectedItem(null);
    setGeoResults([]);
    inputRef.current?.focus();
    removeUniversalPin();
    
    if (mapInstance) {
      markersList.forEach((m) => {
        if (m.marker) m.marker.setOpacity(1.0);
      });
    }
  };

  const totalResultsCount = programResults.length + geoResults.length;

  return (
    <div ref={containerRef} className="relative w-full md:w-80 lg:w-96 text-left">
      {/* Search Input Bar */}
      <div className={`relative flex items-center bg-white rounded-xl border transition-all duration-200 shadow-sm ${
        isOpen ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <div className="pl-3 text-slate-400">
          {isGeoLoading ? (
            <Loader2 size={16} className="text-[#1e3a8a] animate-spin" />
          ) : (
            <Search size={16} className={isOpen ? 'text-[#1e3a8a]' : 'text-slate-400'} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari program atau lokasi (ala Google Maps)..."
          className="w-full py-2 pl-2.5 pr-16 text-xs text-slate-800 placeholder-slate-400 font-medium bg-transparent focus:outline-hidden"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 text-slate-500 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
            title="Reset tampilan peta (Tampilkan Semua)"
          >
            <Compass size={15} />
          </button>
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header Tabs: Semua | Program PTBA | Lokasi Publik */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/90">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 px-1">
              <span>Hasil Pencarian ({totalResultsCount})</span>
              {selectedItem && (
                <button 
                  onClick={handleResetView}
                  className="text-blue-600 hover:underline cursor-pointer lowercase"
                >
                  tampilkan semua
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({totalResultsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('program')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  activeTab === 'program'
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                📍 Program ({programResults.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('geo')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'geo'
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Globe size={10} />
                <span>Lokasi Publik ({geoResults.length})</span>
                {isGeoLoading && <Loader2 size={9} className="animate-spin ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 minimal-scrollbar">
            {/* ── KATEGORI 1: PROGRAM BINAAN PTBA ── */}
            {(activeTab === 'all' || activeTab === 'program') && programResults.length > 0 && (
              <div>
                <div className="px-3 py-1 bg-slate-100/70 text-[9.5px] font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={11} className="text-[#1e3a8a]" />
                  <span>Program Binaan SCD PTBA ({programResults.length})</span>
                </div>
                {programResults.map((item, idx) => {
                  const sekStyle = getSektorStyle(item.sektor);
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectProgram(item)}
                      className={`p-2.5 hover:bg-blue-50/70 transition-colors cursor-pointer flex items-start gap-2.5 group ${
                        isSelected ? 'bg-blue-50/90 border-l-3 border-l-[#1e3a8a]' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-[#1e3a8a] group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors shrink-0">
                        <MapPin size={13} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#1e3a8a] truncate">
                            {item.programName}
                          </span>
                          {item.sektor && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${sekStyle.bg} ${sekStyle.text} ${sekStyle.border}`}>
                              {item.sektor}
                            </span>
                          )}
                        </div>

                        <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                          {item.desaName ? `Desa ${item.desaName}, ` : ''}{item.kecamatan ? `Kec. ${item.kecamatan}` : ''}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[9.5px]">
                          <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                            <span>Fokus ke Titik</span> <ChevronRight size={10} />
                          </span>

                          {item.targetProg && onNavigateToProgram && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToProgram(item.targetProg);
                              }}
                              className="inline-flex items-center gap-0.5 text-[#1e3a8a] font-bold hover:underline bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs"
                            >
                              <BarChart2 size={10} />
                              <span>Dashboard</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── KATEGORI 2: LOKASI GEOGRAFIS UNIVERSAL (GOOGLE MAPS / OSM) ── */}
            {(activeTab === 'all' || activeTab === 'geo') && geoResults.length > 0 && (
              <div>
                <div className="px-3 py-1 bg-red-50 text-[9.5px] font-extrabold text-red-700 uppercase tracking-wider flex items-center gap-1">
                  <Globe size={11} className="text-red-600" />
                  <span>Lokasi Geografis Umum ({geoResults.length})</span>
                </div>
                {geoResults.map((geo, idx) => {
                  const placeName = geo.name || geo.display_name.split(',')[0];
                  const address = geo.display_name.replace(placeName + ',', '').trim();

                  return (
                    <div
                      key={geo.place_id || idx}
                      onClick={() => handleSelectGeoLocation(geo)}
                      className="p-2.5 hover:bg-red-50/60 transition-colors cursor-pointer flex items-start gap-2.5 group"
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                        <MapPin size={13} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-red-700 truncate">
                            {placeName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-slate-100 text-slate-600">
                            Peta Publik
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                          {address || geo.display_name}
                        </p>

                        <div className="flex items-center gap-1 mt-1 text-[9.5px] text-red-600 font-semibold group-hover:underline">
                          <span>Arahkan Peta ke Sini</span> <ChevronRight size={10} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading state indicator */}
            {isGeoLoading && (
              <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#1e3a8a]" />
                <span>Mencari lokasi di peta publik...</span>
              </div>
            )}

            {/* Empty state */}
            {totalResultsCount === 0 && !isGeoLoading && (
              <div className="p-5 text-center">
                <MapPin size={24} className="mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-bold text-slate-600">Lokasi tidak ditemukan</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Ketik nama desa, kecamatan, landmark, atau kota (contoh: Muara Enim, Tanjung Enim, Palembang)
                </p>
              </div>
            )}
          </div>

          {/* Quick link ke Google Maps jika query ada */}
          {query.trim().length > 1 && (
            <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium">Buka pencarian eksternal:</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1e3a8a] font-bold hover:underline"
              >
                <span>Cari di Google Maps</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
