// src/data/mockData.js

export const PROGRAMS = [
  "PLTS Irigasi", "Budidaya Maggot BSF", "Budidaya Ikan Air Tawar", "SIBA Pembibitan", 
  "Budidaya Puyuh Petelur (Seleman)", "Budidaya Puyuh Petelur (Darmo)", "EcoGrow Mom Utun Makmur", 
  "Poktan Cahaya Tani", "Budidaya Itik Petelur", "Suscomdev Lingkar Tambang", "Suscomdev Sirah Pulau", 
  "Suscomdev Prabumenang", "Budidaya Ikan RAS System", "BA-MAXI", "PROKLIM"
];

export const PROGRAM_IMAGES = {
  "PLTS Irigasi": "https://images.unsplash.com/photo-1509391366360-1e97b524c5bb?auto=format&fit=crop&w=1200&q=80",
  "Budidaya Maggot BSF": "https://images.unsplash.com/photo-1586771107445-d3afef11d0b9?auto=format&fit=crop&w=1200&q=80",
  "Budidaya Ikan Air Tawar": "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=1200&q=80",
  "SIBA Pembibitan": "https://images.unsplash.com/photo-1592424001807-6b45f448b1bb?auto=format&fit=crop&w=1200&q=80",
  "EcoGrow Mom Utun Makmur": "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=1200&q=80",
  "BA-MAXI": "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=1200&q=80",
  "PROKLIM": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
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
