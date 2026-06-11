import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useCahayaTaniData() {
  const { selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

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
  return { cahayaTaniOverviewData, cahayaTaniYTD, currentYear };
}