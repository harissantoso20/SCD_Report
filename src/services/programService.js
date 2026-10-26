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
        description: data.Description || data.Objective,
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
        return data.map(p => {
          // Parse latitude & longitude from database if available
          const rawLat = p.Latitude ?? p.latitude ?? p.Lat ?? p.lat;
          const rawLng = p.Longitude ?? p.longitude ?? p.Lng ?? p.lng ?? p.Long ?? p.long;
          
          let parsedLat = (rawLat !== undefined && rawLat !== null && rawLat !== '') ? parseFloat(rawLat) : null;
          let parsedLng = (rawLng !== undefined && rawLng !== null && rawLng !== '') ? parseFloat(rawLng) : null;

          const mapLink = p['Link Google Map'] || p.map_link || p.Lokasi || '';

          // Fallback parsing from Google Maps URL if lat/lng columns are not populated
          if ((parsedLat === null || isNaN(parsedLat) || parsedLng === null || isNaN(parsedLng)) && mapLink) {
            const matchCoord = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || mapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (matchCoord) {
              parsedLat = parseFloat(matchCoord[1]);
              parsedLng = parseFloat(matchCoord[2]);
            }
          }

          const validLat = (!isNaN(parsedLat) && parsedLat !== null) ? parsedLat : null;
          const validLng = (!isNaN(parsedLng) && parsedLng !== null) ? parsedLng : null;

          return {
            id: p.id,
            location_name: p.Desa || p.nama_lokasi || p.location_name || '',
            desa: p.Desa || p.nama_lokasi || p.location_name || '',
            capacity_kwp: Number(p.kWp ?? p.capacity_kwp ?? p.kapasitas) || 0,
            area_ha: Number(p['Luas Lahan (Ha)'] ?? p.area_ha ?? p.luas_lahan) || 0,
            farmers: Number(p['Jumlah Petani'] ?? p.farmers ?? p.jumlah_petani) || 0,
            kecamatan: p.Kecamatan || p.kecamatan || '',
            kabupaten: p.Kabupaten || p.kabupaten || '',
            provinsi: p.Provinsi || p.provinsi || '',
            map_link: mapLink,
            lat: validLat,
            lng: validLng,
            latitude: validLat,
            longitude: validLng,
            keterangan: p.Keterangan || p.keterangan || ''
          };
        });
      }
    }
    return [];
  },

  updateProgramContext: async (globalProgram, contextData) => {
    if (!globalProgram || !contextData) return;
    const { error } = await supabase
      .from('SCD_Report_Programs')
      .update({
        Lokasi: contextData.location || '',
        'Penerima Manfaat': contextData.beneficiaries || '',
        Objective: contextData.objective || '',
        KPI: contextData.kpi || '',
        "TPB/SDG's": contextData.tpb || '',
        Anggaran: contextData.budget_text || ''
      })
      .eq('Program', globalProgram);

    if (error) {
      console.error('Error updating program context in Supabase:', error);
    }
  }
};
