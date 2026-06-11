import { useMemo } from 'react';
import useAppStore from '../store/useAppStore';

export const MAGGOT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];

export function useSharedDashboard() {
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
  }, [isSalesProgram, selectedProgram, salesData, currYearSalesData]);

  return {
    selectedProgram,
    selectedDate,
    programContext,
    salesData,
    currentYear,
    prevYear,
    selectedMonthIdx,
    currYearSalesData,
    prevYearSalesData,
    isSalesProgram,
    dynamicSalesChartData
  };
}

