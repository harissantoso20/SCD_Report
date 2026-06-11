import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useQuailData() {
  const { selectedProgram, salesData, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

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

  return { quailOverviewData, quailYTD, currentYear };
}

