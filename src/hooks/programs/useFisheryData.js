import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useFisheryData() {
  const { selectedProgram, salesData, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

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

  return { fisheryOverviewData, fisheryPortfolioRaw, fisheryYTD, currentYear };
}

