import { useMemo } from 'react';
import useAppStore from '../store/useAppStore';

const MAGGOT_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];

export function useDashboardData() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const programContext = useAppStore((state) => state.programContext);
  
  // Dummy data for yearly progress and sales
  // In a real app, this might come from the store or API
  const currentYear = selectedDate ? selectedDate.split('-')[0] : new Date().getFullYear().toString();
  const yearlyProgress = useMemo(() => {
    if (!programContext?.id) return [];
    return [{ id: 1, period_date: `${currentYear}-01-01` }];
  }, [programContext?.id, currentYear]);
  
  const yearlySales = useMemo(() => [], []);

  const isSalesProgram = useMemo(() => [
    "Budidaya Maggot BSF", "Budidaya Ikan Air Tawar", "SIBA Pembibitan", 
    "Budidaya Puyuh Petelur (Seleman)", "Budidaya Puyuh Petelur (Darmo)", 
    "EcoGrow Mom Utun Makmur", "Poktan Cahaya Tani", "Budidaya Itik Petelur"
  ].includes(selectedProgram), [selectedProgram]);

  const maggotBioconversionData = useMemo(() => {
    if (selectedProgram !== "Budidaya Maggot BSF") return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, sampah: 0, maggot: 0 }; });

    yearlyProgress.forEach(p => {
      const monthIdx = new Date(p.period_date).getMonth();
      if (dataMap[monthIdx]) {
        dataMap[monthIdx].sampah += (Number(p.extra_fields?.sampah_organik) || 0);
        const sales = yearlySales.filter(s => s.monthly_progress_id === p.id && s.product_name === "Fresh Maggot");
        dataMap[monthIdx].maggot += sales.reduce((sum, s) => sum + (s.qty || 0), 0);
      }
    });
    const validData = Object.values(dataMap).filter(item => item.sampah > 0 || item.maggot > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [selectedProgram, yearlyProgress, yearlySales]);

  const maggotFinancialData = useMemo(() => {
    if (selectedProgram !== "Budidaya Maggot BSF") return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, fresh: 0, kering: 0, kasgot: 0, omzet: 0 }; });

    yearlyProgress.forEach(p => {
      const monthIdx = new Date(p.period_date).getMonth();
      if (dataMap[monthIdx]) {
        const sales = yearlySales.filter(s => s.monthly_progress_id === p.id);
        sales.forEach(s => {
          if (s.product_name === "Fresh Maggot") dataMap[monthIdx].fresh += (s.qty || 0);
          if (s.product_name === "Maggot Kering") dataMap[monthIdx].kering += (s.qty || 0);
          if (s.product_name === "Kasgot") dataMap[monthIdx].kasgot += (s.qty || 0);
          dataMap[monthIdx].omzet += (s.revenue || 0);
        });
      }
    });
    const validData = Object.values(dataMap).filter(item => item.omzet > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [selectedProgram, yearlyProgress, yearlySales]);

  const maggotPortfolioData = useMemo(() => {
    if (selectedProgram !== "Budidaya Maggot BSF") return [];
    let freshRev = 0, keringRev = 0, kasgotRev = 0;
    yearlyProgress.forEach(p => {
      const sales = yearlySales.filter(s => s.monthly_progress_id === p.id);
      sales.forEach(s => {
        if (s.product_name === "Fresh Maggot") freshRev += (s.revenue || 0);
        if (s.product_name === "Maggot Kering") keringRev += (s.revenue || 0);
        if (s.product_name === "Kasgot") kasgotRev += (s.revenue || 0);
      });
    });
    return [
      { name: 'Fresh Maggot', value: freshRev, color: '#eab308' },
      { name: 'Maggot Kering', value: keringRev, color: '#f59e0b' },
      { name: 'Kasgot', value: kasgotRev, color: '#1e3a8a' },
    ].filter(item => item.value > 0);
  }, [selectedProgram, yearlyProgress, yearlySales]);

  const dynamicSalesChartData = useMemo(() => {
    if (!isSalesProgram || selectedProgram === "Budidaya Maggot BSF") return [];
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { dataMap[i] = { bulan: m, Omzet: 0 }; });

    yearlyProgress.forEach(p => {
      const monthIdx = new Date(p.period_date).getMonth();
      if (dataMap[monthIdx]) {
        const sales = yearlySales.filter(s => s.monthly_progress_id === p.id);
        dataMap[monthIdx].Omzet += sales.reduce((sum, s) => sum + (s.revenue || 0), 0);
      }
    });
    const validData = Object.values(dataMap).filter(item => item.Omzet > 0);
    return validData.length > 0 ? Object.values(dataMap).slice(0, Math.max(5, validData.length)) : Object.values(dataMap).slice(0, 5);
  }, [isSalesProgram, selectedProgram, yearlyProgress, yearlySales]);

  const totalWasteManaged = useMemo(() => {
    return maggotBioconversionData.reduce((sum, item) => sum + item.sampah, 0);
  }, [maggotBioconversionData]);

  const totalOmzet = useMemo(() => {
    return maggotPortfolioData.reduce((sum, item) => sum + item.value, 0);
  }, [maggotPortfolioData]);

  return {
    isSalesProgram,
    maggotBioconversionData,
    maggotFinancialData,
    maggotPortfolioData,
    dynamicSalesChartData,
    totalWasteManaged,
    totalOmzet
  };
}
