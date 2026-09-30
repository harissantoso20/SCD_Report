import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

// Helper: parse month string to index 0-11
function parseMonthIdx(monthStr) {
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
}

export function useRasSystemData() {
  const {
    selectedProgram,
    currYearSalesData,
    prevYearSalesData,
    selectedMonthIdx,
    currentYear
  } = useSharedDashboard();

  const isRas = (selectedProgram || '').toLowerCase().includes('ras system');

  // --- 1. Monthly overview data (trend chart) ---
  const rasMonthlyData = useMemo(() => {
    if (!isRas) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => {
      dataMap[i] = {
        month: m,
        // Ikan
        pembesaran_ekor: 0,
        ikan_kg: 0,
        ikan_omzet: 0,
        // Sayur
        sayur_kg: 0,
        sayur_omzet: 0,
        // Biaya
        biaya_operasional: 0,
        // Total
        total_omzet: 0,
        laba_bersih: 0,
      };
    });

    currYearSalesData.forEach(row => {
      const monthIdx = parseMonthIdx(row.Bulan);
      if (monthIdx === -1 || monthIdx > selectedMonthIdx) return;

      const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
      const qty = Number(row.Jumlah) || 0;
      const omzet = Number(row.Omzet) || 0;
      const satuan = (row.Satuan_1 || '').toLowerCase();

      if (cat === 'pembesaran_ikan' || cat === 'pembesaran ikan') {
        dataMap[monthIdx].pembesaran_ekor += qty;
      } else if (cat === 'ikan_konsumsi' || cat === 'ikan konsumsi') {
        dataMap[monthIdx].ikan_kg += qty;
        dataMap[monthIdx].ikan_omzet += omzet;
        dataMap[monthIdx].total_omzet += omzet;
      } else if (cat === 'sayur_hidroponik' || cat === 'sayur hidroponik') {
        dataMap[monthIdx].sayur_kg += qty;
        dataMap[monthIdx].sayur_omzet += omzet;
        dataMap[monthIdx].total_omzet += omzet;
      } else if (cat === 'operasional') {
        dataMap[monthIdx].biaya_operasional += omzet;
      }
    });

    Object.values(dataMap).forEach(d => {
      d.laba_bersih = d.total_omzet - d.biaya_operasional;
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [isRas, currYearSalesData, selectedMonthIdx]);

  // --- 2. Species breakdown (Pie chart data) ---
  const rasSpeciesData = useMemo(() => {
    if (!isRas) return { ikan: [], sayur: [] };

    const ikanMap = {};
    const sayurMap = {};

    currYearSalesData.forEach(row => {
      const monthIdx = parseMonthIdx(row.Bulan);
      if (monthIdx === -1 || monthIdx > selectedMonthIdx) return;

      const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
      const produk = (row.Produk || '').trim() || 'Lainnya';
      const omzet = Number(row.Omzet) || 0;
      const qty = Number(row.Jumlah) || 0;

      if (cat === 'ikan_konsumsi' || cat === 'ikan konsumsi') {
        if (!ikanMap[produk]) ikanMap[produk] = { omzet: 0, qty: 0 };
        ikanMap[produk].omzet += omzet;
        ikanMap[produk].qty += qty;
      } else if (cat === 'sayur_hidroponik' || cat === 'sayur hidroponik') {
        if (!sayurMap[produk]) sayurMap[produk] = { omzet: 0, qty: 0 };
        sayurMap[produk].omzet += omzet;
        sayurMap[produk].qty += qty;
      }
    });

    const FISH_COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
    const SAYUR_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#a3e7c5'];

    const toArray = (map, colors) =>
      Object.entries(map)
        .map(([name, v], i) => ({ name, omzet: v.omzet, qty: v.qty, fill: colors[i % colors.length] }))
        .filter(d => d.omzet > 0 || d.qty > 0)
        .sort((a, b) => b.omzet - a.omzet);

    return {
      ikan: toArray(ikanMap, FISH_COLORS),
      sayur: toArray(sayurMap, SAYUR_COLORS)
    };
  }, [isRas, currYearSalesData, selectedMonthIdx]);

  // --- 3. YTD Aggregation (current year vs prev year) ---
  const rasYTD = useMemo(() => {
    const empty = {
      total_pembesaran_ekor: 0,
      prev_total_pembesaran_ekor: 0,
      total_ikan_kg: 0,
      prev_total_ikan_kg: 0,
      total_ikan_omzet: 0,
      prev_total_ikan_omzet: 0,
      total_sayur_kg: 0,
      prev_total_sayur_kg: 0,
      total_sayur_omzet: 0,
      prev_total_sayur_omzet: 0,
      total_omzet: 0,
      prev_total_omzet: 0,
      total_biaya: 0,
      prev_total_biaya: 0,
      laba_bersih: 0,
      prev_laba_bersih: 0,
      avg_harga_ikan: 0,
      avg_harga_sayur: 0,
    };
    if (!isRas) return empty;

    const aggregate = (data, acc) => {
      data.forEach(row => {
        const monthIdx = parseMonthIdx(row.Bulan);
        if (monthIdx === -1 || monthIdx > selectedMonthIdx) return;

        const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
        const qty = Number(row.Jumlah) || 0;
        const omzet = Number(row.Omzet) || 0;

        if (cat === 'pembesaran_ikan' || cat === 'pembesaran ikan') {
          acc.total_pembesaran_ekor += qty;
        } else if (cat === 'ikan_konsumsi' || cat === 'ikan konsumsi') {
          acc.total_ikan_kg += qty;
          acc.total_ikan_omzet += omzet;
          acc.total_omzet += omzet;
        } else if (cat === 'sayur_hidroponik' || cat === 'sayur hidroponik') {
          acc.total_sayur_kg += qty;
          acc.total_sayur_omzet += omzet;
          acc.total_omzet += omzet;
        } else if (cat === 'operasional') {
          acc.total_biaya += omzet;
        }
      });
    };

    const curr = {
      total_pembesaran_ekor: 0, total_ikan_kg: 0, total_ikan_omzet: 0,
      total_sayur_kg: 0, total_sayur_omzet: 0,
      total_omzet: 0, total_biaya: 0,
    };
    const prev = {
      total_pembesaran_ekor: 0, total_ikan_kg: 0, total_ikan_omzet: 0,
      total_sayur_kg: 0, total_sayur_omzet: 0,
      total_omzet: 0, total_biaya: 0,
    };

    aggregate(currYearSalesData, curr);
    aggregate(prevYearSalesData, prev);

    return {
      total_pembesaran_ekor: curr.total_pembesaran_ekor,
      prev_total_pembesaran_ekor: prev.total_pembesaran_ekor,
      total_ikan_kg: curr.total_ikan_kg,
      prev_total_ikan_kg: prev.total_ikan_kg,
      total_ikan_omzet: curr.total_ikan_omzet,
      prev_total_ikan_omzet: prev.total_ikan_omzet,
      total_sayur_kg: curr.total_sayur_kg,
      prev_total_sayur_kg: prev.total_sayur_kg,
      total_sayur_omzet: curr.total_sayur_omzet,
      prev_total_sayur_omzet: prev.total_sayur_omzet,
      total_omzet: curr.total_omzet,
      prev_total_omzet: prev.total_omzet,
      total_biaya: curr.total_biaya,
      prev_total_biaya: prev.total_biaya,
      laba_bersih: curr.total_omzet - curr.total_biaya,
      prev_laba_bersih: prev.total_omzet - prev.total_biaya,
      avg_harga_ikan: curr.total_ikan_kg > 0 ? Math.round(curr.total_ikan_omzet / curr.total_ikan_kg) : 0,
      avg_harga_sayur: curr.total_sayur_kg > 0 ? Math.round(curr.total_sayur_omzet / curr.total_sayur_kg) : 0,
    };
  }, [isRas, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

  return { rasMonthlyData, rasSpeciesData, rasYTD, currentYear };
}
