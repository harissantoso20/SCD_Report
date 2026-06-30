import { useMemo } from 'react';
import { useSharedDashboard, MAGGOT_MONTH_NAMES } from '../useSharedDashboard';

export function usePembibitanData() {
  const { selectedProgram, salesData, currYearSalesData, prevYearSalesData, selectedMonthIdx, currentYear } = useSharedDashboard();

  const pembibitanOverviewData = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("siba pembibitan")) return [];
    
    const dataMap = {};
    MAGGOT_MONTH_NAMES.forEach((m, i) => { 
      dataMap[i] = { 
        month: m, 
        pembesaran_batang_cat: 0, 
        pembesaran_batang_op: 0,
        penjualan_batang: 0, 
        polybag_sold: 0, 
        bibit_omzet: 0, 
        polybag_omzet: 0, 
        total_rp: 0,
        bibit_count_for_avg: 0,
        sum_harga_bibit: 0
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
        const op = (row.Operasional || '').toLowerCase().trim();
        if (op.includes("pembesaran")) {
          dataMap[monthIdx].pembesaran_batang_op += (Number(row['Value Operasional']) || 0);
        }

        const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        const harga = Number(row['Harga Satuan']) || 0;

        if (cat.includes("pembesaran")) {
          dataMap[monthIdx].pembesaran_batang_cat += qty;
        }

        if (cat === 'bibit_tanaman' || cat === 'bibit tanaman') {
          dataMap[monthIdx].penjualan_batang += qty;
          dataMap[monthIdx].bibit_omzet += omzet;
          if (qty > 0 && harga > 0) {
            dataMap[monthIdx].bibit_count_for_avg += 1;
            dataMap[monthIdx].sum_harga_bibit += harga;
          }
        } else if (cat === 'produk_lainnya' || cat === 'media tanam') {
          dataMap[monthIdx].polybag_sold += qty;
          dataMap[monthIdx].polybag_omzet += omzet;
        }
        
        if (cat === 'bibit_tanaman' || cat === 'bibit tanaman' || cat === 'produk_lainnya' || cat === 'media tanam') {
          dataMap[monthIdx].total_rp += omzet;
        }
      }
    });

    const result = Object.values(dataMap).filter((_, i) => i <= selectedMonthIdx).map(d => ({
      ...d,
      pembesaran_batang: d.pembesaran_batang_cat > 0 ? d.pembesaran_batang_cat : d.pembesaran_batang_op,
      avg_harga_bibit: d.bibit_count_for_avg > 0 ? (d.sum_harga_bibit / d.bibit_count_for_avg) : 0
    }));
    
    return result;
  }, [selectedProgram, salesData, selectedMonthIdx]);

  const pembibitanYTD = useMemo(() => {
    const p = (selectedProgram || '').toLowerCase();
    if (!p.includes("siba pembibitan")) return { 
      currPembesaran: 0, prevPembesaran: 0,
      currPenjualan: 0, prevPenjualan: 0,
      currPolybag: 0, prevPolybag: 0,
      currRevenue: 0, prevRevenue: 0,
      currBibitOmzet: 0, prevBibitOmzet: 0,
      currPolybagOmzet: 0, prevPolybagOmzet: 0
    };
    
    let currPembesaran = 0, prevPembesaran = 0,
        currPenjualan = 0, prevPenjualan = 0,
        currPolybag = 0, prevPolybag = 0,
        currRevenue = 0, prevRevenue = 0,
        currBibitOmzet = 0, prevBibitOmzet = 0,
        currPolybagOmzet = 0, prevPolybagOmzet = 0;

    let currLastValidMonth = -1;
    let prevLastValidMonth = -1;
    let currPembesaranMapOp = {};
    let prevPembesaranMapOp = {};
    let currPembesaranMapCat = {};
    let prevPembesaranMapCat = {};

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
        
        const cat = (row['Kategori Produk'] || '').toLowerCase().trim();
        const omzet = Number(row.Omzet) || 0;
        const qty = Number(row.Jumlah) || 0;
        
        let hasData = false;

        const op = (row.Operasional || '').toLowerCase().trim();
        if (op.includes("pembesaran")) {
          const val = Number(row['Value Operasional']) || 0;
          if (isPrev) {
            prevPembesaranMapOp[monthIdx] = (prevPembesaranMapOp[monthIdx] || 0) + val;
          } else {
            currPembesaranMapOp[monthIdx] = (currPembesaranMapOp[monthIdx] || 0) + val;
          }
          if (val > 0) hasData = true;
        }

        if (cat.includes("pembesaran")) {
          if (isPrev) {
            prevPembesaranMapCat[monthIdx] = (prevPembesaranMapCat[monthIdx] || 0) + qty;
          } else {
            currPembesaranMapCat[monthIdx] = (currPembesaranMapCat[monthIdx] || 0) + qty;
          }
          if (qty > 0) hasData = true;
        }

        if (cat === 'bibit_tanaman' || cat === 'bibit tanaman') {
          if (isPrev) { prevPenjualan += qty; prevBibitOmzet += omzet; prevRevenue += omzet; }
          else { currPenjualan += qty; currBibitOmzet += omzet; currRevenue += omzet; }
          if (qty > 0 || omzet > 0) hasData = true;
        } else if (cat === 'produk_lainnya' || cat === 'media tanam') {
          if (isPrev) { prevPolybag += qty; prevPolybagOmzet += omzet; prevRevenue += omzet; }
          else { currPolybag += qty; currPolybagOmzet += omzet; currRevenue += omzet; }
          if (qty > 0 || omzet > 0) hasData = true;
        }

        if (hasData) {
          if (isPrev) {
             if (monthIdx > prevLastValidMonth) prevLastValidMonth = monthIdx;
          } else {
             if (monthIdx > currLastValidMonth) currLastValidMonth = monthIdx;
          }
        }
      }
    };

    currYearSalesData.forEach(r => processRow(r, false));
    prevYearSalesData.forEach(r => processRow(r, true));

    if (currLastValidMonth !== -1) {
      const catVal = currPembesaranMapCat[currLastValidMonth] || 0;
      const opVal = currPembesaranMapOp[currLastValidMonth] || 0;
      currPembesaran = catVal > 0 ? catVal : opVal;
    }
    if (prevLastValidMonth !== -1) {
      const catVal = prevPembesaranMapCat[prevLastValidMonth] || 0;
      const opVal = prevPembesaranMapOp[prevLastValidMonth] || 0;
      prevPembesaran = catVal > 0 ? catVal : opVal;
    }

    return { 
      currPembesaran, prevPembesaran, 
      currPenjualan, prevPenjualan, 
      currPolybag, prevPolybag, 
      currRevenue, prevRevenue,
      currBibitOmzet, prevBibitOmzet,
      currPolybagOmzet, prevPolybagOmzet
    };
  }, [selectedProgram, currYearSalesData, prevYearSalesData, selectedMonthIdx]);

  return { pembibitanOverviewData, pembibitanYTD, currentYear };
}

