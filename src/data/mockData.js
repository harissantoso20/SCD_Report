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
    desc: "Meningkatkan produktivitas pertanian melalui pemanfaatan energi terbarukan berupa PLTS untuk sistem pompa irigasi guna menjamin ketersediaan air secara efisien, hemat biaya, dan ramah lingkungan.",
    lokasi: "Tanjung Enim Mining Site, Tarahan Port, Ombilin Mining Site",
    penerima: "Kelompok Tani / Petani Sawah Tadah Hujan",
    objektif: "Unit PLTS irigasi beroperasi dengan tingkat utilisasi 285%. Peningkatan IP dari 1x menjadi 2-3x tanam per tahun.",
    tpb: "TPB 7 - Energi Bersih dan Terjangkau",
    anggaran: "Rp 1.766.000.000",
    realisasi: "Rp 139.286.026"
  },
  "Budidaya Maggot BSF": {
    desc: "Meningkatkan kemandirian ekonomi masyarakat melalui pengelolaan sampah organik berbasis budidaya maggot (BSF) sebagai sumber pakan alternatif dan produk bernilai.",
    lokasi: "Desa Keban Agung, Lawang Kidul",
    penerima: "Kelompok Masyarakat Pengelola Sampah",
    objektif: "Tereduksinya sampah organik minimal 5 ton/bulan dan produksi maggot stabil untuk subtitusi pakan ternak warga lokal.",
    tpb: "TPB 8 & 12 - Pertumbuhan Ekonomi & Konsumsi Bertanggung Jawab",
    anggaran: "Rp 450.000.000",
    realisasi: "Rp 85.500.000"
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
