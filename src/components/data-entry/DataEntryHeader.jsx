import React from 'react';
import useAppStore from '../../store/useAppStore';
import { PROGRAMS, PROGRAM_IMAGES, PROGRAM_DETAILS } from '../../data/mockData';
import { ChevronDown } from '../Icons';

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function DataEntryHeader({ isLoading }) {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);
  const programListFromStore = useAppStore((state) => state.programList);

  const availablePrograms = programListFromStore?.length > 0 ? programListFromStore : PROGRAMS;
  const bannerImage = React.useMemo(() => {
    const sLow = selectedProgram?.toLowerCase() || "";
    const key = Object.keys(PROGRAM_IMAGES).find(k => {
      const kLow = k.toLowerCase();
      return kLow === sLow || 
             (sLow.includes('maggot') && kLow.includes('maggot')) ||
             (sLow.includes('plts') && kLow.includes('plts')) ||
             (sLow.includes('ikan air tawar') && kLow.includes('ikan air tawar')) ||
             (sLow.includes('siba') && kLow.includes('siba')) ||
             (sLow.includes('puyuh') && sLow.includes('seleman') && kLow.includes('puyuh') && kLow.includes('seleman')) ||
             (sLow.includes('puyuh') && sLow.includes('darmo') && kLow.includes('puyuh') && kLow.includes('darmo')) ||
             (sLow.includes('ecogrow') && kLow.includes('ecogrow')) ||
             (sLow.includes('cahaya tani') && kLow.includes('cahaya tani')) ||
             (sLow.includes('itik petelur') && kLow.includes('itik petelur')) ||
             (sLow.includes('suscomdev lingkar tambang') && kLow.includes('suscomdev lingkar tambang')) ||
             (sLow.includes('suscomdev prabumenang') && kLow.includes('suscomdev prabumenang')) ||
             (sLow.includes('ras system') && kLow.includes('ras system')) ||
             (sLow.includes('ba-maxi') && kLow.includes('ba-maxi')) ||
             (sLow.includes('taman kehati') && kLow.includes('taman kehati')) ||
             (sLow.includes('sirah pulau') && kLow.includes('sirah pulau')) ||
             (sLow.includes('proklim') && kLow.includes('proklim'));
    });
    return PROGRAM_IMAGES[key] || PROGRAM_IMAGES["default"];
  }, [selectedProgram]);

  const currentMonthStr = selectedDate ? selectedDate.split('-')[1] : "01";
  const currentYearStr = selectedDate ? selectedDate.split('-')[0] : "2026";
  
  const handleMonthChange = (e) => {
    setSelectedDate(`${currentYearStr}-${e.target.value}-01`);
  };

  const handleYearChange = (e) => {
    setSelectedDate(`${e.target.value}-${currentMonthStr}-01`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      <div className="lg:w-1/2 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-2 tracking-tight">Data Entry {isLoading && <span className="text-sm font-normal text-gray-400">(Loading...)</span>}</h2>
          <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed text-justify">
            {selectedProgram?.toLowerCase().includes("plts") 
              ? "Pompa Irigasi Berbasis PLTS adalah inisiatif pemanfaatan energi terbarukan untuk mengatasi krisis air di sektor pertanian. Program ini bertujuan untuk meningkatkan produktivitas panen (dari 1x menjadi 2-3x setahun), memperluas lahan produktif, serta mendorong kemandirian ekonomi petani secara berkelanjutan."
              : selectedProgram?.toLowerCase().includes("maggot")
              ? "Budidaya Maggot Tanjung Agung adalah inisiatif ekonomi sirkular yang mengubah masalah sampah organik menjadi pakan ternak alternatif bernilai ekonomi tinggi. Program ini bertujuan mengatasi tingginya biaya pakan ternak dan perikanan sekaligus mengurangi limbah lingkungan, dengan kemampuan menyerap 12 ton sampah per tahun, meningkatkan efisiensi biaya pakan hingga 35%, serta berkontribusi pada penurunan emisi karbon."
              : selectedProgram?.toLowerCase().includes("ikan air tawar")
              ? "Budidaya Ikan Air Tawar Desa Tanjung Agung adalah inisiatif produktif berbasis kelompok yang bertujuan untuk meningkatkan ketahanan pangan dan pendapatan masyarakat lokal, khususnya bagi kelompok pemuda dan eks-pekerja PETI. Program ini berfokus secara holistik pada operasional budidaya, meliputi pembangunan unit kolam, pelatihan teknis pembesaran jenis ikan seperti lele, nila, patin, gurame, dan gabus, serta pendampingan manajemen pakan, kualitas air, hingga masa panen."
              : selectedProgram?.toLowerCase().includes("siba")
              ? "SIBA Pembibitan di Desa Tanjung Karangan adalah inisiatif pengembangan sentra pembibitan tanaman hortikultura dan tanaman produktif untuk menciptakan alternatif mata pencaharian yang berkelanjutan, khususnya bagi eks-pekerja PETI. Program ini berfokus pada penguatan operasional usaha pembibitan secara terpadu, yang meliputi pembangunan fasilitas rumah pembibitan (greenhouse), pelatihan teknis perbanyakan tanaman (seperti stek, cangkok, dan okulasi), serta produksi tambahan berupa media tanam, kompos, dan pupuk organik."
              : selectedProgram?.toLowerCase().includes("puyuh") && selectedProgram?.toLowerCase().includes("seleman")
              ? "Budidaya Puyuh Petelur di Desa Seleman adalah inisiatif pengembangan usaha berbasis kelompok yang bertujuan meningkatkan kapasitas ekonomi masyarakat agar lebih produktif, berkelanjutan, dan memiliki akses pasar yang stabil. Rangkaian kegiatan operasional pada program ini mencakup pembangunan dan penguatan unit kandang produksi, pelatihan teknis budidaya, serta pendampingan berkelanjutan untuk manajemen usaha dan pemasaran telur puyuh."
              : selectedProgram?.toLowerCase().includes("puyuh") && selectedProgram?.toLowerCase().includes("darmo")
              ? "Program Budidaya Puyuh Petelur Darmo adalah inisiatif pemberdayaan masyarakat lingkar tambang (eks-PETI) melalui ekosistem agribisnis puyuh terintegrasi. Dengan menerapkan model ekonomi sirkular—mulai dari produksi telur hingga pengolahan limbah menjadi pupuk dan maggot—program ini bertujuan meningkatkan kemandirian ekonomi sekaligus mendukung pelestarian lingkungan yang berkelanjutan."
              : selectedProgram?.toLowerCase().includes("ecogrow")
              ? "Program EcoGrow Mom KWT Utun Makmur adalah inisiatif pemberdayaan perempuan rentan (eks-PETI) melalui optimalisasi lahan pekarangan untuk budidaya hortikultura dan pengolahan hasil pertanian. Program ini mengintegrasikan ketahanan pangan, peningkatan pendapatan, dan praktik ekonomi sirkular guna mewujudkan kemandirian ekonomi keluarga secara berkelanjutan."
              : selectedProgram?.toLowerCase().includes("cahaya tani")
              ? "Program Poktan Cahaya Tani adalah inisiatif pemberdayaan masyarakat lingkar tambang (eks-PETI) melalui pengembangan sentra pembibitan modern terpadu. Program ini menyediakan bibit untuk kebutuhan reklamasi, penghijauan, dan perkebunan sebagai mata pencaharian alternatif yang mendukung pertumbuhan ekonomi sekaligus pelestarian lingkungan berkelanjutan."
              : selectedProgram?.toLowerCase().includes("itik petelur")
              ? "Program Budidaya Itik Petelur di Desa Tegal Rejo adalah inisiatif pemberdayaan masyarakat lingkar tambang yang dirancang sebagai tindakan preventif untuk mencegah keterlibatan warga dalam aktivitas penambangan tanpa izin (PETI). Melalui penerapan standar budidaya (SOP), pendampingan intensif, dan pembukaan akses pasar, program ini menyediakan alternatif mata pencaharian yang layak untuk mewujudkan kelompok peternak yang mandiri dan berkelanjutan."
              : selectedProgram?.toLowerCase().includes("suscomdev lingkar tambang")
              ? "Program Lingga Smart Grow adalah inisiatif pemberdayaan kelompok pemuda rentan sosial-ekonomi di kawasan lingkar tambang Desa Lingga melalui pengembangan budidaya melon premium bernilai komersial. Dengan menerapkan sistem pertanian modern berbasis smart greenhouse, hidroponik, dan Internet of Things (IoT), program ini bertujuan menciptakan kemandirian ekonomi, mengurangi ketergantungan pada sektor tambang, serta mewujudkan ekosistem agribisnis sirkular yang berkelanjutan."
              : selectedProgram?.toLowerCase().includes("suscomdev prabumenang")
              ? "Program Suscomdev Prabumenang adalah inisiatif pemberdayaan ibu rumah tangga pra-sejahtera di lingkar tambang melalui pengembangan UMKM produksi tempe. Program ini berfokus pada peningkatan standar produksi, fasilitasi legalitas usaha, dan diversifikasi produk untuk mewujudkan ekosistem Sentra Industri Kedelai yang mandiri dan berkelanjutan."
              : selectedProgram?.toLowerCase().includes("ras system")
              ? "Program Budidaya RAS System di Desa Keban Agung merupakan inisiatif pemberdayaan masyarakat lingkar tambang yang bertujuan menciptakan unit usaha perikanan modern berbasis kelompok melalui penerapan teknologi Recirculating Aquaculture System (RAS). Melalui integrasi kolam terpadu dan hidroponik yang sangat hemat air, program ini mendorong efisiensi produktivitas budidaya ikan air tawar guna meningkatkan kesejahteraan ekonomi sekaligus mendukung pelestarian lingkungan yang berkelanjutan."
              : selectedProgram?.toLowerCase().includes("ba-maxi")
              ? "Program Bukit Asam Mangrove Nexus Initiative (BA-MAXI) adalah inisiatif peningkatan ketahanan ekosistem pesisir di berbagai wilayah operasional melalui rehabilitasi mangrove guna mencegah abrasi dan menjaga keanekaragaman hayati."
              : selectedProgram?.toLowerCase().includes("taman kehati")
              ? "Program Revitalisasi Taman Kehati Bedegung merupakan inisiatif pengembangan ekowisata berbasis masyarakat yang bertujuan meningkatkan fungsi konservasi, edukasi, dan ekonomi kawasan di Desa Bedegung. Melalui revitalisasi infrastruktur dan rehabilitasi tanaman endemik, program ini berupaya melestarikan ekosistem daratan (TPB/SDGs 15) sekaligus meningkatkan kesejahteraan ekonomi masyarakat lingkar tambang secara berkelanjutan."
              : selectedProgram?.toLowerCase().includes("sirah pulau")
              ? "Program Pengembangan Desa Sirah Pulau adalah inisiatif pemberdayaan bagi kelompok rentan berpenghasilan rendah di kawasan lingkar tambang melalui pengembangan usaha budidaya ayam petelur komunal. Terintegrasi dengan Program Kampung Iklim (Proklim), program ini menerapkan praktik ekonomi sirkular dan infrastruktur kandang adaptif untuk meningkatkan ketahanan pangan, menangani stunting desa, serta menciptakan kemandirian ekonomi yang sejalan dengan TPB/SDGs 8."
              : selectedProgram?.toLowerCase().includes("proklim")
              ? "Program Kampung Iklim (ProKlim) di kawasan Tanjung Enim merupakan inisiatif kolaboratif antara pemerintah, perusahaan, dan masyarakat untuk meningkatkan peran aktif warga dalam upaya adaptasi serta mitigasi perubahan iklim di tingkat desa. Melalui serangkaian kegiatan terpadu seperti pengelolaan sampah, penghijauan, edukasi, dan konservasi air, program ini berupaya menciptakan lingkungan yang bersih dan berkelanjutan yang sejalan dengan pencapaian TPB/SDGs 13."
              : "Update ringkasan program dan data kuantitatif program sustainable community development."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative z-50 mt-6 lg:mt-0">
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
      <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[200px] lg:min-h-0">
        <img src={bannerImage} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
      </div>
    </div>
  );
}
