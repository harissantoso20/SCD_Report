import React, { useEffect, useRef, useState } from 'react';
import useAppStore from '../store/useAppStore';
import * as L from 'leaflet';
import { MapPin, Lightbulb, TrendingUp, Presentation, AlertCircle, FileText, CheckCircle, ChevronDown } from './Icons';
import { Maximize, Minimize } from 'lucide-react';
import logoSDGs from '../assets/logo-sdgs.png';
import { exportDashboardPresentation } from '../services/exportPresentation';
import { generateGoogleSlide, fetchPresentations } from '../services/googleSlidesService';
import { generateText } from '../lib/geminiClient';
import ReactMarkdown from 'react-markdown';

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function HomeView() {
  const { homeData, isHomeLoading, isReportLoading, fetchHomeData, error, globalDate, setGlobalDate } = useAppStore();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [aiReportStatement, setAiReportStatement] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingSlide, setIsGeneratingSlide] = useState(false);
  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    fetchHomeData();
    fetchPresentations().then(setPresentations).catch(console.error);
  }, [fetchHomeData]);

  // --- Leaflet Map Cleanup ---
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // --- Leaflet Map Initialization ---
  useEffect(() => {
    if (!homeData || !mapRef.current) return;
    
    // Only initialize the map once
    if (mapInstance.current) return;

    // Default view: Tanjung Enim / Muara Enim area
    const map = L.map(mapRef.current, {
      zoomControl: false // Disable default to move it later
    }).setView([-3.755, 103.787], 11);
    
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    
    mapInstance.current = map;
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps Satellite',
      maxZoom: 20
    }).addTo(map);

    const bounds = L.latLngBounds([]);
    let hasValidCoords = false;

    homeData.mapData.forEach((loc) => {
      const lat = parseFloat(loc.Latitude);
      const lng = parseFloat(loc.Longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        hasValidCoords = true;
        bounds.extend([lat, lng]);
        
        L.marker([lat, lng]).addTo(map)
          .bindPopup(`
            <div class="text-xs p-1">
              <b class="text-[#1e3a8a] text-sm">${loc['Program PPM'] || loc.Program || '-'}</b><br/>
              <span class="text-gray-500 font-medium">${loc['Desa/Kelurahan'] || loc.Desa}, ${loc.Kecamatan}, ${loc.Kabupaten}</span><br/>
              <div class="mt-1 inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                Sektor: ${loc.Sektor || '-'}
              </div>
            </div>
          `);
      }
    });

    if (hasValidCoords) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [homeData]);

  // Handle map resize when toggling full screen
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);
    }
  }, [isFullScreen]);

  // Period management
  const currentMonthStr = globalDate ? globalDate.split('-')[1] : "01";
  const currentYearStr = globalDate ? globalDate.split('-')[0] : "2026";
  const monthName = INDO_MONTHS[parseInt(currentMonthStr, 10) - 1];
  
  const handleMonthChange = (e) => {
    setGlobalDate(`${currentYearStr}-${e.target.value}-01`);
  };

  const handleYearChange = (e) => {
    setGlobalDate(`${e.target.value}-${currentMonthStr}-01`);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAiReport = async () => {
      if (!homeData) return;
      
      setIsAiLoading(true);
      const prompt = `
Kamu adalah Senior Data Analyst korporat. Tugasmu adalah membuat "Executive Summary" untuk seluruh ekosistem program pemberdayaan (SCD) pada periode ${monthName} ${currentYearStr}.

Berikut adalah data agregat seluruh program (format JSON):
${JSON.stringify({
  totalProgram: homeData.totalProgram,
  totalLokasi: homeData.totalLokasi,
  sektorCount: homeData.sektorCount,
  sektorPrograms: homeData.sektorPrograms,
  salesDataSummary: homeData.salesData?.map(s => ({ Program: s.Program, Omzet: s.Omzet, Keterangan: s.Keterangan })),
  progressSummary: homeData.monthlyProgress?.map(p => ({ Program: p.Program, Target: p.Target, Realisasi: p.Realisasi }))
}, null, 2)}

Instruksi:
1. Buat laporan yang sangat objektif dan to the point seperti papan informasi (dashboard) korporat. Hindari gaya bercerita atau sapaan ("Tim yang hebat", dll).
2. FORMATTING PENTING: Beri 1 baris kosong (enter/spasi ganda) sebelum menuliskan nomor urut baru (misal sebelum "1.", "2.", dst) agar teks tidak terkesan menumpuk.
3. Pada bagian "Distribusi Sektor Program", JABARKAN nama-nama program apa saja yang masuk di masing-masing sektor berdasarkan data.
4. Pada bagian "Pencapaian Finansial", TOTALKAN seluruh omzet dari semua program. HANYA sebutkan 1 program penyumbang omzet tertinggi dan 1 program penyumbang omzet terendah. TIDAK PERLU menjabarkan omzet program-program lainnya agar ringkas.
5. Pada laporan "Progres Program", berikan SUMMARY/KESIMPULAN UMUM dari keseluruhan realisasi dan rencana tindak lanjut. JANGAN menyebutkan progres setiap program satu per satu.
6. Gunakan bahasa Indonesia profesional dan baku layaknya penyajian data statistik. Format menggunakan Markdown (gunakan bold untuk angka penting).
`;

      try {
        const response = await generateText(prompt);
        if (isMounted) setAiReportStatement(response);
      } catch (err) {
        console.error("Gemini Error:", err);
        if (isMounted) setAiReportStatement(`Gagal menghasilkan laporan AI. Error: ${err.message}`);
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    };

    fetchAiReport();
    return () => { isMounted = false; };
  }, [homeData, monthName, currentYearStr]);

  if (isHomeLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Memuat Executive Summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-md border border-red-200 flex items-start gap-4">
        <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-red-800 font-bold">Gagal Memuat Data</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!homeData) return null;

  const currentPeriodStr = `${monthName} ${currentYearStr}`;
  const filteredPresentations = presentations.filter(p => p.period === currentPeriodStr);

  const sectorIcons = {
    'Perkebunan': <span className="text-green-600">🌱</span>,
    'Peternakan': <span className="text-orange-600">🐄</span>,
    'Industri': <span className="text-gray-600">🏭</span>,
    'Perikanan': <span className="text-blue-500">🐟</span>,
    'Infrastruktur': <span className="text-purple-600">🏗️</span>
  };

  return (
    <div className="flex flex-col gap-6 -mt-4 md:-mt-6 lg:-mx-auto -mx-4 md:-mx-6 lg:max-w-none">
      
      {/* MAP WRAPPER (FULL BLEED / FULL SCREEN CONDITIONAL) */}
      <div className={isFullScreen ? "fixed inset-0 z-[9999] bg-slate-900 p-4 md:p-8 flex flex-col" : "relative w-full h-[500px] md:h-[650px] bg-slate-200 overflow-hidden shadow-sm border-b border-gray-300"}>
        
        {isFullScreen && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin size={24} className="text-white" />
              SEBARAN LOKASI RING 1 (FULL SCREEN)
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
          <div className="absolute top-2 right-2 z-[500]">
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
          
          <div ref={mapRef} className="w-full h-full z-0"></div>
          
          {/* MAP TITLE OVERLAY (Top Left) */}
          {!isFullScreen && (
            <div className="absolute top-0 left-0 right-0 z-[400] pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-sm border-b-4 border-[#1e3a8a] w-full pointer-events-auto">
                <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Sebaran Lokasi Ring 1</h1>
                <h2 className="text-lg font-bold text-gray-500">Tanjung Enim Minning Site PT Bukit Asam (Persero) Tbk</h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 -mt-16 relative z-10 px-4 md:px-6 lg:max-w-7xl lg:mx-auto w-full">
        
        {/* Card 1 */}
        <div className="bg-white rounded-md shadow-lg border border-gray-100 p-5 flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="bg-blue-50 p-3 rounded-full text-blue-700 mt-1">
            <MapPin size={28} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Jumlah Lokasi Ring 1</p>
            <div className="mt-1">
              <span className="text-3xl font-extrabold text-[#1e3a8a]">{homeData.totalLokasi.desa}</span>
              <span className="text-sm text-gray-500 ml-2 font-medium">Desa/Kelurahan</span>
            </div>
            <div className="flex flex-col gap-0.5 mt-2 text-sm font-semibold text-[#25326a]">
              <span>{homeData.totalLokasi.kec} Kecamatan</span>
              <span>{homeData.totalLokasi.kab} Kabupaten</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-md shadow-lg border border-gray-100 p-5 flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="bg-yellow-50 p-3 rounded-full text-yellow-600 mt-1">
            <Lightbulb size={28} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Jumlah Program</p>
            <div className="mt-1">
              <span className="text-3xl font-extrabold text-[#1e3a8a]">{homeData.totalProgram.program}</span>
              <span className="text-sm text-gray-500 ml-2 font-medium">Program</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-[#25326a]">
              <span>{homeData.totalProgram.desa} Desa/Kelurahan</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-md shadow-lg border border-gray-100 p-5 hover:-translate-y-1 transition-transform">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Jumlah Program Per Sektor</p>
          <div className="flex flex-col gap-2">
            {Object.entries(homeData.sektorCount).map(([sektor, count]) => (
              <div key={sektor} className="flex items-center gap-2">
                <span className="text-lg w-6 text-center">{sectorIcons[sektor] || '📦'}</span>
                <span className="font-bold text-lg text-[#1e3a8a] w-6">{count}</span>
                <span className="text-sm font-medium text-gray-700">{sektor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-md shadow-lg border border-gray-100 p-5 hover:-translate-y-1 transition-transform">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Program di Luar Ring 1</p>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xl">☀️</span>
            <span className="font-bold text-xl text-[#1e3a8a]">{homeData.luarRing1Programs.length}</span>
            <span className="text-sm font-medium text-gray-700 leading-tight">Infrastruktur</span>
          </div>
          <div className="flex flex-col gap-1.5 pl-9 relative">
            <div className="absolute left-3.5 top-0 bottom-2 w-px bg-gray-200"></div>
            {homeData.luarRing1Programs.slice(0,3).map((prog, i) => (
              <div key={i} className="text-xs text-gray-500 relative">
                <div className="absolute -left-5.5 top-1.5 w-4 h-px bg-gray-200"></div>
                {prog}
              </div>
            ))}
            {homeData.luarRing1Programs.length > 3 && (
               <div className="text-xs text-gray-400 italic relative">
                 <div className="absolute -left-5.5 top-1.5 w-4 h-px bg-gray-200"></div>
                 + {homeData.luarRing1Programs.length - 3} lokasi lainnya
               </div>
            )}
          </div>
        </div>

      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 px-4 md:px-6 lg:max-w-7xl lg:mx-auto w-full mb-8">
        
        {/* Left Column: Report Statement */}
        <div className="lg:col-span-7 relative min-h-[500px] lg:min-h-0">
          <div className="absolute inset-0 bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 flex-shrink-0">
              <h3 className="text-[15px] font-bold text-[#25326a]">Report Statement</h3>
              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <div className="relative">
                  <select 
                    className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[13px] rounded pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                    value={currentMonthStr}
                    onChange={handleMonthChange}
                  >
                    {INDO_MONTHS.map((m, i) => {
                      const val = (i + 1).toString().padStart(2, '0');
                      return <option key={val} value={val}>{m.substring(0, 3)}</option>;
                    })}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={14} strokeWidth={2.5} />
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <select 
                    className="appearance-none bg-[#2c3e80] border border-transparent text-white font-bold text-[13px] rounded pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                    value={currentYearStr}
                    onChange={handleYearChange}
                  >
                    {[2023, 2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>
            
            <div className="relative flex-1 flex flex-col min-h-0">
              {/* Loading Overlay for Report Statement */}
              {(isReportLoading || isAiLoading) && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-md">
                  <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-[#1e3a8a] font-bold text-xs animate-pulse">
                    {isAiLoading ? "AI sedang menyusun laporan analitik..." : "Memuat Ulang Laporan..."}
                  </p>
                </div>
              )}
              
              <div className="text-[13px] text-gray-700 leading-relaxed overflow-y-auto minimal-scrollbar flex-1 flex flex-col gap-3">
                <div className="markdown-content">
                  <ReactMarkdown>{aiReportStatement}</ReactMarkdown>
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                try {
                  setIsGeneratingSlide(true);
                  const result = await generateGoogleSlide(globalDate, aiReportStatement);
                  if (result && result.record) {
                    setPresentations(prev => [result.record, ...prev]);
                    window.open(result.url, '_blank');
                  }
                } catch (error) {
                  console.error("Error generating presentation:", error);
                  alert("Gagal men-generate presentasi: " + error.message);
                } finally {
                  setIsGeneratingSlide(false);
                }
              }}
              disabled={isGeneratingSlide}
              className={`mt-6 flex-shrink-0 w-full py-2.5 text-white text-sm font-bold rounded shadow-sm transition-colors flex justify-center items-center gap-2 ${isGeneratingSlide ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-[#152a6b]'}`}
            >
              {isGeneratingSlide ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Presentation size={16} />
              )}
              {isGeneratingSlide ? "Sedang Membuat Slide..." : "Buat Presentasi"}
            </button>
            
            {/* PANEL PRESENTASI */}
            {filteredPresentations.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-[12px] font-bold text-[#25326a] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-[#1e3a8a]" /> Link Presentasi Tersimpan ({currentPeriodStr})
                </h4>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto minimal-scrollbar pr-2">
                  {filteredPresentations.map((p) => (
                    <a 
                      key={p.id} 
                      href={p.slide_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[12px] flex items-center gap-3 p-2.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded text-[#1e3a8a] transition-all hover:shadow-sm"
                    >
                      <div className="bg-white p-1.5 rounded shadow-sm">
                        <Presentation size={14} className="text-blue-600" />
                      </div>
                      <span className="font-semibold truncate flex-1">Presentasi SCD - {p.period}</span>
                      <span className="text-[10px] text-gray-500 font-medium bg-white px-2 py-0.5 rounded border border-gray-100">
                        {new Date(p.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Program Berjalan */}
        <div className="lg:col-span-5 bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col">
          <h3 className="text-[14px] font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200 pb-3 mb-6 flex-shrink-0">
            PROGRAM BERJALAN DI LOKASI RING 1 TEMS
          </h3>
          
          <div className="flex flex-col gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(homeData.groupedByLocation).map(([region, desaObj], idx) => (
              <div key={idx} className="border border-gray-100 rounded-md p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <h4 className="font-bold text-[#1e3a8a] border-b border-gray-200 pb-2 mb-3">{region}</h4>
                
                <div className="flex flex-col gap-3">
                  {Object.entries(desaObj).map(([desa, programs], vIdx) => (
                    <div key={vIdx} className="pl-2 border-l-2 border-[#1e3a8a]/30">
                      <p className="text-sm font-bold text-blue-600 mb-1">{desa}</p>
                      <ul className="flex flex-col gap-1">
                        {programs.map((prog, pIdx) => (
                          <li key={pIdx} className="text-[13px] text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span> 
                            <span>{prog}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SDGs Footer */}
      <div className="px-4 md:px-6 lg:max-w-7xl lg:mx-auto w-full mb-12">
        <div className="flex justify-center items-center overflow-hidden">
          <img src={logoSDGs} alt="SDGs Goals" className="w-full h-auto object-contain mix-blend-multiply opacity-90 hover:opacity-100 transition-opacity cursor-pointer" title="Sustainable Development Goals" />
        </div>
      </div>
    </div>
  );
}
