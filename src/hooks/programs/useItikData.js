import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function useItikData() {
  const { selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

  const itikPetelurOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes('itik') && !p.includes('petelur')) return [];
    if (p.includes('puyuh')) return [];

    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => {
      dataMap[i] = {
        month: m,
        mentah_omzet: 0, mentah_vol: 0, mentah_harga: 0, mentah_count: 0,
        asin_mentah_omzet: 0, asin_mentah_vol: 0, asin_mentah_harga: 0, asin_mentah_count: 0,
        asin_matang_omzet: 0, asin_matang_vol: 0, asin_matang_harga: 0, asin_matang_count: 0,
        total_omzet: 0, total_vol: 0
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
        const harga = Number(row['Harga Satuan']) || 0;

        dataMap[monthIdx].total_omzet += omzet;
        dataMap[monthIdx].total_vol += qty;

        if (prod === 'telur ashin matang' || prod === 'telur asin matang') {
          dataMap[monthIdx].asin_matang_omzet += omzet;
          dataMap[monthIdx].asin_matang_vol += qty;
          if (qty > 0) {
            dataMap[monthIdx].asin_matang_harga += harga;
            dataMap[monthIdx].asin_matang_count += 1;
          }
        } else if (prod === 'telur ashin mentah' || prod === 'telur asin mentah') {
          dataMap[monthIdx].asin_mentah_omzet += omzet;
          dataMap[monthIdx].asin_mentah_vol += qty;
          if (qty > 0) {
            dataMap[monthIdx].asin_mentah_harga += harga;
            dataMap[monthIdx].asin_mentah_count += 1;
          }
        } else {
          // Assume mentah if not asin
          dataMap[monthIdx].mentah_omzet += omzet;
          dataMap[monthIdx].mentah_vol += qty;
          if (qty > 0) {
            dataMap[monthIdx].mentah_harga += harga;
            dataMap[monthIdx].mentah_count += 1;
          }
        }
      }
    });

    Object.keys(dataMap).forEach(k => {
      const d = dataMap[k];
      if (d.mentah_count > 0) d.mentah_harga = Math.round(d.mentah_harga / d.mentah_count);
      if (d.asin_mentah_count > 0) d.asin_mentah_harga = Math.round(d.asin_mentah_harga / d.asin_mentah_count);
      if (d.asin_matang_count > 0) d.asin_matang_harga = Math.round(d.asin_matang_harga / d.asin_matang_count);
    });

    return Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx);
  }, [selectedProgram, currYearSalesData, selectedMonthIdx]);

  const itikPetelurYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes('itik') && !p.includes('petelur')) return {
      total_omzet: 0, prev_total_omzet: 0, total_vol: 0, prev_total_vol: 0,
      mentah_vol: 0, asin_mentah_vol: 0, asin_matang_vol: 0,
      mentah_omzet: 0, asin_mentah_omzet: 0, asin_matang_omzet: 0,
      mentah_harga: 0, asin_mentah_harga: 0, asin_matang_harga: 0
    };
    if (p.includes('puyuh')) return {
      total_omzet: 0, prev_total_omzet: 0, total_vol: 0, prev_total_vol: 0,
      mentah_vol: 0, asin_mentah_vol: 0, asin_matang_vol: 0,
      mentah_omzet: 0, asin_mentah_omzet: 0, asin_matang_omzet: 0,
      mentah_harga: 0, asin_mentah_harga: 0, asin_matang_harga: 0
    };

    let total_omzet = 0, prev_total_omzet = 0;
    let total_vol = 0, prev_total_vol = 0;
    let mentah_vol = 0, asin_mentah_vol = 0, asin_matang_vol = 0;
    let mentah_omzet = 0, asin_mentah_omzet = 0, asin_matang_omzet = 0;
    let mentah_harga = 0, asin_mentah_harga = 0, asin_matang_harga = 0;
    let mentah_count = 0, asin_mentah_count = 0, asin_matang_count = 0;

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
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        const harga = Number(row['Harga Satuan']) || 0;

        if (isPrev) {
          prev_total_omzet += omzet;
          prev_total_vol += qty;
        } else {
          total_omzet += omzet;
          total_vol += qty;

          if (prod === 'telur ashin matang' || prod === 'telur asin matang') {
            asin_matang_vol += qty;
            asin_matang_omzet += omzet;
            if (qty > 0) { asin_matang_harga += harga; asin_matang_count++; }
          } else if (prod === 'telur ashin mentah' || prod === 'telur asin mentah') {
            asin_mentah_vol += qty;
            asin_mentah_omzet += omzet;
            if (qty > 0) { asin_mentah_harga += harga; asin_mentah_count++; }
          } else {
            mentah_vol += qty;
            mentah_omzet += omzet;
            if (qty > 0) { mentah_harga += harga; mentah_count++; }
          }
        }
      }
    };

    currYearSalesData.forEach(row => processRow(row, false));
    prevYearSalesData.forEach(row => processRow(row, true));

    if (mentah_count > 0) mentah_harga = Math.round(mentah_harga / mentah_count);
    if (asin_mentah_count > 0) asin_mentah_harga = Math.round(asin_mentah_harga / asin_mentah_count);
    if (asin_matang_count > 0) asin_matang_harga = Math.round(asin_matang_harga / asin_matang_count);

    return {
      total_omzet, prev_total_omzet,
      total_vol, prev_total_vol,
      mentah_vol, asin_mentah_vol, asin_matang_vol,
      mentah_omzet, asin_mentah_omzet, asin_matang_omzet,
      mentah_harga, asin_mentah_harga, asin_matang_harga
    };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

  return { itikPetelurOverviewData, itikPetelurYTD, currentYear };
}