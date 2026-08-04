// src/data/mockData.js

import imgPlts from '../assets/banner/1. PLTS Irigasi.png';
import imgMaggot from '../assets/banner/2. BUDIDAYA MAGGOT.png';
import imgIkanAirTawar from '../assets/banner/3. BUDIDAYA IKAN AIR TAWAR.png';
import imgSiba from '../assets/banner/4. SIBA PEMBIBITAN.png';
import imgPuyuhSeleman from '../assets/banner/5. BUDIDAYA PUYUH PETELUR SELEMAN.png';
import imgPuyuhDarmo from '../assets/banner/6. Budidaya Puyuh Petelur Darmo.png';
import imgEcogrow from '../assets/banner/7. ECOGROW MOM UTUM MAKMUR.png';
import imgCahayaTani from '../assets/banner/8. POKTAN CAHAYA TANI.png';
import imgItikPetelur from '../assets/banner/9. BUDIDAYA ITIK PETELUR.png';
import imgLingkarTambang from '../assets/banner/10. SUSCOMDEV LINGKAR TAMBANG.png';
import imgPrabumenang from '../assets/banner/11. SUSCOMDEV PRABUMENANG.png';
import imgRasSystem from '../assets/banner/12. BUDIDAYA RAS SYSTEM.png';
import imgBamaxi from '../assets/banner/13. BA-MAXI.png';
import imgTamanKehati from '../assets/banner/14. Revitalisasi Taman Kehati Bedegung.png';
import imgSirahPulau from '../assets/banner/15. Pengembangan Desa Sirah Pulau.png';
import imgProklim from '../assets/banner/16. Proklim.png';

export const PROGRAMS = [
  "PLTS Irigasi", "Budidaya Maggot BSF", "Budidaya Ikan Air Tawar", "SIBA Pembibitan", 
  "Budidaya Puyuh Petelur (Seleman)", "Budidaya Puyuh Petelur (Darmo)", "EcoGrow Mom Utun Makmur", 
  "Poktan Cahaya Tani", "Budidaya Itik Petelur", "Suscomdev Lingkar Tambang", "Suscomdev Sirah Pulau", 
  "Suscomdev Prabumenang", "Budidaya Ikan RAS System", "BA-MAXI", "PROKLIM", "Revitalisasi Taman Kehati"
];

export const PROGRAM_IMAGES = {
  "PLTS Irigasi": imgPlts,
  "Budidaya Maggot BSF": imgMaggot,
  "Budidaya Ikan Air Tawar": imgIkanAirTawar,
  "SIBA Pembibitan": imgSiba,
  "Budidaya Puyuh Petelur (Seleman)": imgPuyuhSeleman,
  "Budidaya Puyuh Petelur (Darmo)": imgPuyuhDarmo,
  "EcoGrow Mom Utun Makmur": imgEcogrow,
  "Poktan Cahaya Tani": imgCahayaTani,
  "Budidaya Itik Petelur": imgItikPetelur,
  "Suscomdev Lingkar Tambang": imgLingkarTambang,
  "Suscomdev Prabumenang": imgPrabumenang,
  "Budidaya Ikan RAS System": imgRasSystem,
  "BA-MAXI": imgBamaxi,
  "Revitalisasi Taman Kehati": imgTamanKehati,
  "Suscomdev Sirah Pulau": imgSirahPulau,
  "PROKLIM": imgProklim,
  "default": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
};

export const PROGRAM_DETAILS = {
  "PLTS Irigasi": {
    desc: "Pompa Irigasi Berbasis PLTS adalah inisiatif pemanfaatan energi terbarukan untuk mengatasi krisis air di sektor pertanian. Program ini bertujuan untuk meningkatkan produktivitas panen (dari 1x menjadi 2-3x setahun), memperluas lahan produktif, serta mendorong kemandirian ekonomi petani secara berkelanjutan.",
    lokasi: "Tanjung Enim Mining Site, Tarahan Port, Ombilin Mining Site",
    penerima: "Kelompok Tani / Petani Sawah Tadah Hujan",
    objektif: "Unit PLTS irigasi beroperasi dengan tingkat utilisasi 285%. Peningkatan IP dari 1x menjadi 2-3x tanam per tahun.",
    tpb: "TPB 7 - Energi Bersih dan Terjangkau",
    anggaran: "Rp 1.766.000.000",
    realisasi: "Rp 139.286.026"
  },
  "Budidaya Maggot BSF": {
    desc: "Budidaya Maggot Tanjung Agung adalah inisiatif ekonomi sirkular yang mengubah masalah sampah organik menjadi pakan ternak alternatif bernilai ekonomi tinggi. Program ini bertujuan mengatasi tingginya biaya pakan ternak dan perikanan sekaligus mengurangi limbah lingkungan, dengan kemampuan menyerap 12 ton sampah per tahun, meningkatkan efisiensi biaya pakan hingga 35%, serta berkontribusi pada penurunan emisi karbon.",
    lokasi: "Desa Keban Agung, Lawang Kidul",
    penerima: "Kelompok Masyarakat Pengelola Sampah",
    objektif: "Tereduksinya sampah organik minimal 5 ton/bulan dan produksi maggot stabil untuk subtitusi pakan ternak warga lokal.",
    tpb: "TPB 8 & 12 - Pertumbuhan Ekonomi & Konsumsi Bertanggung Jawab",
    anggaran: "Rp 450.000.000",
    realisasi: "Rp 85.500.000"
  },
  "Budidaya Ikan Air Tawar": {
    desc: "Budidaya Ikan Air Tawar Desa Tanjung Agung adalah inisiatif produktif berbasis kelompok yang bertujuan untuk meningkatkan ketahanan pangan dan pendapatan masyarakat lokal, khususnya bagi kelompok pemuda dan eks-pekerja PETI. Program ini berfokus secara holistik pada operasional budidaya, meliputi pembangunan unit kolam, pelatihan teknis pembesaran jenis ikan seperti lele, nila, patin, gurame, dan gabus, serta pendampingan manajemen pakan, kualitas air, hingga masa panen.",
    lokasi: "Desa Tanjung Agung",
    penerima: "Kelompok Pemuda & Eks-pekerja PETI",
    objektif: "Peningkatan ketahanan pangan dan pendapatan masyarakat lokal.",
    tpb: "TPB 2 & 8 - Tanpa Kelaparan & Pertumbuhan Ekonomi",
    anggaran: "Rp 500.000.000",
    realisasi: "Rp 120.000.000"
  },
  "SIBA Pembibitan": {
    desc: "SIBA Pembibitan di Desa Tanjung Karangan adalah inisiatif pengembangan sentra pembibitan tanaman hortikultura dan tanaman produktif untuk menciptakan alternatif mata pencaharian yang berkelanjutan, khususnya bagi eks-pekerja PETI. Program ini berfokus pada penguatan operasional usaha pembibitan secara terpadu, yang meliputi pembangunan fasilitas rumah pembibitan (greenhouse), pelatihan teknis perbanyakan tanaman (seperti stek, cangkok, dan okulasi), serta produksi tambahan berupa media tanam, kompos, dan pupuk organik.",
    lokasi: "Desa Tanjung Karangan",
    penerima: "Eks-pekerja PETI & Masyarakat Sekitar",
    objektif: "Menciptakan alternatif mata pencaharian berkelanjutan.",
    tpb: "TPB 8 & 15 - Pertumbuhan Ekonomi & Ekosistem Daratan",
    anggaran: "Rp 350.000.000",
    realisasi: "Rp 90.000.000"
  },
  "Budidaya Puyuh Petelur (Seleman)": {
    desc: "Budidaya Puyuh Petelur di Desa Seleman adalah inisiatif pengembangan usaha berbasis kelompok yang bertujuan meningkatkan kapasitas ekonomi masyarakat agar lebih produktif, berkelanjutan, dan memiliki akses pasar yang stabil. Rangkaian kegiatan operasional pada program ini mencakup pembangunan dan penguatan unit kandang produksi, pelatihan teknis budidaya, serta pendampingan berkelanjutan untuk manajemen usaha dan pemasaran telur puyuh.",
    lokasi: "Desa Seleman",
    penerima: "Masyarakat Desa Seleman",
    objektif: "Meningkatkan kapasitas ekonomi masyarakat agar lebih produktif.",
    tpb: "TPB 1 & 8 - Tanpa Kemiskinan & Pertumbuhan Ekonomi",
    anggaran: "Rp 400.000.000",
    realisasi: "Rp 150.000.000"
  },
  "Budidaya Puyuh Petelur (Darmo)": {
    desc: "Program Budidaya Puyuh Petelur Darmo adalah inisiatif pemberdayaan masyarakat lingkar tambang (eks-PETI) melalui ekosistem agribisnis puyuh terintegrasi. Dengan menerapkan model ekonomi sirkular—mulai dari produksi telur hingga pengolahan limbah menjadi pupuk dan maggot—program ini bertujuan meningkatkan kemandirian ekonomi sekaligus mendukung pelestarian lingkungan yang berkelanjutan.",
    lokasi: "Desa Darmo",
    penerima: "Masyarakat Desa Darmo",
    objektif: "Meningkatkan kemandirian ekonomi sekaligus mendukung pelestarian lingkungan yang berkelanjutan.",
    tpb: "TPB 8 & 12 - Pertumbuhan Ekonomi & Konsumsi Bertanggung Jawab",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "EcoGrow Mom Utun Makmur": {
    desc: "Program EcoGrow Mom KWT Utun Makmur adalah inisiatif pemberdayaan perempuan rentan (eks-PETI) melalui optimalisasi lahan pekarangan untuk budidaya hortikultura dan pengolahan hasil pertanian. Program ini mengintegrasikan ketahanan pangan, peningkatan pendapatan, dan praktik ekonomi sirkular guna mewujudkan kemandirian ekonomi keluarga secara berkelanjutan.",
    lokasi: "Tanjung Enim",
    penerima: "KWT Utun Makmur",
    objektif: "Mewujudkan kemandirian ekonomi keluarga secara berkelanjutan.",
    tpb: "TPB 2 & 8 - Tanpa Kelaparan & Pertumbuhan Ekonomi",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Poktan Cahaya Tani": {
    desc: "Program Poktan Cahaya Tani adalah inisiatif pemberdayaan masyarakat lingkar tambang (eks-PETI) melalui pengembangan sentra pembibitan modern terpadu. Program ini menyediakan bibit untuk kebutuhan reklamasi, penghijauan, dan perkebunan sebagai mata pencaharian alternatif yang mendukung pertumbuhan ekonomi sekaligus pelestarian lingkungan berkelanjutan.",
    lokasi: "Tanjung Enim",
    penerima: "Poktan Cahaya Tani",
    objektif: "Mendukung pertumbuhan ekonomi sekaligus pelestarian lingkungan berkelanjutan.",
    tpb: "TPB 8 & 15 - Pertumbuhan Ekonomi & Ekosistem Daratan",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Budidaya Itik Petelur": {
    desc: "Program Budidaya Itik Petelur di Desa Tegal Rejo adalah inisiatif pemberdayaan masyarakat lingkar tambang yang dirancang sebagai tindakan preventif untuk mencegah keterlibatan warga dalam aktivitas penambangan tanpa izin (PETI). Melalui penerapan standar budidaya (SOP), pendampingan intensif, dan pembukaan akses pasar, program ini menyediakan alternatif mata pencaharian yang layak untuk mewujudkan kelompok peternak yang mandiri dan berkelanjutan.",
    lokasi: "Desa Tegal Rejo",
    penerima: "Masyarakat Desa Tegal Rejo",
    objektif: "Menyediakan alternatif mata pencaharian yang layak untuk mewujudkan kelompok peternak yang mandiri dan berkelanjutan.",
    tpb: "TPB 8 - Pertumbuhan Ekonomi",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Suscomdev Lingkar Tambang": {
    desc: "Program Lingga Smart Grow adalah inisiatif pemberdayaan kelompok pemuda rentan sosial-ekonomi di kawasan lingkar tambang Desa Lingga melalui pengembangan budidaya melon premium bernilai komersial. Dengan menerapkan sistem pertanian modern berbasis smart greenhouse, hidroponik, dan Internet of Things (IoT), program ini bertujuan menciptakan kemandirian ekonomi, mengurangi ketergantungan pada sektor tambang, serta mewujudkan ekosistem agribisnis sirkular yang berkelanjutan.",
    lokasi: "Desa Lingga",
    penerima: "Kelompok Pemuda Rentan Sosial-Ekonomi",
    objektif: "Menciptakan kemandirian ekonomi, mengurangi ketergantungan pada sektor tambang, serta mewujudkan ekosistem agribisnis sirkular yang berkelanjutan.",
    tpb: "TPB 8 - Pertumbuhan Ekonomi",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Suscomdev Prabumenang": {
    desc: "Program Suscomdev Prabumenang adalah inisiatif pemberdayaan ibu rumah tangga pra-sejahtera di lingkar tambang melalui pengembangan UMKM produksi tempe. Program ini berfokus pada peningkatan standar produksi, fasilitasi legalitas usaha, dan diversifikasi produk untuk mewujudkan ekosistem Sentra Industri Kedelai yang mandiri dan berkelanjutan.",
    lokasi: "Desa Prabumenang",
    penerima: "Ibu Rumah Tangga Pra-Sejahtera",
    objektif: "Mewujudkan ekosistem Sentra Industri Kedelai yang mandiri dan berkelanjutan.",
    tpb: "TPB 8 - Pertumbuhan Ekonomi",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Budidaya Ikan RAS System": {
    desc: "Program Budidaya RAS System di Desa Keban Agung merupakan inisiatif pemberdayaan masyarakat lingkar tambang yang bertujuan menciptakan unit usaha perikanan modern berbasis kelompok melalui penerapan teknologi Recirculating Aquaculture System (RAS). Melalui integrasi kolam terpadu dan hidroponik yang sangat hemat air, program ini mendorong efisiensi produktivitas budidaya ikan air tawar guna meningkatkan kesejahteraan ekonomi sekaligus mendukung pelestarian lingkungan yang berkelanjutan.",
    lokasi: "Desa Keban Agung",
    penerima: "Masyarakat Desa Keban Agung",
    objektif: "Menciptakan unit usaha perikanan modern berbasis kelompok melalui penerapan teknologi Recirculating Aquaculture System (RAS).",
    tpb: "TPB 8 & 12 - Pertumbuhan Ekonomi & Konsumsi Bertanggung Jawab",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "BA-MAXI": {
    desc: "Program Bukit Asam Mangrove Nexus Initiative (BA-MAXI) adalah inisiatif peningkatan ketahanan ekosistem pesisir di berbagai wilayah operasional melalui rehabilitasi mangrove guna mencegah abrasi dan menjaga keanekaragaman hayati.",
    lokasi: "Berbagai Wilayah Operasional",
    penerima: "Masyarakat Pesisir",
    objektif: "Meningkatkan ketahanan ekosistem pesisir melalui rehabilitasi mangrove guna mencegah abrasi dan menjaga keanekaragaman hayati.",
    tpb: "TPB 14 - Ekosistem Laut",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "PROKLIM": {
    desc: "Program Kampung Iklim (ProKlim) di kawasan Tanjung Enim merupakan inisiatif kolaboratif antara pemerintah, perusahaan, dan masyarakat untuk meningkatkan peran aktif warga dalam upaya adaptasi serta mitigasi perubahan iklim di tingkat desa. Melalui serangkaian kegiatan terpadu seperti pengelolaan sampah, penghijauan, edukasi, dan konservasi air, program ini berupaya menciptakan lingkungan yang bersih dan berkelanjutan yang sejalan dengan pencapaian TPB/SDGs 13.",
    lokasi: "Kawasan Tanjung Enim",
    penerima: "Masyarakat Desa/Kelurahan",
    objektif: "Menciptakan lingkungan yang bersih dan berkelanjutan yang sejalan dengan pencapaian TPB/SDGs 13.",
    tpb: "TPB 13 - Penanganan Perubahan Iklim",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Revitalisasi Taman Kehati": {
    desc: "Program Revitalisasi Taman Kehati Bedegung merupakan inisiatif pengembangan ekowisata berbasis masyarakat yang bertujuan meningkatkan fungsi konservasi, edukasi, dan ekonomi kawasan di Desa Bedegung. Melalui revitalisasi infrastruktur dan rehabilitasi tanaman endemik, program ini berupaya melestarikan ekosistem daratan (TPB/SDGs 15) sekaligus meningkatkan kesejahteraan ekonomi masyarakat lingkar tambang secara berkelanjutan.",
    lokasi: "Desa Bedegung",
    penerima: "Masyarakat Desa Bedegung",
    objektif: "Meningkatkan fungsi konservasi, edukasi, dan ekonomi kawasan.",
    tpb: "TPB 15 - Ekosistem Daratan",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "Suscomdev Sirah Pulau": {
    desc: "Program Pengembangan Desa Sirah Pulau adalah inisiatif pemberdayaan bagi kelompok rentan berpenghasilan rendah di kawasan lingkar tambang melalui pengembangan usaha budidaya ayam petelur komunal. Terintegrasi dengan Program Kampung Iklim (Proklim), program ini menerapkan praktik ekonomi sirkular dan infrastruktur kandang adaptif untuk meningkatkan ketahanan pangan, menangani stunting desa, serta menciptakan kemandirian ekonomi yang sejalan dengan TPB/SDGs 8.",
    lokasi: "Desa Sirah Pulau",
    penerima: "Kelompok Rentan Berpenghasilan Rendah",
    objektif: "Meningkatkan ketahanan pangan, menangani stunting desa, serta menciptakan kemandirian ekonomi.",
    tpb: "TPB 8 - Pertumbuhan Ekonomi",
    anggaran: "Rp 0",
    realisasi: "Rp 0"
  },
  "default": {
    desc: "Meningkatkan kesejahteraan masyarakat lingkar tambang melalui program pemberdayaan ekonomi dan pelestarian lingkungan yang berkelanjutan.",
    lokasi: "Area Ring 1 PT Bukit Asam",
    penerima: "Masyarakat Umum & Kelompok Binaan",
    objektif: "Mewujudkan kemandirian finansial kelompok mitra binaan secara konsisten.",
    tpb: "TPB 1 - Tanpa Kemiskinan",
    anggaran: "Rp 1.000.000.000",
    realisasi: "Rp 250.000.000"
  }
};

export const MAP_LOCATIONS = [
  { id: 1, nama: "Desa Talawi (Sawahlunto)", lat: -0.681, lng: 100.772, kwp: 18.7, luas: 19, petani: 60 },
  { id: 2, nama: "Desa Nanjungan (Lahat)", lat: -3.801, lng: 103.541, kwp: 27.5, luas: 83, petani: 60 },
  { id: 3, nama: "Desa Muara Gula Baru", lat: -3.652, lng: 103.784, kwp: 7.14, luas: 4, petani: 20 },
  { id: 4, nama: "Desa Trimulyo (Lampung Sel.)", lat: -5.451, lng: 105.502, kwp: 38.5, luas: 128, petani: 154 },
  { id: 5, nama: "Desa Lugusari (Pringsewu)", lat: -5.353, lng: 104.974, kwp: 23.4, luas: 153, petani: 234 },
  { id: 6, nama: "Desa Rejosari (Lampung Teng.)", lat: -5.102, lng: 105.201, kwp: 52.8, luas: 50, petani: 100 }
];

export const CHART_DATA_SALES = [];
export const MOCK_CAHAYA_TANI_DATA = [];
export const MOCK_ECOGROW_DATA = [];
export const mockItikData = [];
