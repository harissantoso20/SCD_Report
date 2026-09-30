import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useLingkarTambangData() {
  const { 
    selectedProgram, 
    currYearSalesData, 
    prevYearSalesData, 
    selectedMonthIdx, 
    currentYear 
  } = useSharedDashboard();

  // Helper to parse month index safely
  const parseMonthIdx = (monthStr) => {
    if (!monthStr) return -1;
    const m = monthStr.toUpperCase();
    if (m.includes('JAN')) return 0;
    if (m.includes('FEB')) return 1;
    if (m.includes('MAR')) return 2;
    if (m.includes('APR')) return 3;
    if (m.includes('MAY') || m.includes('MEI')) return 4;
    if (m.includes('JUN')) return 5;
    if (m.includes('JUL')) return 6;
    if (m.includes('AUG') || m.includes('AGS') || m.includes('AGU')) return 7;
    if (m.includes('SEP')) return 8;
    if (m.includes('OCT') || m.includes('OKT')) return 9;
    if (m.includes('NOV')) return 10;
    if (m.includes('DEC') || m.includes('DES')) return 11;
    return -1;
  };

  // 1. Monthly Overview Data for Current Year (up to selectedMonthIdx)
  const lingkarTambangOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes('lingkar tambang')) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => {
      dataMap[i] = {
        month: m,
        panen_kg: 0,
        panen_buah: 0,
        penjualan_kg: 0,
        penjualan_buah: 0,
        omzet: 0,
        biaya_operasional: 0,
        laba_bersih: 0,
        absorption_rate: 0,
        avg_weight: 0,
        avg_price: 0
      };
    });

    currYearSalesData.forEach(row => {
      const monthIdx = parseMonthIdx(row.Bulan);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
        const op = (row.Operasional || '').toLowerCase().trim();
        const jumlah = Number(row.Jumlah) || 0;
        const valueOp = Number(row['Value Operasional']) || 0;
        const omzet = Number(row.Omzet) || 0;

        if (cat === 'panen' || op === 'panen' || op.includes('panen')) {
          dataMap[monthIdx].panen_kg += jumlah;
          dataMap[monthIdx].panen_buah += valueOp;
        } else if (cat === 'penjualan' || op === 'penjualan' || op.includes('penjualan')) {
          dataMap[monthIdx].penjualan_kg += jumlah;
          dataMap[monthIdx].penjualan_buah += valueOp;
          dataMap[monthIdx].omzet += omzet;
        } else if (cat === 'operasional' || op === 'operasional' || op.includes('operasional')) {
          dataMap[monthIdx].biaya_operasional += omzet;
        } else {
          // Fallback if category is direct product name
          if (omzet > 0) {
            dataMap[monthIdx].penjualan_kg += jumlah;
            dataMap[monthIdx].penjualan_buah += valueOp;
            dataMap[monthIdx].omzet += omzet;
          } else if (jumlah > 0) {
            dataMap[monthIdx].panen_kg += jumlah;
            dataMap[monthIdx].panen_buah += valueOp;
          }
        }
      }
    });

    Object.keys(dataMap).forEach(k => {
      const d = dataMap[k];
      d.laba_bersih = d.omzet - d.biaya_operasional;
      d.absorption_rate = d.panen_kg > 0 ? Math.min(100, Math.round((d.penjualan_kg / d.panen_kg) * 100)) : (d.penjualan_kg > 0 ? 100 : 0);
      d.avg_weight = d.panen_buah > 0 ? parseFloat((d.panen_kg / d.panen_buah).toFixed(2)) : 0;
      d.avg_price = d.penjualan_kg > 0 ? Math.round(d.omzet / d.penjualan_kg) : 0;
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, currYearSalesData, selectedMonthIdx]);

  // 2. YTD Cumulative Data (Current Year vs Previous Year)
  const lingkarTambangYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    const emptyResult = {
      total_panen_kg: 0, prev_total_panen_kg: 0,
      total_panen_buah: 0, prev_total_panen_buah: 0,
      total_penjualan_kg: 0, prev_total_penjualan_kg: 0,
      total_penjualan_buah: 0, prev_total_penjualan_buah: 0,
      total_omzet: 0, prev_total_omzet: 0,
      total_operasional: 0, prev_total_operasional: 0,
      total_laba_bersih: 0, prev_total_laba_bersih: 0,
      avg_bobot_buah: 0,
      avg_harga_jual: 0,
      sell_through_rate: 0,
      product_mix: []
    };

    if (!p.includes('lingkar tambang')) return emptyResult;

    let total_panen_kg = 0;
    let total_panen_buah = 0;
    let total_penjualan_kg = 0;
    let total_penjualan_buah = 0;
    let total_omzet = 0;
    let total_operasional = 0;

    const varietyMap = {};

    currYearSalesData.forEach(row => {
      const monthIdx = parseMonthIdx(row.Bulan);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
        const op = (row.Operasional || '').toLowerCase().trim();
        const prod = (row.Produk || '').trim() || 'Melon';
        const jumlah = Number(row.Jumlah) || 0;
        const valueOp = Number(row['Value Operasional']) || 0;
        const omzet = Number(row.Omzet) || 0;

        if (cat === 'panen' || op === 'panen' || op.includes('panen')) {
          total_panen_kg += jumlah;
          total_panen_buah += valueOp;
          if (prod && prod !== '-') {
            if (!varietyMap[prod]) varietyMap[prod] = { name: prod, panen_kg: 0, panen_buah: 0, penjualan_kg: 0, omzet: 0 };
            varietyMap[prod].panen_kg += jumlah;
            varietyMap[prod].panen_buah += valueOp;
          }
        } else if (cat === 'penjualan' || op === 'penjualan' || op.includes('penjualan')) {
          total_penjualan_kg += jumlah;
          total_penjualan_buah += valueOp;
          total_omzet += omzet;
          if (prod && prod !== '-') {
            if (!varietyMap[prod]) varietyMap[prod] = { name: prod, panen_kg: 0, panen_buah: 0, penjualan_kg: 0, omzet: 0 };
            varietyMap[prod].penjualan_kg += jumlah;
            varietyMap[prod].omzet += omzet;
          }
        } else if (cat === 'operasional' || op === 'operasional' || op.includes('operasional')) {
          total_operasional += omzet;
        } else {
          if (omzet > 0) {
            total_penjualan_kg += jumlah;
            total_penjualan_buah += valueOp;
            total_omzet += omzet;
            if (prod && prod !== '-') {
              if (!varietyMap[prod]) varietyMap[prod] = { name: prod, panen_kg: 0, panen_buah: 0, penjualan_kg: 0, omzet: 0 };
              varietyMap[prod].penjualan_kg += jumlah;
              varietyMap[prod].omzet += omzet;
            }
          } else if (jumlah > 0) {
            total_panen_kg += jumlah;
            total_panen_buah += valueOp;
            if (prod && prod !== '-') {
              if (!varietyMap[prod]) varietyMap[prod] = { name: prod, panen_kg: 0, panen_buah: 0, penjualan_kg: 0, omzet: 0 };
              varietyMap[prod].panen_kg += jumlah;
              varietyMap[prod].panen_buah += valueOp;
            }
          }
        }
      }
    });

    // Previous year YTD
    let prev_total_panen_kg = 0;
    let prev_total_panen_buah = 0;
    let prev_total_penjualan_kg = 0;
    let prev_total_penjualan_buah = 0;
    let prev_total_omzet = 0;
    let prev_total_operasional = 0;

    prevYearSalesData.forEach(row => {
      const monthIdx = parseMonthIdx(row.Bulan);
      if (monthIdx !== -1 && monthIdx <= selectedMonthIdx) {
        const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
        const op = (row.Operasional || '').toLowerCase().trim();
        const jumlah = Number(row.Jumlah) || 0;
        const valueOp = Number(row['Value Operasional']) || 0;
        const omzet = Number(row.Omzet) || 0;

        if (cat === 'panen' || op === 'panen' || op.includes('panen')) {
          prev_total_panen_kg += jumlah;
          prev_total_panen_buah += valueOp;
        } else if (cat === 'penjualan' || op === 'penjualan' || op.includes('penjualan')) {
          prev_total_penjualan_kg += jumlah;
          prev_total_penjualan_buah += valueOp;
          prev_total_omzet += omzet;
        } else if (cat === 'operasional' || op === 'operasional' || op.includes('operasional')) {
          prev_total_operasional += omzet;
        }
      }
    });

    const total_laba_bersih = total_omzet - total_operasional;
    const prev_total_laba_bersih = prev_total_omzet - prev_total_operasional;

    const avg_bobot_buah = total_panen_buah > 0 ? parseFloat((total_panen_kg / total_panen_buah).toFixed(2)) : 0;
    const avg_harga_jual = total_penjualan_kg > 0 ? Math.round(total_omzet / total_penjualan_kg) : 0;
    const sell_through_rate = total_panen_kg > 0 ? parseFloat(((total_penjualan_kg / total_panen_kg) * 100).toFixed(1)) : (total_penjualan_kg > 0 ? 100 : 0);

    const product_mix = Object.values(varietyMap)
      .map(v => ({
        ...v,
        percent_omzet: total_omzet > 0 ? Math.round((v.omzet / total_omzet) * 100) : 0,
        percent_panen: total_panen_kg > 0 ? Math.round((v.panen_kg / total_panen_kg) * 100) : 0
      }))
      .sort((a, b) => b.omzet - a.omzet);

    return {
      total_panen_kg,
      prev_total_panen_kg,
      total_panen_buah,
      prev_total_panen_buah,
      total_penjualan_kg,
      prev_total_penjualan_kg,
      total_penjualan_buah,
      prev_total_penjualan_buah,
      total_omzet,
      prev_total_omzet,
      total_operasional,
      prev_total_operasional,
      total_laba_bersih,
      prev_total_laba_bersih,
      avg_bobot_buah,
      avg_harga_jual,
      sell_through_rate,
      product_mix
    };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

  return {
    lingkarTambangOverviewData,
    lingkarTambangYTD,
    currentYear,
    selectedMonthIdx
  };
}
