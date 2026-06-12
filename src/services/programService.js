import { supabase } from '../lib/supabaseClient';

export const programService = {
  fetchProgramList: async () => {
    const { data, error } = await supabase.from('SCD_Report_Programs').select('Program');
    if (error) throw error;
    
    if (data) {
      let uniquePrograms = [...new Set(data.map(p => p.Program))];
      uniquePrograms = uniquePrograms.filter(p => !p.toLowerCase().includes("kalium humat"));
      if (!uniquePrograms.includes("PROKLIM")) {
        uniquePrograms.push("PROKLIM");
      }
      return uniquePrograms;
    }
    return [];
  },

  fetchProgramContext: async (globalProgram) => {
    const { data, error } = await supabase
      .from('SCD_Report_Programs')
      .select('*')
      .eq('Program', globalProgram)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows, which is fine
      throw error;
    }

    if (data) {
      return {
        name: data.Program,
        location: data.Lokasi,
        beneficiaries: data['Penerima Manfaat'],
        objective: data.Objective,
        kpi: data.KPI,
        tpb: data["TPB/SDG's"],
        budget_text: data.Anggaran
      };
    }
    return null;
  },

  fetchPLTSLocations: async (globalProgram) => {
    const pProgram = (globalProgram || '').toLowerCase();
    if (pProgram === 'plts irigasi') {
      const { data, error } = await supabase.from('SCD_Report_PLTS_Location').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map(p => ({
          location_name: p.Desa,
          capacity_kwp: Number(p.kWp) || 0,
          area_ha: Number(p['Luas Lahan (Ha)']) || 0,
          farmers: Number(p['Jumlah Petani']) || 0,
          kecamatan: p.Kecamatan,
          kabupaten: p.Kabupaten,
          provinsi: p.Provinsi,
          map_link: p['Link Google Map']
        }));
      }
    }
    return [];
  }
};
