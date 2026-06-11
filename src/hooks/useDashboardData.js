import { useMemo } from 'react';
import useAppStore from '../store/useAppStore';

const MAGGOT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];

export function useDashboardData() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const programContext = useAppStore((state) => state.programContext);
  
  const salesData = useAppStore((state) => state.salesData) || [];
  
  const currentYear = selectedDate ? selectedDate.split('-')[0] : new Date().getFullYear().toString();
  const prevYear = (Number(currentYear) - 1).toString();
  const selectedMonthIdx = selectedDate ? new Date(selectedDate).getMonth() : new Date().getMonth();

  const currYearSalesData = useMemo(() => salesData.filter(d => String(d.Tahun) === currentYear), [salesData, currentYear]);
  const prevYearSalesData = useMemo(() => salesData.filter(d => String(d.Tahun) === prevYear), [salesData, prevYear]);

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

    currYearSalesData.forEach(row => {
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

    currYearSalesData.forEach(row => {
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
    currYearSalesData.forEach(row => {
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

    currYearSalesData.forEach(row => {
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

  const maggotYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("maggot")) return { currWaste: 0, prevWaste: 0, currFresh: 0, prevFresh: 0, currOmzet: 0, prevOmzet: 0 };
    
    let currWaste = 0, prevWaste = 0, currFresh = 0, prevFresh = 0, currOmzet = 0, prevOmzet = 0;

    const processRow = (row, isPrev) => {
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
          if (isPrev) prevWaste += (Number(row['Value Operasional']) || 0);
          else currWaste += (Number(row['Value Operasional']) || 0);
        }
        if (row.Produk === "Fresh Maggot") {
          if (isPrev) prevFresh += (Number(row.Jumlah) || 0);
          else currFresh += (Number(row.Jumlah) || 0);
        }
        if (row.Produk === "Fresh Maggot" || row.Produk === "Maggot Kering" || row.Produk === "Kasgot") {
          if (isPrev) prevOmzet += (Number(row.Omzet) || 0);
          else currOmzet += (Number(row.Omzet) || 0);
        }
      }
    };

    currYearSalesData.forEach(r => processRow(r, false));
    prevYearSalesData.forEach(r => processRow(r, true));

    return { currWaste, prevWaste, currFresh, prevFresh, currOmzet, prevOmzet };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

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

    currYearSalesData.forEach(row => {
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

    currYearSalesData.forEach(row => {
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
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("ikan air tawar")) return { currKonsumsi: 0, prevKonsumsi: 0, currBibit: 0, prevBibit: 0, currRevenue: 0, prevRevenue: 0 };
    
    let currKonsumsi = 0, prevKonsumsi = 0, currBibit = 0, prevBibit = 0, currRevenue = 0, prevRevenue = 0;

    const processRow = (row, isPrev) => {
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
          if (isPrev) { prevKonsumsi += qty; prevRevenue += omzet; }
          else { currKonsumsi += qty; currRevenue += omzet; }
        } else if (cat === 'bibit ikan') {
          if (isPrev) { prevBibit += qty; prevRevenue += omzet; }
          else { currBibit += qty; currRevenue += omzet; }
        }
      }
    };

    currYearSalesData.forEach(r => processRow(r, false));
    prevYearSalesData.forEach(r => processRow(r, true));

    return { currKonsumsi, prevKonsumsi, currBibit, prevBibit, currRevenue, prevRevenue };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

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

    currYearSalesData.forEach(row => {
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
        const op = (row.Operasional || '').toLowerCase();
        if (op === "pembesaran_batang" || op === "pembesaran bibit") {
          dataMap[monthIdx].pembesaran_batang += (Number(row['Value Operasional']) || 0);
        }

        const cat = (row['Kategori Produk'] || '').toLowerCase();
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        const harga = Number(row['Harga Satuan']) || 0;

        if (cat === 'bibit_tanaman' || cat === 'bibit tanaman') {
          dataMap[monthIdx].penjualan_batang += qty;
          dataMap[monthIdx].bibit_omzet += omzet;
          if (qty > 0 && harga > 0) {
            dataMap[monthIdx].bibit_count_for_avg += 1;
            dataMap[monthIdx].sum_harga_bibit += harga;
          }
        } else if (cat === 'produk_lainnya' || cat === 'media tanam') {
          dataMap[monthIdx].polybag_sold += qty;
          dataMap[monthIdx].polybag_omzet += omzet;
        }
        
        if (cat === 'bibit_tanaman' || cat === 'bibit tanaman' || cat === 'produk_lainnya' || cat === 'media tanam') {
          dataMap[monthIdx].total_rp += omzet;
        }
      }
    });

    const result = Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx).map(d => ({
      ...d,
      avg_harga_bibit: d.bibit_count_for_avg > 0 ? (d.sum_harga_bibit / d.bibit_count_for_avg) : 0
    }));
    
    return result;
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const pembibitanYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("siba pembibitan")) return { 
      currPembesaran: 0, prevPembesaran: 0,
      currPenjualan: 0, prevPenjualan: 0,
      currPolybag: 0, prevPolybag: 0,
      currRevenue: 0, prevRevenue: 0,
      currBibitOmzet: 0, prevBibitOmzet: 0,
      currPolybagOmzet: 0, prevPolybagOmzet: 0
    };
    
    let currPembesaran = 0, prevPembesaran = 0,
        currPenjualan = 0, prevPenjualan = 0,
        currPolybag = 0, prevPolybag = 0,
        currRevenue = 0, prevRevenue = 0,
        currBibitOmzet = 0, prevBibitOmzet = 0,
        currPolybagOmzet = 0, prevPolybagOmzet = 0;

    let currLastValidMonth = -1;
    let prevLastValidMonth = -1;
    let currPembesaranMap = {};
    let prevPembesaranMap = {};

    const processRow = (row, isPrev) => {
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
        
        let hasData = false;

        const op = (row.Operasional || '').toLowerCase();
        if (op === "pembesaran_batang" || op === "pembesaran bibit") {
          const val = Number(row['Value Operasional']) || 0;
          if (isPrev) {
            prevPembesaranMap[monthIdx] = (prevPembesaranMap[monthIdx] || 0) + val;
          } else {
            currPembesaranMap[monthIdx] = (currPembesaranMap[monthIdx] || 0) + val;
          }
          if (val > 0) hasData = true;
        }

        if (cat === 'bibit_tanaman' || cat === 'bibit tanaman') {
          if (isPrev) { prevPenjualan += qty; prevBibitOmzet += omzet; prevRevenue += omzet; }
          else { currPenjualan += qty; currBibitOmzet += omzet; currRevenue += omzet; }
          if (qty > 0 || omzet > 0) hasData = true;
        } else if (cat === 'produk_lainnya' || cat === 'media tanam') {
          if (isPrev) { prevPolybag += qty; prevPolybagOmzet += omzet; prevRevenue += omzet; }
          else { currPolybag += qty; currPolybagOmzet += omzet; currRevenue += omzet; }
          if (qty > 0 || omzet > 0) hasData = true;
        }

        if (hasData) {
          if (isPrev) {
             if (monthIdx > prevLastValidMonth) prevLastValidMonth = monthIdx;
          } else {
             if (monthIdx > currLastValidMonth) currLastValidMonth = monthIdx;
          }
        }
      }
    };

    currYearSalesData.forEach(r => processRow(r, false));
    prevYearSalesData.forEach(r => processRow(r, true));

    if (currLastValidMonth !== -1 && currPembesaranMap[currLastValidMonth] !== undefined) {
      currPembesaran = currPembesaranMap[currLastValidMonth];
    }
    if (prevLastValidMonth !== -1 && prevPembesaranMap[prevLastValidMonth] !== undefined) {
      prevPembesaran = prevPembesaranMap[prevLastValidMonth];
    }

    return { 
      currPembesaran, prevPembesaran, 
      currPenjualan, prevPenjualan, 
      currPolybag, prevPolybag, 
      currRevenue, prevRevenue,
      currBibitOmzet, prevBibitOmzet,
      currPolybagOmzet, prevPolybagOmzet
    };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

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

    currYearSalesData.forEach(row => {
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
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("puyuh")) return {
      total_omzet: 0, prev_total_omzet: 0,
      total_qty_telur: 0, prev_total_qty_telur: 0,
      total_qty_kohe: 0, prev_total_qty_kohe: 0,
      total_omzet_telur: 0, prev_total_omzet_telur: 0,
      total_omzet_kohe: 0, prev_total_omzet_kohe: 0,
      total_omzet_lainnya: 0, prev_total_omzet_lainnya: 0
    };

    let total_omzet = 0, prev_total_omzet = 0,
        total_qty_telur = 0, prev_total_qty_telur = 0,
        total_qty_kohe = 0, prev_total_qty_kohe = 0,
        total_omzet_telur = 0, prev_total_omzet_telur = 0,
        total_omzet_kohe = 0, prev_total_omzet_kohe = 0,
        total_omzet_lainnya = 0, prev_total_omzet_lainnya = 0;

    const processRow = (row, isPrev) => {
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
          if (isPrev) { prev_total_qty_telur += qty; prev_total_omzet_telur += omzet; }
          else { total_qty_telur += qty; total_omzet_telur += omzet; }
        } else if (fullProdStr.includes('kohe') || fullProdStr.includes('kotoran') || fullProdStr.includes('pupuk')) {
          if (isPrev) { prev_total_qty_kohe += qty; prev_total_omzet_kohe += omzet; }
          else { total_qty_kohe += qty; total_omzet_kohe += omzet; }
        } else {
          if (isPrev) { prev_total_omzet_lainnya += omzet; }
          else { total_omzet_lainnya += omzet; }
        }
        
        if (isPrev) { prev_total_omzet += omzet; }
        else { total_omzet += omzet; }
      }
    };

    currYearSalesData.forEach(row => processRow(row, false));
    prevYearSalesData.forEach(row => processRow(row, true));

    return {
      total_omzet, prev_total_omzet,
      total_qty_telur, prev_total_qty_telur,
      total_qty_kohe, prev_total_qty_kohe,
      total_omzet_telur, prev_total_omzet_telur,
      total_omzet_kohe, prev_total_omzet_kohe,
      total_omzet_lainnya, prev_total_omzet_lainnya
    };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

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

    currYearSalesData.forEach(row => {
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

  const ecogrowOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("ecogrow")) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { 
        month: m, 
        total_omzet: 0, 
        items: {} 
      };
    });

    currYearSalesData.forEach(row => {
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
        const prod = (row.Produk || '').trim() || 'Lainnya';
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        const harga = Number(row['Harga Satuan']) || 0;
        const unit = row.Satuan_1 || row.Satuan || ''; 

        dataMap[monthIdx].total_omzet += omzet;
        
        if (!dataMap[monthIdx].items[prod]) {
          dataMap[monthIdx].items[prod] = { qty: 0, omzet: 0, unit: unit, harga: harga };
        }
        dataMap[monthIdx].items[prod].qty += qty;
        dataMap[monthIdx].items[prod].omzet += omzet;
        dataMap[monthIdx].items[prod].unit = unit; 
        dataMap[monthIdx].items[prod].harga = Math.max(dataMap[monthIdx].items[prod].harga, harga);
      }
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, currYearSalesData, selectedMonthIdx]);

  const ecogrowYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("ecogrow")) return {
      total_omzet: 0, prev_total_omzet: 0,
      items: {}
    };

    let total_omzet = 0, prev_total_omzet = 0;
    const items = {};

    const processRow = (row, isPrev) => {
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
        const prod = (row.Produk || '').trim() || 'Lainnya';
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        const unit = row.Satuan_1 || row.Satuan || '';

        if (isPrev) {
          prev_total_omzet += omzet;
        } else {
          total_omzet += omzet;
          if (!items[prod]) items[prod] = { qty: 0, omzet: 0, unit: unit };
          items[prod].qty += qty;
          items[prod].omzet += omzet;
          items[prod].unit = unit;
        }
      }
    };

    currYearSalesData.forEach(row => processRow(row, false));
    prevYearSalesData.forEach(row => processRow(row, true));

    return { total_omzet, prev_total_omzet, items };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);




  const cahayaTaniOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes('cahaya tani')) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => {
      dataMap[i] = {
        month: m,
        sawit_omzet: 0, sawit_vol: 0, sawit_count: 0, sawit_harga: 0,
        kayu_putih_omzet: 0, kayu_putih_vol: 0, kayu_putih_count: 0, kayu_putih_harga: 0,
        lainnya_omzet: 0, lainnya_vol: 0,
        total_omzet: 0, total_vol: 0, pembesaran_vol: 0
      };
    });

    currYearSalesData.forEach(row => {
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
        const op = (row.Operasional || '').toLowerCase();
        if (op === 'penjualan') {
          const omzet = Number(row.Omzet) || 0;
          const qty = Number(row.Jumlah) || 0;
          const harga = Number(row['Harga Satuan']) || 0;
          const prod = (row.Produk || '').toLowerCase();

          dataMap[monthIdx].total_omzet += omzet;
          dataMap[monthIdx].total_vol += qty;

          if (prod.includes('sawit')) {
            dataMap[monthIdx].sawit_omzet += omzet;
            dataMap[monthIdx].sawit_vol += qty;
            if (qty > 0) {
              dataMap[monthIdx].sawit_harga += harga;
              dataMap[monthIdx].sawit_count += 1;
            }
          } else if (prod.includes('kayu putih')) {
            dataMap[monthIdx].kayu_putih_omzet += omzet;
            dataMap[monthIdx].kayu_putih_vol += qty;
            if (qty > 0) {
              dataMap[monthIdx].kayu_putih_harga += harga;
              dataMap[monthIdx].kayu_putih_count += 1;
            }
          } else {
            dataMap[monthIdx].lainnya_omzet += omzet;
            dataMap[monthIdx].lainnya_vol += qty;
          }
        } else if (op === 'pembesaran bibit') {
          const val = Number(row['Value Operasional']) || 0;
          dataMap[monthIdx].pembesaran_vol += val;
        }
      }
    });

    Object.keys(dataMap).forEach(k => {
      const d = dataMap[k];
      if (d.sawit_count > 0) d.sawit_harga = Math.round(d.sawit_harga / d.sawit_count);
      if (d.kayu_putih_count > 0) d.kayu_putih_harga = Math.round(d.kayu_putih_harga / d.kayu_putih_count);
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, currYearSalesData, selectedMonthIdx]);

  const cahayaTaniYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes('cahaya tani')) return {
      total_omzet: 0, prev_total_omzet: 0,
      total_vol: 0, prev_total_vol: 0,
      sawit_omzet: 0, kayu_putih_omzet: 0, lainnya_omzet: 0,
      sawit_vol: 0, kayu_putih_vol: 0, lainnya_vol: 0,
      total_pembesaran: 0, prev_total_pembesaran: 0,
      items: {}
    };

    let total_omzet = 0, prev_total_omzet = 0;
    let total_vol = 0, prev_total_vol = 0;
    let total_pembesaran = 0, prev_total_pembesaran = 0;
    let sawit_omzet = 0, kayu_putih_omzet = 0, lainnya_omzet = 0;
    let sawit_vol = 0, kayu_putih_vol = 0, lainnya_vol = 0;
    const items = {};

    const processRow = (row, isPrev) => {
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
        const op = (row.Operasional || '').toLowerCase();
        if (op === 'penjualan') {
          const omzet = Number(row.Omzet) || 0;
          const qty = Number(row.Jumlah) || 0;
          const prod = (row.Produk || '');
          const prodLower = prod.toLowerCase();

          if (isPrev) {
            prev_total_omzet += omzet;
            prev_total_vol += qty;
          } else {
            total_omzet += omzet;
            total_vol += qty;

            if (prodLower.includes('sawit')) {
              sawit_omzet += omzet;
              sawit_vol += qty;
            } else if (prodLower.includes('kayu putih')) {
              kayu_putih_omzet += omzet;
              kayu_putih_vol += qty;
            } else {
              lainnya_omzet += omzet;
              lainnya_vol += qty;
              if (!items[prod]) items[prod] = { omzet: 0, vol: 0 };
              items[prod].omzet += omzet;
              items[prod].vol += qty;
            }
          }
        } else if (op === 'pembesaran bibit') {
          const val = Number(row['Value Operasional']) || 0;
          if (isPrev) {
            prev_total_pembesaran += val;
          } else {
            total_pembesaran += val;
          }
        }
      }
    };

    currYearSalesData.forEach(row => processRow(row, false));
    prevYearSalesData.forEach(row => processRow(row, true));

    return {
      total_omzet, prev_total_omzet, total_vol, prev_total_vol,
      total_pembesaran, prev_total_pembesaran,
      sawit_omzet, kayu_putih_omzet, lainnya_omzet,
      sawit_vol, kayu_putih_vol, lainnya_vol,
      items
    };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

  return {
    currentYear,
    isSalesProgram,
    maggotBioconversionData,
    maggotFinancialData,
    maggotPortfolioData,
    maggotYTD,
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
    tempeYTD,
    ecogrowOverviewData,
    ecogrowYTD,
    cahayaTaniOverviewData,
    cahayaTaniYTD
  };
}
