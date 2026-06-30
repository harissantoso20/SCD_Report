import { create } from 'zustand';
import { authService } from '../services/authService';
import { programService } from '../services/programService';
import { progressService } from '../services/progressService';
import { salesService } from '../services/salesService';
import { evidenceService } from '../services/evidenceService';
import { homeService } from '../services/homeService';
import { getMonthStrings, getYear, getIndoMonthString } from '../utils/dateUtils';
import { getFuzzyKeyword } from '../utils/programUtils';

const useAppStore = create((set, get) => ({
  activeTab: "Home",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Home Data State
  homeData: null,
  isHomeLoading: false,
  isReportLoading: false,

  // --- AUTH ACTIONS ---
  initializeAuth: () => {
    authService.initializeAuth((session) => {
      set({ user: session?.user ?? null, isAuthLoading: false });
    });
  },

  login: async (email, password) => {
    const { data, error } = await authService.login(email, password);
    return { data, error };
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, activeTab: 'Dashboard' }); 
  },
  
  globalProgram: "PLTS IRIGASI",
  setGlobalProgram: (program) => {
    set({ globalProgram: program });
    get().fetchData();
  },
  
  globalDate: new Date().toISOString().split('T')[0],
  setGlobalDate: (date) => {
    set({ globalDate: date });
    if (get().activeTab === 'Home') {
      get().fetchHomeData();
    }
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

  // --- HOME ACTIONS ---
  fetchHomeData: async () => {
    const { globalDate, homeData } = get();
    const targetYear = getYear(globalDate);
    const monthNames = getMonthStrings(globalDate);

    if (!homeData) {
      set({ isHomeLoading: true, error: null });
    } else {
      set({ isReportLoading: true, error: null });
    }

    try {
      const data = await homeService.fetchHomeData(monthNames, targetYear);
      set({ homeData: data });
    } catch (err) {
      console.error('Error fetching home data:', err);
      set({ error: err.message });
    } finally {
      set({ isHomeLoading: false, isReportLoading: false });
    }
  },

  fetchData: async () => {
    const { globalProgram, globalDate } = get();
    set({ isLoading: true });
    
    try {
      // 1. Fetch Program List
      const programList = await programService.fetchProgramList();
      if (programList.length > 0) set({ programList });

      // 2. Fetch Program Context
      const programContext = await programService.fetchProgramContext(globalProgram);
      if (programContext) set({ programContext });

      // 3. Fetch PLTS Locations
      const pltsLocations = await programService.fetchPLTSLocations(globalProgram);
      set({ pltsLocations });

      // Prepare date params
      const targetYear = getYear(globalDate);
      const targetMonthIdx = new Date(globalDate).getMonth();
      const monthNames = getMonthStrings(globalDate);
      const fuzzyKeyword = getFuzzyKeyword(globalProgram);

      // 4. Fetch Monthly Progress
      const monthlyProgress = await progressService.fetchMonthlyProgress(
        fuzzyKeyword, targetYear, monthNames, targetMonthIdx
      );
      set({ monthlyProgress });

      // 5. Fetch Sales Data
      const { extraFields, tablesData, salesData } = await salesService.fetchSalesData(
        fuzzyKeyword, globalProgram, targetYear, getIndoMonthString(globalDate)
      );
      set({ extraFields, tablesData, salesData });

      // 6. Fetch Evidence Data
      const evidenceData = await evidenceService.fetchEvidenceData(
        fuzzyKeyword, targetYear, monthNames
      );
      set({ evidenceData });

    } catch (error) {
      console.error("Fetch Data Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveData: async (payload) => {
    const { globalProgram, globalDate } = get();
    const targetYear = getYear(globalDate);
    const monthNames = getMonthStrings(globalDate);
    const targetMonth = getIndoMonthString(globalDate); 

    try {
      // 1. Upsert Monthly Progress
      await progressService.upsertMonthlyProgress(globalProgram, monthNames, targetMonth, targetYear, payload);

      // 2. Insert Sales Data
      const fuzzyKeyword = getFuzzyKeyword(globalProgram);
      await salesService.upsertSalesData(globalProgram, monthNames, targetMonth, targetYear, payload, fuzzyKeyword);

      // 3. Upload Evidence Files and Save to Database
      await evidenceService.uploadAndInsertEvidence(globalProgram, targetMonth, targetYear, payload.evidenceFiles);

      // 4. Refresh data
      get().fetchData();
      return { success: true };
    } catch (error) {
      console.error("Save Data Error:", error);
      return { success: false, error };
    }
  }
}));

export default useAppStore;
