import { supabase } from '../lib/supabaseClient';

import { safeNumber, safeString } from '../utils/sanitize';

export const salesService = {
  fetchSalesData: async (fuzzyKeyword, globalProgram, targetYear) => {
    const targetYearNum = Number(targetYear);
    const prevYearStr = (targetYearNum - 1).toString();

    const { data, error } = await supabase
      .from('SCD_Report_Sales_Data')
      .select('*')
      .ilike('Program', fuzzyKeyword)
      .in('Tahun', [targetYear, prevYearStr]);

    if (error) throw error;

    let extraFields = {};
    let tablesData = {};
    let salesData = data || [];

    if (salesData.length > 0) {
      salesData.forEach(row => {
        if (row.Operasional && row.Operasional !== '-') {
          extraFields[row.Operasional] = row['Value Operasional'];
        }
        if (row['Kategori Produk'] && row['Kategori Produk'] !== '-') {
          const cat = row['Kategori Produk'];
          if (!tablesData[cat]) tablesData[cat] = [];
          tablesData[cat].push({
            product_name: row.Produk,
            qty: row.Jumlah,
            unit: row.Satuan_1,
            unit_price: row['Harga Satuan'],
            revenue: row.Omzet
          });
        }
      });
    }

    // Removed mock data appending as per request

    return { extraFields, tablesData, salesData };
  },

  upsertSalesData: async (globalProgram, monthNames, targetMonth, targetYear, payload) => {
    // 1. Delete old sales data
    const { error: delErr } = await supabase.from('SCD_Report_Sales_Data')
      .delete()
      .eq('Program', globalProgram)
      .in('Bulan', monthNames)
      .eq('Tahun', targetYear);
      
    if (delErr) throw delErr;

    const salesPayloads = [];
    const { tablesData, extraFields } = payload;

    // 2. Sanitize and prepare new sales data
    if (extraFields) {
      Object.entries(extraFields).forEach(([field, value]) => {
        let opSatuan = "Kegiatan"; 
        if (field === "Masa Tanam") opSatuan = "Bulan";
        else if (field === "Luas Lahan") opSatuan = "Ha";
        else if (field === "Bibit") opSatuan = "Batang";
        else if (field === "Pupuk") opSatuan = "Kg";
        else if (field === "Pakan") opSatuan = "Kg";
        else if (field === "Total Siklus" || field === "Total DOC/DOD" || field === "Total Panen (Ekor)") opSatuan = "Ekor";
        else if (field === "FCR" || field === "Tingkat Kematian (%)" || field === "Keseragaman (%)" || field === "Index Performa") opSatuan = "%";
        else if (field === "Bahan Baku" || field === "Total Panen (Kg)") opSatuan = "Kg";
        else if (field === "Energi Dihasilkan" || field === "Energi Dimanfaatkan" || field === "Potensi Pengurangan Emisi") opSatuan = "kWh";
        else if (field === "Jumlah Anggota" || field === "Mitra Kerja") opSatuan = "Orang";
        else if (field === "Penjualan Domestik" || field === "Penjualan Ekspor") opSatuan = "Rp";
        else if (field === "Sampah Organik" || field === "Sampah Non Organik" || field === "Minyak Jelantah") opSatuan = "Kg";

        salesPayloads.push({
          "Program": globalProgram,
          "Bulan": targetMonth,
          "Tahun": targetYear,
          "Operasional": safeString(field),
          "Value Operasional": safeNumber(value),
          "Satuan": opSatuan,
          "Kategori Produk": "-",
          "Produk": "-",
          "Jumlah": 0,
          "Satuan_1": "-",
          "Harga Satuan": 0,
          "Omzet": 0
        });
      });
    }

    if (tablesData) {
      Object.entries(tablesData).forEach(([category, items]) => {
        items.forEach(item => {
          if (item.product_name) {
            salesPayloads.push({
              "Program": globalProgram,
              "Bulan": targetMonth,
              "Tahun": targetYear,
              "Operasional": "-",
              "Value Operasional": 0,
              "Satuan": "-",
              "Kategori Produk": safeString(category),
              "Produk": safeString(item.product_name),
              "Jumlah": safeNumber(item.qty),
              "Satuan_1": safeString(item.unit || "Kg"),
              "Harga Satuan": safeNumber(item.unit_price),
              "Omzet": safeNumber(item.revenue)
            });
          }
        });
      });
    }

    // 3. Insert into DB
    if (salesPayloads.length > 0) {
      const { error: insErr } = await supabase.from('SCD_Report_Sales_Data').insert(salesPayloads);
      if (insErr) throw insErr;
    }
  }
};
