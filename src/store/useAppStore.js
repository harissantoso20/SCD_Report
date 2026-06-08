import { create } from 'zustand';

const MOCK_PROGRAMS = [
  "PLTS Irigasi", "Budidaya Maggot BSF", "Budidaya Ikan Air Tawar", 
  "SIBA Pembibitan", "Budidaya Puyuh Petelur (Seleman)", 
  "Budidaya Puyuh Petelur (Darmo)", "EcoGrow Mom Utun Makmur", 
  "Poktan Cahaya Tani", "Budidaya Itik Petelur"
];

const useAppStore = create((set, get) => ({
  activeTab: "Dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  globalProgram: "PLTS Irigasi",
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
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set({ programList: MOCK_PROGRAMS });

      set({ 
        programContext: {
          id: 1,
          name: globalProgram,
          budget_text: "Rp 150.000.000 (Dummy Data)",
          tpb: "TPB 8: Pekerjaan Layak dan Pertumbuhan Ekonomi",
          location: "Desa Contoh, Kecamatan Simulasi",
          beneficiaries: "50 Kepala Keluarga",
          kpi: "Peningkatan pendapatan 20%",
          objective: "Memberdayakan masyarakat desa."
        } 
      });

      if (globalProgram === 'PLTS Irigasi') {
         set({ pltsLocations: [
           { location_name: "Titik A", capacity_kwp: 5, area_ha: 10, farmers: 20 },
           { location_name: "Titik B", capacity_kwp: 10, area_ha: 25, farmers: 50 }
         ]});
      } else {
         set({ pltsLocations: [] });
      }

      set({ 
        monthlyProgress: {
          past_month_realization: "Bulan lalu berjalan lancar sesuai target (Dummy).",
          next_month_plan: "Perluasan skala panen di bulan depan."
        },
        extraFields: { sampah_organik: 12960 }
      });

      set({ 
        salesData: [], 
        tablesData: {}
      });
      
    } catch (error) {
      console.error("Error fetching dummy data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveData: async (payload) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log("Mock Save Data Triggered:", payload);
      alert("Data berhasil disimpan secara dummy!");
      get().fetchData();
    } catch (error) {
      console.error("Dummy Save Error:", error);
      alert("Terjadi kesalahan (Dummy)");
    } finally { 
      set({ isLoading: false }); 
    }
  }
}));

export default useAppStore;
