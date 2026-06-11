import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { MOCK_ECOGROW_DATA } from '../data/mockEcogrow';
import { MOCK_CAHAYA_TANI_DATA } from '../data/mockCahayaTani';

const monthMap = {
  0: ['Jan', 'January', 'Januari'],
  1: ['Feb', 'February', 'Februari'],
  2: ['Mar', 'March', 'Maret'],
  3: ['Apr', 'April'],
  4: ['May', 'Mei'],
  5: ['Jun', 'June', 'Juni'],
  6: ['Jul', 'July', 'Juli'],
  7: ['Ags', 'Aug', 'August', 'Agustus'],
  8: ['Sep', 'Sept', 'September'],
  9: ['Okt', 'Oct', 'October', 'Oktober'],
  10: ['Nov', 'November'],
  11: ['Des', 'Dec', 'December', 'Desember']
};

const getMonthStrings = (dateStr) => {
  const d = new Date(dateStr);
  const selectedMonthIdx = d.getMonth();
  return [...monthMap[selectedMonthIdx]];
};

const getYear = (dateStr) => {
  return new Date(dateStr).getFullYear();
};

const useAppStore = create((set, get) => ({
  activeTab: "Dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  globalProgram: "PLTS IRIGASI",
  setGlobalProgram: (program) => {
    set({ globalProgram: program });
    get().fetchData();
  },
  
  globalDate: new Date().toISOString().split('T')[0],
  setGlobalDate: (date) => {
    set({ globalDate: date });
    get().fetchData();
  },

  // State Data
  isLoading: false,
  programList: [],
  programContext: null,
  pltsLocations: [],
  monthlyProgress: null,
  salesData: [],
  tablesData: [],
  extraFields: {},

  fetchData: async () => {
    const { globalProgram, globalDate } = get();
    set({ isLoading: true });
    
    try {
      // 1. Fetch Program List
      const { data: programsData, error: pErr } = await supabase
        .from('SCD_Report_Programs')
        .select('Program');
      
      if (!pErr && programsData) {
        const uniquePrograms = [...new Set(programsData.map(p => p.Program))];
        if (!uniquePrograms.includes("PROKLIM")) {
          uniquePrograms.push("PROKLIM");
        }
        set({ programList: uniquePrograms });
      }

      // 2. Fetch Program Context
      const { data: contextData, error: cErr } = await supabase
        .from('SCD_Report_Programs')
        .select('*')
        .eq('Program', globalProgram)
        .single();
        
      if (!cErr && contextData) {
        set({ programContext: {
          name: contextData.Program,
          location: contextData.Lokasi,
          beneficiaries: contextData['Penerima Manfaat'],
          objective: contextData.Objective,
          kpi: contextData.KPI,
          tpb: contextData["TPB/SDG's"],
          budget_text: contextData.Anggaran
        }});
      }

      // 3. Fetch PLTS Locations
      const pProgram = (globalProgram || '').toLowerCase();
      if (pProgram === 'plts irigasi') {
        const { data: pltsData } = await supabase
          .from('SCD_Report_PLTS_Location')
          .select('*');
        if (pltsData && pltsData.length > 0) {
          set({ pltsLocations: pltsData.map(p => ({
            location_name: p.Desa,
            capacity_kwp: Number(p.kWp) || 0,
            area_ha: Number(p['Luas Lahan (Ha)']) || 0,
            farmers: Number(p['Jumlah Petani']) || 0,
            kecamatan: p.Kecamatan,
            kabupaten: p.Kabupaten,
            provinsi: p.Provinsi,
            map_link: p['Link Google Map']
          }))});
        } else {
          set({ pltsLocations: [] });
        }
      } else {
        set({ pltsLocations: [] });
      }

      const targetYear = getYear(globalDate);
      const targetMonthIdx = new Date(globalDate).getMonth();
      const monthNames = getMonthStrings(globalDate);

      let fuzzyKeyword = `%${globalProgram}%`;
      const pLow = globalProgram.toLowerCase();
      if (pLow.includes('maggot')) fuzzyKeyword = '%maggot%';
      else if (pLow.includes('plts')) fuzzyKeyword = '%plts%';
      else if (pLow.includes('ikan')) fuzzyKeyword = '%ikan%';
      else if (pLow.includes('siba')) fuzzyKeyword = '%siba%';
      else if (pLow.includes('puyuh')) {
        if (pLow.includes('seleman')) fuzzyKeyword = '%puyuh%seleman%';
        else if (pLow.includes('darmo')) fuzzyKeyword = '%puyuh%darmo%';
        else fuzzyKeyword = '%puyuh%';
      }
      else if (pLow.includes('prabumenang')) fuzzyKeyword = '%prabumenang%';

      // 4. Fetch Monthly Progress
      const { data: progressData } = await supabase
        .from('SCD_Report_Monthly_Progress')
        .select('*')
        .ilike('Program', fuzzyKeyword)
        .eq('Tahun', targetYear)
        .in('Bulan', monthNames)
        .limit(1)
        .single();
        
      if (progressData) {
        set({ monthlyProgress: {
          period_date: `${targetYear}-${(targetMonthIdx + 1).toString().padStart(2, '0')}-01`,
          past_month_realization: progressData.Realisasi,
          next_month_plan: progressData['Rencana kerja'],
          budget_realization_text: progressData['Penyerapan anggaran'] || "-",
        }});
      } else {
        set({ monthlyProgress: null });
      }

      // 5. Fetch Sales Data
      const targetYearNum = Number(targetYear);
      const prevYearStr = (targetYearNum - 1).toString();

      const { data: sData } = await supabase
        .from('SCD_Report_Sales_Data')
        .select('*')
        .ilike('Program', fuzzyKeyword)
        .in('Tahun', [targetYear, prevYearStr]);

      if (sData && sData.length > 0) {
        const extraFields = {};
        const tablesData = {};

        sData.forEach(row => {
          // Extra field check (Operasional)
          if (row.Operasional && row.Operasional !== '-') {
            extraFields[row.Operasional] = row['Value Operasional'];
          }

          // Tables data check (Produk)
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

        let finalSalesData = sData || [];
        if (globalProgram && globalProgram.toLowerCase().includes("ecogrow")) {
          finalSalesData = [...finalSalesData, ...MOCK_ECOGROW_DATA];
        }
        if (globalProgram && globalProgram.toLowerCase().includes("cahaya tani")) {
          finalSalesData = [...finalSalesData, ...MOCK_CAHAYA_TANI_DATA];
        }

        set({ extraFields, tablesData, salesData: finalSalesData });
      } else {
        let finalSalesData = [];
        if (globalProgram && globalProgram.toLowerCase().includes("ecogrow")) {
          finalSalesData = [...MOCK_ECOGROW_DATA];
        }
        if (globalProgram && globalProgram.toLowerCase().includes("cahaya tani")) {
          finalSalesData = [...MOCK_CAHAYA_TANI_DATA];
        }
        set({ extraFields: {}, tablesData: {}, salesData: finalSalesData });
      }

    } catch (error) {
      console.error("Supabase Fetch Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveData: async (payload) => {
    // Save is disabled temporarily until write logic is defined based on new schema
    console.warn("Save logic needs mapping to Supabase tables. Payload:", payload);
    alert("Koneksi Supabase berhasil! (Mode Simpan masih ditahan menunggu struktur form terbaru).");
  }
}));

export default useAppStore;
