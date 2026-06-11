const fs = require('fs');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const generateMockData = () => {
  const data = [];
  const years = [2025, 2026];
  
  years.forEach(year => {
    const limitMonth = year === 2026 ? 6 : 12;
    
    for (let i = 0; i < limitMonth; i++) {
      const month = months[i];
      
      const kangkungQty = Math.floor(Math.random() * 500) + 500;
      const kangkungPrice = year === 2025 ? 2000 : 2500;
      data.push({
        Program: 'EcoGrow Mom Utun Makmur',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Sayur',
        Produk: 'Kangkung',
        Jumlah: kangkungQty,
        Satuan_1: 'Ikat',
        'Harga Satuan': kangkungPrice,
        Omzet: kangkungQty * kangkungPrice
      });

      const terongQty = Math.floor(Math.random() * 200) + 100;
      const terongPrice = year === 2025 ? 8000 : 9000;
      data.push({
        Program: 'EcoGrow Mom Utun Makmur',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Sayur',
        Produk: 'Terong',
        Jumlah: terongQty,
        Satuan_1: 'Kg',
        'Harga Satuan': terongPrice,
        Omzet: terongQty * terongPrice
      });

      const bayamQty = Math.floor(Math.random() * 300) + 200;
      const bayamPrice = 1500;
      data.push({
        Program: 'EcoGrow Mom Utun Makmur',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Sayur',
        Produk: 'Bayam',
        Jumlah: bayamQty,
        Satuan_1: 'Ikat',
        'Harga Satuan': bayamPrice,
        Omzet: bayamQty * bayamPrice
      });
      
      if (i % 2 === 0) {
        const cabaiQty = Math.floor(Math.random() * 30) + 10;
        const cabaiPrice = Math.floor(Math.random() * 20000) + 30000;
        data.push({
          Program: 'EcoGrow Mom Utun Makmur',
          Bulan: month,
          Tahun: year,
          'Kategori Produk': 'Sayur',
          Produk: 'Cabai',
          Jumlah: cabaiQty,
          Satuan_1: 'Kg',
          'Harga Satuan': cabaiPrice,
          Omzet: cabaiQty * cabaiPrice
        });
      }
    }
  });
  
  return data;
};

fs.writeFileSync('src/data/mockEcogrow.js', 'export const MOCK_ECOGROW_DATA = ' + JSON.stringify(generateMockData(), null, 2) + ';');
console.log('src/data/mockEcogrow.js created!');
