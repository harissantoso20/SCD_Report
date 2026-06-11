import fs from 'fs';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const generateMockData = () => {
  const data = [];
  const years = [2025, 2026];
  
  years.forEach(year => {
    // In 2026, let's only generate up to current month (e.g. December for now or up to limit)
    // Actually, to make it consistent with the user's dashboard, I'll generate up to 12 months for 2025 and 12 for 2026 so they can test it.
    const limitMonth = 12; 
    
    for (let i = 0; i < limitMonth; i++) {
      const month = months[i];
      
      // We need two operations for bibit: "Pembesaran Bibit" and "Penjualan"
      // But the dashboard also counts 'Penjualan' for omzet.
      
      // 1. Sawit
      const sawitPembesaran = Math.floor(Math.random() * 500) + 1000;
      data.push({
        Program: 'Poktan Cahaya Tani',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Bibit Tanaman',
        Produk: 'Sawit',
        Operasional: 'Pembesaran Bibit',
        'Value Operasional': sawitPembesaran,
        Jumlah: 0,
        Satuan_1: 'Batang',
        'Harga Satuan': 0,
        Omzet: 0
      });

      const sawitJual = Math.floor(Math.random() * 400) + 200; // 200-600
      const sawitHarga = year === 2025 ? 15000 : 17000;
      data.push({
        Program: 'Poktan Cahaya Tani',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Bibit Tanaman',
        Produk: 'Sawit',
        Operasional: 'Penjualan',
        'Value Operasional': 0,
        Jumlah: sawitJual,
        Satuan_1: 'Batang',
        'Harga Satuan': sawitHarga,
        Omzet: sawitJual * sawitHarga
      });

      // 2. Kayu Putih
      const kayuPutihPembesaran = Math.floor(Math.random() * 300) + 500;
      data.push({
        Program: 'Poktan Cahaya Tani',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Bibit Tanaman',
        Produk: 'Kayu Putih',
        Operasional: 'Pembesaran Bibit',
        'Value Operasional': kayuPutihPembesaran,
        Jumlah: 0,
        Satuan_1: 'Batang',
        'Harga Satuan': 0,
        Omzet: 0
      });

      const kayuPutihJual = Math.floor(Math.random() * 200) + 100;
      const kayuPutihHarga = year === 2025 ? 10000 : 12000;
      data.push({
        Program: 'Poktan Cahaya Tani',
        Bulan: month,
        Tahun: year,
        'Kategori Produk': 'Bibit Tanaman',
        Produk: 'Kayu Putih',
        Operasional: 'Penjualan',
        'Value Operasional': 0,
        Jumlah: kayuPutihJual,
        Satuan_1: 'Batang',
        'Harga Satuan': kayuPutihHarga,
        Omzet: kayuPutihJual * kayuPutihHarga
      });

      // 3. Polybag Bekas / Lainnya (only some months)
      if (Math.random() > 0.4) {
        const polybagJual = Math.floor(Math.random() * 100) + 50;
        const polybagHarga = 1000;
        data.push({
          Program: 'Poktan Cahaya Tani',
          Bulan: month,
          Tahun: year,
          'Kategori Produk': 'Lainnya',
          Produk: 'Polybag Bekas',
          Operasional: 'Penjualan',
          'Value Operasional': 0,
          Jumlah: polybagJual,
          Satuan_1: 'Pcs',
          'Harga Satuan': polybagHarga,
          Omzet: polybagJual * polybagHarga
        });
      }

      // 4. Pupuk Organik / Lainnya (only some months)
      if (Math.random() > 0.7) {
        const pupukJual = Math.floor(Math.random() * 50) + 20;
        const pupukHarga = 15000;
        data.push({
          Program: 'Poktan Cahaya Tani',
          Bulan: month,
          Tahun: year,
          'Kategori Produk': 'Lainnya',
          Produk: 'Pupuk Organik',
          Operasional: 'Penjualan',
          'Value Operasional': 0,
          Jumlah: pupukJual,
          Satuan_1: 'Kg',
          'Harga Satuan': pupukHarga,
          Omzet: pupukJual * pupukHarga
        });
      }
    }
  });

  return data;
};

const seedData = () => {
  console.log('Generating mock data for Poktan Cahaya Tani...');
  const data = generateMockData();
  
  const content = `export const MOCK_CAHAYA_TANI_DATA = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync('src/data/mockCahayaTani.js', content);
  
  console.log('Successfully written to src/data/mockCahayaTani.js');
};

seedData();
