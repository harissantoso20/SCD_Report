import { useMemo } from 'react';
import useAppStore from '../store/useAppStore';

const MAGGOT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];

export function useDashboardData() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const programContext = useAppStore((state) => state.programContext);
  
  const salesData = useAppStore((state) => state.salesData) || [];
  
  const currentYear = selectedDate ? selectedDate.split('-')[0] : new Date().getFullYear().toString();
  const selectedMonthIdx = selectedDate ? new Date(selectedDate).getMonth() : new Date().getMonth();

  const isSalesProgram = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    return [
      "budidaya maggot bsf", "budidaya maggot", "budidaya ikan air tawar", "siba pembibitan", 
      "budidaya puyuh petelur seleman", "budidaya puyuh petelur darmo", 
      "ecogrow mom kwt utun makmur", "poktan cahaya tani", "budidaya itik petelur"
    ].includes(p);
  }, [selectedProgram]);

  const maggotBioconversionData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("maggot")) return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, sampah: 0, maggot: 0 }; });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        if (row.Operasional === "Sampah Organik Terurai") {
          dataMap[monthIdx].sampah += (Number(row['Value Operasional']) || 0);
        }
        if (row.Produk === "Fresh Maggot") {
          dataMap[monthIdx].maggot += (Number(row.Jumlah) || 0);
        }
      }
    });

    const validData = Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
    return validData;
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const maggotFinancialData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("maggot")) return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, fresh: 0, kering: 0, kasgot: 0, omzet: 0, omzet_fresh: 0, omzet_kering: 0, omzet_kasgot: 0 }; });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        if (row.Produk === "Fresh Maggot") {
          dataMap[monthIdx].fresh += (Number(row.Jumlah) || 0);
          dataMap[monthIdx].omzet_fresh += (Number(row.Omzet) || 0);
        }
        if (row.Produk === "Maggot Kering") {
          dataMap[monthIdx].kering += (Number(row.Jumlah) || 0);
          dataMap[monthIdx].omzet_kering += (Number(row.Omzet) || 0);
        }
        if (row.Produk === "Kasgot") {
          dataMap[monthIdx].kasgot += (Number(row.Jumlah) || 0);
          dataMap[monthIdx].omzet_kasgot += (Number(row.Omzet) || 0);
        }
        dataMap[monthIdx].omzet += (Number(row.Omzet) || 0);
      }
    });

    const validData = Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
    return validData;
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const maggotPortfolioData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("maggot")) return [];
    let freshRev = 0, keringRev = 0, kasgotRev = 0;
    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';
      
      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        if (row.Produk === "Fresh Maggot") freshRev += (Number(row.Omzet) || 0);
        if (row.Produk === "Maggot Kering") keringRev += (Number(row.Omzet) || 0);
        if (row.Produk === "Kasgot") kasgotRev += (Number(row.Omzet) || 0);
      }
    });

    return [
      { name: 'Fresh Maggot', value: freshRev, color: '#eab308' },
      { name: 'Maggot Kering', value: keringRev, color: '#f59e0b' },
      { name: 'Kasgot', value: kasgotRev, color: '#1e3a8a' },
    ].filter(item => item.value > 0);
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const dynamicSalesChartData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!isSalesProgram || p.includes("maggot")) return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, Omzet: 0 }; });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1) {
        dataMap[monthIdx].Omzet += (Number(row.Omzet) || 0);
      }
    });

    const validData = Object.values(dataMap).filter(item => item.Omzet > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [isSalesProgram, selectedProgram, salesData]);

  const totalWasteManaged = useMemo(() => {
    return maggotBioconversionData.reduce((sum, item) => sum + item.sampah, 0);
  }, [maggotBioconversionData]);

  const totalOmzet = useMemo(() => {
    return maggotPortfolioData.reduce((sum, item) => sum + item.value, 0);
  }, [maggotPortfolioData]);

  const fisheryOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("ikan air tawar")) return [];
    
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { 
        month: m, 
        konsumsi_kg: 0, 
        konsumsi_rp: 0, 
        bibit_ekor: 0, 
        bibit_rp: 0, 
        total_rp: 0 
      }; 
    });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const cat = (row['Kategori Produk'] || '').toLowerCase();
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;

        if (cat === 'ikan konsumsi') {
          dataMap[monthIdx].konsumsi_kg += qty;
          dataMap[monthIdx].konsumsi_rp += omzet;
        } else if (cat === 'bibit ikan') {
          dataMap[monthIdx].bibit_ekor += qty;
          dataMap[monthIdx].bibit_rp += omzet;
        }
        // Both contribute to total_rp
        if (cat === 'ikan konsumsi' || cat === 'bibit ikan') {
          dataMap[monthIdx].total_rp += omzet;
        }
      }
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const fisheryPortfolioRaw = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("ikan air tawar")) return [];
    
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { month: m, konsumsi: {}, bibit: {} };
    });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const cat = (row['Kategori Produk'] || '').toLowerCase();
        const produk = row.Produk || 'Unknown';
        const omzet = Number(row.Omzet) || 0;

        if (cat === 'ikan konsumsi') {
          dataMap[monthIdx].konsumsi[produk] = (dataMap[monthIdx].konsumsi[produk] || 0) + omzet;
        } else if (cat === 'bibit ikan') {
          dataMap[monthIdx].bibit[produk] = (dataMap[monthIdx].bibit[produk] || 0) + omzet;
        }
      }
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const fisheryYTD = useMemo(() => {
    return fisheryOverviewData.reduce((acc, curr) => {
      acc.total_revenue += curr.total_rp;
      acc.total_konsumsi_kg += curr.konsumsi_kg;
      acc.total_bibit_ekor += curr.bibit_ekor;
      return acc;
    }, { total_revenue: 0, total_konsumsi_kg: 0, total_bibit_ekor: 0 });
  }, [fisheryOverviewData]);

  const pembibitanOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("siba pembibitan")) return [];
    
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { 
        month: m, 
        pembesaran_batang: 0, 
        penjualan_batang: 0, 
        polybag_sold: 0, 
        bibit_omzet: 0, 
        polybag_omzet: 0, 
        total_rp: 0,
        bibit_count_for_avg: 0,
        sum_harga_bibit: 0
      }; 
    });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        if (row.Operasional === "Jumlah Pembesaran (Batang)") {
          dataMap[monthIdx].pembesaran_batang += (Number(row['Value Operasional']) || 0);
        }

        const cat = (row['Kategori Produk'] || '').toLowerCase();
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        const harga = Number(row['Harga Satuan']) || 0;

        if (cat === 'penjualan bibit tanaman') {
          dataMap[monthIdx].penjualan_batang += qty;
          dataMap[monthIdx].bibit_omzet += omzet;
          if (qty > 0 && harga > 0) {
            dataMap[monthIdx].bibit_count_for_avg += 1;
            dataMap[monthIdx].sum_harga_bibit += harga;
          }
        } else if (cat === 'penjualan produk lainnya') {
          dataMap[monthIdx].polybag_sold += qty;
          dataMap[monthIdx].polybag_omzet += omzet;
        }
        
        if (cat === 'penjualan bibit tanaman' || cat === 'penjualan produk lainnya') {
          dataMap[monthIdx].total_rp += omzet;
        }
      }
    });

    const result = Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx).map(d => ({
      ...d,
      avg_harga_bibit: d.bibit_count_for_avg > 0 ? (d.sum_harga_bibit / d.bibit_count_for_avg) : 0
    }));
    
    // Inject mock data if no real data exists, to demonstrate the scenario requested by user
    const hasData = result.some(d => d.pembesaran_batang > 0 || d.total_rp > 0);
    if (!hasData) {
      if (currentYear === '2026') {
        return [
          { month: 'JAN', pembesaran_batang: 310300, penjualan_batang: 1100, polybag_sold: 0, bibit_omzet: 6200000, polybag_omzet: 0, total_rp: 6200000, avg_harga_bibit: 5636 },
          { month: 'FEB', pembesaran_batang: 313700, penjualan_batang: 100, polybag_sold: 0, bibit_omzet: 3700000, polybag_omzet: 0, total_rp: 3700000, avg_harga_bibit: 37000 },
          { month: 'MAR', pembesaran_batang: 316246, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'APR', pembesaran_batang: 316246, penjualan_batang: 11509, polybag_sold: 0, bibit_omzet: 52139100, polybag_omzet: 0, total_rp: 52139100, avg_harga_bibit: 4530 },
          { month: 'MEI', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'JUN', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'JUL', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'AUG', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'SEP', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'OKT', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'NOV', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
          { month: 'DES', pembesaran_batang: 0, penjualan_batang: 0, polybag_sold: 0, bibit_omzet: 0, polybag_omzet: 0, total_rp: 0, avg_harga_bibit: 0 },
        ].filter((_, i) => i <= selectedMonthIdx);
      } else if (currentYear === '2025') {
        return [
          { month: 'JAN', pembesaran_batang: 8000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'FEB', pembesaran_batang: 7000, penjualan_batang: 3000, polybag_sold: 0, bibit_omzet: 15000000, polybag_omzet: 0, total_rp: 15000000, avg_harga_bibit: 5000 },
          { month: 'MAR', pembesaran_batang: 6000, penjualan_batang: 5000, polybag_sold: 0, bibit_omzet: 25000000, polybag_omzet: 0, total_rp: 25000000, avg_harga_bibit: 5000 },
          { month: 'APR', pembesaran_batang: 8000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'MEI', pembesaran_batang: 7000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'JUN', pembesaran_batang: 8000, penjualan_batang: 5000, polybag_sold: 0, bibit_omzet: 25000000, polybag_omzet: 0, total_rp: 25000000, avg_harga_bibit: 5000 },
          { month: 'JUL', pembesaran_batang: 7000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'AUG', pembesaran_batang: 8000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'SEP', pembesaran_batang: 7000, penjualan_batang: 5000, polybag_sold: 0, bibit_omzet: 25000000, polybag_omzet: 0, total_rp: 25000000, avg_harga_bibit: 5000 },
          { month: 'OKT', pembesaran_batang: 8000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'NOV', pembesaran_batang: 7000, penjualan_batang: 4000, polybag_sold: 0, bibit_omzet: 20000000, polybag_omzet: 0, total_rp: 20000000, avg_harga_bibit: 5000 },
          { month: 'DES', pembesaran_batang: 6045, penjualan_batang: 3395, polybag_sold: 0, bibit_omzet: 24975000, polybag_omzet: 0, total_rp: 24975000, avg_harga_bibit: 7356 },
        ].filter((_, i) => i <= selectedMonthIdx);
      }
    }

    return result;
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const pembibitanYTD = useMemo(() => {
    const ytd = pembibitanOverviewData.reduce((acc, curr) => {
      acc.total_penjualan += curr.penjualan_batang;
      acc.total_polybag += curr.polybag_sold;
      acc.total_omzet += curr.total_rp;
      acc.total_bibit_omzet += curr.bibit_omzet;
      acc.total_polybag_omzet += curr.polybag_omzet;
      return acc;
    }, { total_pembesaran: 0, total_penjualan: 0, total_polybag: 0, total_omzet: 0, total_bibit_omzet: 0, total_polybag_omzet: 0 });

    const lastValidMonth = [...pembibitanOverviewData].reverse().find(d => d.pembesaran_batang > 0 || d.penjualan_batang > 0 || d.total_rp > 0);
    ytd.total_pembesaran = lastValidMonth ? lastValidMonth.pembesaran_batang : 0;

    return ytd;
  }, [pembibitanOverviewData]);

  const quailOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("puyuh")) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { 
        month: m, 
        qty_telur: 0, 
        omzet_telur: 0, 
        qty_kohe: 0, 
        omzet_kohe: 0, 
        omzet_lainnya: 0,
        total_omzet: 0
      };
    });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const prod = (row.Produk || '').toLowerCase();
        const cat = (row['Kategori Produk'] || '').toLowerCase();
        const fullProdStr = prod + ' ' + cat;
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;

        if (fullProdStr.includes('telur')) {
          dataMap[monthIdx].qty_telur += qty;
          dataMap[monthIdx].omzet_telur += omzet;
        } else if (fullProdStr.includes('kohe') || fullProdStr.includes('kotoran') || fullProdStr.includes('pupuk')) {
          dataMap[monthIdx].qty_kohe += qty;
          dataMap[monthIdx].omzet_kohe += omzet;
        } else {
          dataMap[monthIdx].omzet_lainnya += omzet;
        }
        
        dataMap[monthIdx].total_omzet += omzet;
      }
    });

    // Calculate Average Price per month
    Object.values(dataMap).forEach(d => {
      d.avg_harga_telur = d.qty_telur > 0 ? Math.round(d.omzet_telur / d.qty_telur) : 0;
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const quailYTD = useMemo(() => {
    const ytd = quailOverviewData.reduce((acc, curr) => {
      acc.total_omzet += curr.total_omzet;
      acc.total_qty_telur += curr.qty_telur;
      acc.total_qty_kohe += curr.qty_kohe;
      acc.total_omzet_telur += curr.omzet_telur;
      acc.total_omzet_kohe += curr.omzet_kohe;
      acc.total_omzet_lainnya += curr.omzet_lainnya;
      return acc;
    }, { 
      total_omzet: 0, 
      total_qty_telur: 0, 
      total_qty_kohe: 0,
      total_omzet_telur: 0,
      total_omzet_kohe: 0,
      total_omzet_lainnya: 0
    });
    return ytd;
  }, [quailOverviewData]);

  const tempeOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("prabumenang")) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { 
        month: m, 
        qty_mentah: 0, 
        omzet_mentah: 0, 
        qty_olahan: 0, 
        omzet_olahan: 0, 
        omzet_lainnya: 0,
        total_omzet: 0
      };
    });

    salesData.forEach(row => {
      let monthStr = (row.Bulan || '').toUpperCase();
      if (monthStr.includes('JAN')) monthStr = 'JAN';
      if (monthStr.includes('FEB')) monthStr = 'FEB';
      if (monthStr.includes('MAR')) monthStr = 'MAR';
      if (monthStr.includes('APR')) monthStr = 'APR';
      if (monthStr.includes('MAY') || monthStr.includes('MEI')) monthStr = 'MEI';
      if (monthStr.includes('JUN')) monthStr = 'JUN';
      if (monthStr.includes('JUL')) monthStr = 'JUL';
      if (monthStr.includes('AUG') || monthStr.includes('AGS')) monthStr = 'AUG';
      if (monthStr.includes('SEP')) monthStr = 'SEP';
      if (monthStr.includes('OCT') || monthStr.includes('OKT')) monthStr = 'OKT';
      if (monthStr.includes('NOV')) monthStr = 'NOV';
      if (monthStr.includes('DEC') || monthStr.includes('DES')) monthStr = 'DES';

      const monthIdx = MAGGOT_MONTH_NAMES.indexOf(monthStr);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const prod = (row.Produk || '').toLowerCase();
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;

        if (prod.includes('tempe mentah')) {
          dataMap[monthIdx].qty_mentah += qty;
          dataMap[monthIdx].omzet_mentah += omzet;
        } else if (prod.includes('olahan')) {
          dataMap[monthIdx].qty_olahan += qty;
          dataMap[monthIdx].omzet_olahan += omzet;
        } else {
          dataMap[monthIdx].omzet_lainnya += omzet;
        }
        
        dataMap[monthIdx].total_omzet += omzet;
      }
    });

    // Calculate Average Price per month
    Object.values(dataMap).forEach(d => {
      d.avg_harga_mentah = d.qty_mentah > 0 ? Math.round(d.omzet_mentah / d.qty_mentah) : 0;
      d.avg_harga_olahan = d.qty_olahan > 0 ? Math.round(d.omzet_olahan / d.qty_olahan) : 0;
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const tempeYTD = useMemo(() => {
    const ytd = tempeOverviewData.reduce((acc, curr) => {
      acc.total_omzet += curr.total_omzet;
      acc.total_qty_mentah += curr.qty_mentah;
      acc.total_qty_olahan += curr.qty_olahan;
      acc.total_omzet_mentah += curr.omzet_mentah;
      acc.total_omzet_olahan += curr.omzet_olahan;
      acc.total_omzet_lainnya += curr.omzet_lainnya;
      return acc;
    }, { 
      total_omzet: 0, 
      total_qty_mentah: 0, 
      total_qty_olahan: 0,
      total_omzet_mentah: 0,
      total_omzet_olahan: 0,
      total_omzet_lainnya: 0
    });
    return ytd;
  }, [tempeOverviewData]);



  return {
    currentYear,
    isSalesProgram,
    maggotBioconversionData,
    maggotFinancialData,
    maggotPortfolioData,
    dynamicSalesChartData,
    totalWasteManaged,
    totalOmzet,
    fisheryOverviewData,
    fisheryPortfolioRaw,
    fisheryYTD,
    pembibitanOverviewData,
    pembibitanYTD,
    quailOverviewData,
    quailYTD,
    tempeOverviewData,
    tempeYTD
  };
}
