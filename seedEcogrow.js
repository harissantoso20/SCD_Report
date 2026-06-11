import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mesrznsahcxtpgsvmcqa.supabase.co';
const supabaseAnonKey = 'sb_publishable_t3vr5ytwouctfymggQbMuQ_TTg6uoRK';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const generateMockData = () => {
  const data = [];
  const years = [2025, 2026];
  
  years.forEach(year => {
    // In 2026, let's only generate up to current month (e.g. June)
    const limitMonth = year === 2026 ? 6 : 12;
    
    for (let i = 0; i < limitMonth; i++) {
      const month = months[i];
      
      // Kangkung
      const kangkungQty = Math.floor(Math.random() * 500) + 500; // 500-1000
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

      // Terong
      const terongQty = Math.floor(Math.random() * 200) + 100; // 100-300
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

      // Bayam (Lainnya)
      const bayamQty = Math.floor(Math.random() * 300) + 200; // 200-500
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
      
      // Cabai (Lainnya)
      if (i % 2 === 0) { // every other month
        const cabaiQty = Math.floor(Math.random() * 30) + 10; // 10-40 kg
        const cabaiPrice = Math.floor(Math.random() * 20000) + 30000; // 30k-50k
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

async function seedData() {
  console.log("Generating mock data...");
  const mockData = generateMockData();
  
  console.log(`Inserting ${mockData.length} rows to SCD_Report_Sales_Data...`);
  const { data, error } = await supabase
    .from('SCD_Report_Sales_Data')
    .insert(mockData);
    
  if (error) {
    console.error("Error inserting mock data:", error);
  } else {
    console.log("Mock data inserted successfully!");
  }
}

seedData();
