import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useMaggotData() {
  const { selectedProgram, salesData, currYearSalesData, prevYearSalesData, selectedMonthIdx, isSalesProgram, currentYear } = useSharedDashboard();

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

  return { maggotBioconversionData, maggotFinancialData, maggotPortfolioData, totalWasteManaged, totalOmzet, maggotYTD, currentYear };
}
