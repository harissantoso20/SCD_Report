import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { MOCK_ECOGROW_DATA, MOCK_CAHAYA_TANI_DATA, mockItikData as MOCK_ITIK_DATA } from '../data/mockData';

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

  // --- AUTH ACTIONS ---
  initializeAuth: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isAuthLoading: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, isAuthLoading: false });
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, activeTab: 'Dashboard' }); // redirect/reset tab on logout if needed
  },
  
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
  isAuthLoading: true,
  user: null,
  programList: [],
  programContext: null,
  pltsLocations: [],
  monthlyProgress: null,
  salesData: [],
  tablesData: [],
  extraFields: {},
  evidenceData: [],

  fetchData: async () => {
    const { globalProgram, globalDate } = get();
    set({ isLoading: true });
    
    try {
      // 1. Fetch Program List
      const { data: programsData, error: pErr } = await supabase
        .from('SCD_Report_Programs')
        .select('Program');
      
      if (!pErr && programsData) {
        let uniquePrograms = [...new Set(programsData.map(p => p.Program))];
        uniquePrograms = uniquePrograms.filter(p => !p.toLowerCase().includes("kalium humat"));
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
        if (globalProgram && globalProgram.toLowerCase().includes("itik")) {
          finalSalesData = [...finalSalesData, ...MOCK_ITIK_DATA];
        }

        set({ extraFields, tablesData, salesData: finalSalesData });
      } else {
        let finalSalesData = [];
        if (globalProgram && globalProgram.toLowerCase().includes("ecogrow")) {
          finalSalesData = [...finalSalesData, ...MOCK_ECOGROW_DATA];
        }
        if (globalProgram && globalProgram.toLowerCase().includes("cahaya tani")) {
          finalSalesData = [...finalSalesData, ...MOCK_CAHAYA_TANI_DATA];
        }
        if (globalProgram && globalProgram.toLowerCase().includes("itik")) {
          finalSalesData = [...finalSalesData, ...MOCK_ITIK_DATA];
        }
        set({ extraFields: {}, tablesData: {}, salesData: finalSalesData });
      }

      // 6. Fetch Evidence Data
      const { data: evidence } = await supabase
        .from('SCD_Report_Evidence')
        .select('*')
        .ilike('Program', fuzzyKeyword)
        .eq('Tahun', targetYear)
        .in('Bulan', monthNames);

      set({ evidenceData: evidence || [] });

    } catch (error) {
      console.error("Supabase Fetch Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveData: async (payload) => {
    const { globalProgram, globalDate } = get();
    const targetYear = getYear(globalDate);
    const monthNames = getMonthStrings(globalDate);
    const targetMonth = monthNames[0]; // Gunakan format singkatan misal 'Jan'

    try {
      // 1. Upsert Monthly Progress
      // Menghapus data lama jika ada lalu insert baru (alternatif upsert tanpa composite primary key)
      const { error: delProgressErr } = await supabase.from('SCD_Report_Monthly_Progress')
        .delete()
        .eq('Program', globalProgram)
        .in('Bulan', monthNames)
        .eq('Tahun', targetYear);
      if (delProgressErr) throw delProgressErr;

      const progressPayload = {
        "Program": globalProgram,
        "Bulan": targetMonth,
        "Tahun": targetYear,
        "Realisasi": payload.monthlyProgress?.past_month_realization || "-",
        "Rencana kerja": payload.monthlyProgress?.next_month_plan || "-"
      };
        
      const { error: insProgressErr } = await supabase.from('SCD_Report_Monthly_Progress').insert([progressPayload]);
      if (insProgressErr) throw insProgressErr;

      // 2. Insert Sales Data
      // Hapus yang lama pada periode ini
      const { error: delSalesErr } = await supabase.from('SCD_Report_Sales_Data')
        .delete()
        .eq('Program', globalProgram)
        .in('Bulan', monthNames)
        .eq('Tahun', targetYear);
      if (delSalesErr) throw delSalesErr;

      const salesPayloads = [];
      const { tablesData, extraFields } = payload;
      const p = globalProgram.toLowerCase();

      // Convert extraFields to Sales Data rows
      if (p.includes("maggot")) {
        if (extraFields['sampah_organik']) {
          salesPayloads.push({
            "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear,
            "Operasional": "Sampah Organik Terurai", "Value Operasional": extraFields['sampah_organik'], "Satuan": "Kg",
            "Kategori Produk": "-", "Produk": "-", "Jumlah": 0, "Satuan_1": "-", "Harga Satuan": 0, "Omzet": 0
          });
        }
        if (extraFields['maggot_dihasilkan']) {
          salesPayloads.push({
            "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear,
            "Operasional": "Fresh Maggot Dihasilkan", "Value Operasional": extraFields['maggot_dihasilkan'], "Satuan": "Kg",
            "Kategori Produk": "-", "Produk": "-", "Jumlah": 0, "Satuan_1": "-", "Harga Satuan": 0, "Omzet": 0
          });
        }
        if (tablesData['maggot']) {
          tablesData['maggot'].forEach(row => {
            if (row.product_name) {
              salesPayloads.push({
                "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear,
                "Operasional": "-", "Value Operasional": 0, "Satuan": "-",
                "Kategori Produk": "Maggot", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Kg", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0
              });
            }
          });
        }
      } else if (p.includes("ikan air tawar")) {
        if (tablesData['konsumsi']) {
          tablesData['konsumsi'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Ikan Konsumsi", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Kg", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
        if (tablesData['bibit']) {
          tablesData['bibit'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Bibit Ikan", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Ekor", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      } else if (p.includes("pembibitan") || p.includes("cahaya tani")) {
        if (tablesData['pembesaran_batang']) {
          tablesData['pembesaran_batang'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "Pembesaran Bibit", "Value Operasional": row.qty || 0, "Satuan": "Batang", "Kategori Produk": "-", "Produk": row.product_name, "Jumlah": 0, "Satuan_1": "-", "Harga Satuan": 0, "Omzet": 0 });
          });
        }
        if (tablesData['bibit_tanaman']) {
          tablesData['bibit_tanaman'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Bibit Tanaman", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Batang", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
        if (tablesData['produk_lainnya']) {
          tablesData['produk_lainnya'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Produk Lain", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Ea", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      } else if (p.includes("puyuh")) {
        if (tablesData['telur']) {
          tablesData['telur'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Telur Puyuh", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Butir", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
        if (tablesData['produk_lainnya']) {
          tablesData['produk_lainnya'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Produk Lain", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Ea", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      } else if (p.includes("itik")) {
        if (tablesData['telur']) {
          tablesData['telur'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Telur Itik", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Butir", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      } else if (p.includes("ecogrow")) {
         if (tablesData['sayur']) {
          tablesData['sayur'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Produk", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Kg", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      } else if (p.includes("prabumenang")) {
        if (tablesData['produk_olahan']) {
          tablesData['produk_olahan'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": row.jenis_produk || "Tempe", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "Kg", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      } else {
         if (tablesData['default']) {
          tablesData['default'].forEach(row => {
            if (row.product_name) salesPayloads.push({ "Program": globalProgram, "Bulan": targetMonth, "Tahun": targetYear, "Operasional": "-", "Value Operasional": 0, "Satuan": "-", "Kategori Produk": "Lainnya", "Produk": row.product_name, "Jumlah": row.qty || 0, "Satuan_1": row.unit || "-", "Harga Satuan": row.unit_price || 0, "Omzet": row.revenue || 0 });
          });
        }
      }

      if (salesPayloads.length > 0) {
        const { error: insSalesErr } = await supabase.from('SCD_Report_Sales_Data').insert(salesPayloads);
        if (insSalesErr) throw insSalesErr;
      }

      // 3. Upload Evidence Files and Save to Database
      if (payload.evidenceFiles && payload.evidenceFiles.length > 0) {
        // filter file yang merupakan objek File sungguhan (bukan URL yang difetch balik)
        const newFiles = payload.evidenceFiles.filter(f => f instanceof File);
        
        for (const file of newFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${globalProgram}_${targetMonth}_${targetYear}_${Date.now()}.${fileExt}`;
          const filePath = `${globalProgram.replace(/\s+/g, '_')}/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('evidence')
              .getPublicUrl(filePath);

            const { error: insEvErr } = await supabase.from('SCD_Report_Evidence').insert([{
              "Program": globalProgram,
              "Bulan": targetMonth,
              "Tahun": targetYear,
              "File_Url": publicUrl
            }]);
            if (insEvErr) throw insEvErr;
          } else {
             throw uploadError;
          }
        }
      }

      get().fetchData();
      return { success: true };
    } catch (error) {
      console.error("Save Data Error:", error);
      return { success: false, error };
    }
  }
}));

export default useAppStore;
