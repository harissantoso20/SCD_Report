import React, { useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import * as L from 'leaflet';
import { MapPin, Lightbulb, TrendingUp, Presentation, AlertCircle, FileText, CheckCircle, ChevronDown } from './Icons';
import logoSDGs from '../assets/logo-sdgs.png';

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function HomeView() {
  const { homeData, isHomeLoading, isReportLoading, fetchHomeData, error, globalDate, setGlobalDate } = useAppStore();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    fetchHomeData();
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
      zoomControl: false // Disable default to move it later if needed or hide it
    }).setView([-3.755, 103.787], 11);
    
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

  // Generate dynamic report statement like a Data Analyst
  const generateReportStatement = () => {
    const { monthlyProgress, salesData, totalProgram, totalLokasi, sektorCount } = homeData;
    const paragraphs = [];
    
    // Seed for deterministic variations based on month
    const mIdx = parseInt(currentMonthStr, 10) - 1; // 0 to 11
    
    // Vocabulary variations
    const v = {
      title: ["Analisis Eksekutif Periode", "Tinjauan Kinerja Bulan", "Ringkasan Performa", "Laporan Eksekutif"],
      intro: ["Berdasarkan tinjauan portofolio", "Hasil evaluasi ekosistem", "Analisis komprehensif terhadap inisiatif", "Pantauan strategis portofolio"],
      active: ["terdapat", "tercatat sejumlah", "beroperasi sebanyak", "kita memiliki"],
      coverage: ["Dari total target", "Mengacu pada *blueprint*", "Berdasarkan peta jalan", "Sebagai perbandingan dari"],
      spatial: ["Data spasial menunjukkan adanya ketimpangan distribusi", "Pemetaan spasial mendeteksi ketidakmerataan implementasi", "Secara geografis, terpantau ada penumpukan intervensi", "Analisa geospasial mengindikasikan distribusi yang belum ekuivalen"],
      recommend: ["Rekomendasi strategis ke depan adalah", "Langkah korektif yang disarankan mencakup", "Ke depan, diperlukan", "Sebagai *way forward*, manajemen perlu"],
      qual_intro: ["Secara kualitatif, analisa terhadap", "Tinjauan aktivitas pada", "Evaluasi naratif dari", "Pembacaan *logbook* lapangan pada"],
      qual_mid: ["Meskipun setiap program memiliki karakteristik unik", "Terlepas dari variasi sektor yang ada", "Dengan berbagai dinamika di tingkat *grassroots*", "Walaupun skala setiap proyek berbeda"],
      qual_end: ["keseluruhan inisiatif terpantau bergerak dalam <em class=\"text-[#25326a]\">trajectory</em> positif", "mayoritas program menunjukkan akselerasi yang sesuai target", "perkembangan di lapangan mencatatkan resiliensi operasional yang baik", "momentum implementasi terus terjaga dengan baik"],
      fin_intro: ["Dari perspektif finansial, agregasi", "Berdasarkan tinjauan ekonomi riil, akumulasi", "Secara kuantitatif, total", "Kalkulasi *revenue stream* dari"],
      fin_mid: ["Sirkulasi ekonomi riil yang tercipta ini merepresentasikan", "Capaian ini menjadi indikator kuat", "Metrik *bottom-line* ini menegaskan", "Perputaran nilai ekonomi ini mengonfirmasi"],
      concl: ["Tren performa bulan ini menunjukkan keselarasan dengan", "Secara keseluruhan, indikator bulan ini merefleksikan", "Konklusi dari rangkaian data ini membuktikan komitmen pada", "Dinamika operasional bulan ini memperkuat basis"]
    };
    
    const pick = (arr, offset = 0) => arr[(mIdx + offset) % arr.length];

    // --- 1. Distribution & Coverage Analysis ---
    const TARGET_LOKASI = 27;
    const activeDesa = totalProgram.desa;
    const untouchedDesa = TARGET_LOKASI - activeDesa;
    const coveragePercentage = ((activeDesa / TARGET_LOKASI) * 100).toFixed(1);
    
    // Find dominant sectors
    const sortedSectors = Object.entries(sektorCount).sort((a, b) => b[1] - a[1]);
    const topSector = sortedSectors.length > 0 ? sortedSectors[0][0] : '';
    const secondSector = sortedSectors.length > 1 ? sortedSectors[1][0] : '';
    
    paragraphs.push(
      `<strong class="text-[#1e3a8a] text-[14px]">${pick(v.title, 0)} ${monthName} ${currentYearStr}</strong>`
    );
    
    paragraphs.push(
      `${pick(v.intro, 1)} Sustainable Community Development (SCD), saat ini ${pick(v.active, 2)} <strong class="text-[#1e3a8a]">${totalProgram.program} program aktif</strong> yang beroperasi dan meng-<em class="text-[#25326a]">cover</em> wilayah Ring 1. ${pick(v.coverage, 3)} 27 titik lokasi Ring 1, program-program tersebut baru terealisasi di <strong class="text-[#1e3a8a]">${activeDesa} desa/kelurahan</strong> (tingkat penetrasi <strong class="text-[#1e3a8a]">${coveragePercentage}%</strong>), sementara <strong class="text-[#1e3a8a]">${untouchedDesa} desa/kelurahan lainnya belum tersentuh program</strong>. ${pick(v.spatial, 4)}; beberapa desa mengalami penumpukan intervensi dengan konsentrasi kuat pada sektor ${topSector.toLowerCase()}${secondSector ? ` dan ${secondSector.toLowerCase()}` : ''}. ${pick(v.recommend, 5)} melakukan pemetaan ulang (<em class="text-[#25326a]">re-mapping</em>) dan diversifikasi alokasi sumber daya untuk meminimalisasi <em class="text-[#25326a]">blank spot</em> guna memastikan pemerataan pemberdayaan masyarakat di seluruh wilayah Ring 1.`
    );

    // --- 2. Qualitative Progress Conclusion ---
    if (monthlyProgress && monthlyProgress.length > 0) {
      const validProgress = monthlyProgress.filter(p => p.Realisasi && p.Realisasi !== '-');
      
      if (validProgress.length > 0) {
        // Simple NLP Keyword Analysis to find operational themes
        let themes = { sdm: 0, infra: 0, produksi: 0, pasar: 0 };
        validProgress.forEach(p => {
          const text = p.Realisasi.toLowerCase();
          if (text.includes('pelatih') || text.includes('sosialisasi') || text.includes('edukasi') || text.includes('bina')) themes.sdm++;
          if (text.includes('bangun') || text.includes('instal') || text.includes('konstruk') || text.includes('pasang')) themes.infra++;
          if (text.includes('panen') || text.includes('produksi') || text.includes('bibit') || text.includes('tanam')) themes.produksi++;
          if (text.includes('jual') || text.includes('pasar') || text.includes('omzet') || text.includes('distribusi')) themes.pasar++;
        });

        const activeThemes = Object.entries(themes)
          .filter(t => t[1] > 0)
          .sort((a, b) => b[1] - a[1])
          .map(t => {
            if (t[0] === 'sdm') return 'peningkatan kapasitas SDM';
            if (t[0] === 'infra') return 'pembangunan infrastruktur pendukung';
            if (t[0] === 'produksi') return 'eskalasi fase produksi dan budidaya';
            if (t[0] === 'pasar') return 'penetrasi pasar dan komersialisasi';
            return '';
          });

        const themeText = activeThemes.length > 0 
          ? ` yang didominasi oleh sentra aktivitas ${activeThemes.slice(0, 2).join(' serta ')}` 
          : '';

        paragraphs.push(
          `${pick(v.qual_intro, 6)} ${validProgress.length} <em class="text-[#25326a]">logbook</em> lapangan menunjukkan eskalasi progres operasional yang solid${themeText}. ${pick(v.qual_mid, 7)}, ${pick(v.qual_end, 8)} menuju pencapaian <em class="text-[#25326a]">milestone</em> triwulanan tanpa adanya <em class="text-[#25326a]">bottleneck</em> kritis yang mengancam <em class="text-[#25326a]">timeline</em> utama.`
        );
      } else {
        paragraphs.push(`Fase operasional lapangan pada bulan ini mayoritas berada dalam tahap konsolidasi internal, di mana program-program utama sedang mempersiapkan transisi menuju tahapan eksekusi teknis berikutnya.`);
      }
      
      // Paragraph 4: Conclusion
      paragraphs.push(`<strong class="text-[#1e3a8a]">Kesimpulan:</strong> ${pick(v.concl, 0)} <em class="text-[#25326a]">roadmap</em> strategis perusahaan. Fokus pada siklus berikutnya adalah optimalisasi rantai pasok dan pemantauan ketat terhadap <em class="text-[#25326a]">Key Performance Indicators</em> (KPI) operasional guna memastikan kelayakan dan kelancaran inisiatif SCD berkelanjutan.`);
      
    } else {
      paragraphs.push(`Data aktivitas kualitatif belum direkam pada sistem untuk periode ini, sehingga audit kepatuhan terhadap jadwal implementasi lapangan (<em class="text-[#25326a]">timeline adherence</em>) belum dapat dikalkulasi secara presisi.`);
    }
    
    // --- 3. Quantitative (Financial) Conclusion ---
    if (salesData && salesData.length > 0) {
      let totalRevenue = 0;
      salesData.forEach(s => {
        if (s.Omzet && s.Omzet > 0) {
           totalRevenue += s.Omzet;
        }
      });
      
      if (totalRevenue > 0) {
        paragraphs.push(
          `${pick(v.fin_intro, 1)} <em class="text-[#25326a]">revenue stream</em> dari seluruh entitas binaan berhasil membukukan total omzet senilai <strong class="text-[#1e3a8a]">Rp ${totalRevenue.toLocaleString('id-ID')}</strong>. ${pick(v.fin_mid, 2)} efektivitas program dalam menstimulasi kemandirian ekonomi (<em class="text-[#25326a]">economic resilience</em>) di level desa, sekaligus mengonfirmasi bahwa ekosistem SCD telah mulai beralih dari fase pendampingan murni menuju fase profitabilitas mandiri.`
        );
      } else {
        paragraphs.push(
          `Berdasarkan data kuantitatif, entitas binaan masih dalam proses <em class="text-[#25326a]">ramp-up</em> produksi sehingga belum mencatatkan transaksi finansial (omzet) yang teregistrasi pada buku kas bulan ini.`
        );
      }
    } else {
      paragraphs.push(`Konsolidasi matrik finansial dan operasional belum tersedia untuk periode ini.`);
    }

    return paragraphs;
  };

  const reportParagraphs = generateReportStatement();

  const sectorIcons = {
    'Perkebunan': <span className="text-green-600">🌱</span>,
    'Peternakan': <span className="text-orange-600">🐄</span>,
    'Industri': <span className="text-gray-600">🏭</span>,
    'Perikanan': <span className="text-blue-500">🐟</span>,
    'Infrastruktur': <span className="text-purple-600">🏗️</span>
  };

  return (
    <div className="flex flex-col gap-6 -mt-4 md:-mt-6 lg:-mx-auto -mx-4 md:-mx-6 lg:max-w-none">
      
      {/* MAP WRAPPER (FULL BLEED) */}
      <div className="relative w-full h-[500px] md:h-[650px] bg-slate-200 overflow-hidden shadow-sm border-b border-gray-300">
        <div ref={mapRef} className="w-full h-full z-0"></div>
        
        {/* MAP TITLE OVERLAY (Top Left) */}
        <div className="absolute top-0 left-0 right-0 z-[400] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 shadow-sm border-b-4 border-[#1e3a8a] w-full pointer-events-auto">
            <h1 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Sebaran Lokasi Ring 1</h1>
            <h2 className="text-lg font-bold text-gray-500">Tanjung Enim Minning Site PT Bukit Asam (Persero) Tbk</h2>
          </div>
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
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex-1 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
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
            
            <div className="relative flex-1 flex flex-col">
              {/* Loading Overlay for Report Statement */}
              {isReportLoading && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-md">
                  <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-[#1e3a8a] font-bold text-xs animate-pulse">Memuat Ulang Laporan...</p>
                </div>
              )}
              
              <div className="text-[13px] text-gray-600 leading-relaxed text-justify flex-1 flex flex-col gap-3">
                {reportParagraphs.map((text, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                ))}
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 bg-[#1e3a8a] hover:bg-[#152a6b] text-white text-sm font-bold rounded shadow-sm transition-colors flex justify-center items-center gap-2">
              <Presentation size={16} /> Buat Presentasi
            </button>
          </div>
        </div>

        {/* Right Column: Program Berjalan */}
        <div className="lg:col-span-5 bg-white p-6 rounded-md shadow-sm border border-gray-200">
          <h3 className="text-[14px] font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200 pb-3 mb-6">
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
