import { create } from 'zustand';

const useAppStore = create((set) => ({
  activeTab: "Dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  globalProgram: "PLTS Irigasi",
  setGlobalProgram: (program) => set({ globalProgram: program }),
  
  globalDate: new Date().toISOString().split('T')[0],
  setGlobalDate: (date) => set({ globalDate: date }),
}));

export default useAppStore;
