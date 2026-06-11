import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useTempeData() {
  const { selectedProgram, salesData, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

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
  return { tempeOverviewData, tempeYTD, currentYear };
}