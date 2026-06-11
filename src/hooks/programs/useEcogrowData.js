import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useEcogrowData() {
  const { selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

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



  return { ecogrowOverviewData, ecogrowYTD, currentYear };
}