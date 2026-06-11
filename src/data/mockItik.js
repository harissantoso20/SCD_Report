const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = [2024, 2025];
const products = [
  { name: 'Telur Itik Mentah', price: 2500, ratio: 0.3 },
  { name: 'Telur Asin Mentah', price: 3500, ratio: 0.3 },
  { name: 'Telur Asin Matang', price: 4500, ratio: 0.4 }
];

export const mockItikData = [];

years.forEach(year => {
  months.forEach(month => {
    // base volume roughly 30000 - 60000 eggs/month
    const baseVol = Math.floor(Math.random() * 30000) + 30000;
    
    products.forEach(p => {
      const qty = Math.floor(baseVol * p.ratio * (1 + (Math.random() * 0.2 - 0.1)));
      const omzet = qty * p.price;
      
      mockItikData.push({
        'Nama Program': 'Budidaya Itik Petelur',
        'Bulan': month,
        'Tahun': year,
        'Kategori Kegiatan': 'Produksi Telur',
        'Value Operasional': 0,
        'Satuan Operasional': '',
        'Kategori Produk': 'Telur Itik',
        'Produk': p.name,
        'Jumlah': qty,
        'Satuan': 'Butir',
        'Harga Satuan': p.price,
        'Omzet': omzet
      });
    });
  });
});
