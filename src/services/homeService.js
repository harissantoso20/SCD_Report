import { supabase } from '../lib/supabaseClient';

export const homeService = {
  fetchHomeData: async (monthNames, targetYear) => {
    // 1. Fetch Ring 1 Data
    const { data: ring1Data, error: ring1Error } = await supabase
      .from('SCD_Report_Ring1_UPTE')
      .select('*');
      
    if (ring1Error) throw ring1Error;

    // 2. Fetch PLTS Data (for outside Ring 1)
    const { data: pltsData, error: pltsError } = await supabase
      .from('SCD_Report_PLTS_Location')
      .select('*');
      
    if (pltsError) throw pltsError;

    // 3. Process Ring 1 Data
    const ring1 = ring1Data || [];
    
    // Count unique locations
    const uniqueDesa = new Set();
    const uniqueKec = new Set();
    const uniqueKab = new Set();
    const uniquePrograms = new Set();
    const uniqueProgramDesa = new Set();
    
    const sektorCount = {
      'Perkebunan': 0,
      'Peternakan': 0,
      'Industri': 0,
      'Perikanan': 0,
      'Infrastruktur': 0
    };

    const groupedByLocation = {};

    ring1.forEach(item => {
      // Safely access fields since user might have used different names
      const desa = item['Desa/Kelurahan'] || item.Desa || '';
      const kec = item.Kecamatan || '';
      const kab = item.Kabupaten || '';
      const program = item['Program PPM'] || item.Program || '';
      const sektor = item.Sektor || 'Lainnya';
      
      if (desa && desa !== '-') {
        uniqueDesa.add(desa);
      }
      if (kec && kec !== '-') uniqueKec.add(kec);
      if (kab && kab !== '-') uniqueKab.add(kab);
      
      if (program && program !== '-') {
        uniquePrograms.add(program);
        if (desa && desa !== '-') uniqueProgramDesa.add(desa);
        
        // Group for "PROGRAM BERJALAN DI LOKASI RING 1 TEMS"
        const regionKey = `[${kec}], [${kab}]`;
        if (!groupedByLocation[regionKey]) {
          groupedByLocation[regionKey] = {};
        }
        if (!groupedByLocation[regionKey][desa]) {
          groupedByLocation[regionKey][desa] = [];
        }
        groupedByLocation[regionKey][desa].push(program);
      }
      
      // Count Sektor for all rows that have a valid Sektor
      const rawSektor = (item.Sektor || '').trim();
      if (rawSektor && rawSektor !== '-' && rawSektor.toLowerCase() !== 'null') {
        const s = rawSektor.toLowerCase();
        if (s.includes('kebun') || s.includes('tani') || s.includes('agric')) {
          sektorCount['Perkebunan']++;
        } else if (s.includes('ternak') || s.includes('hewan')) {
          sektorCount['Peternakan']++;
        } else if (s.includes('industri') || s.includes('olah') || s.includes('pabrik')) {
          sektorCount['Industri']++;
        } else if (s.includes('ikan') || s.includes('lele') || s.includes('air')) {
          sektorCount['Perikanan']++;
        } else if (s.includes('infra') || s.includes('insfra') || s.includes('plts') || s.includes('bangun')) {
          sektorCount['Infrastruktur']++;
        } else {
          sektorCount[rawSektor] = (sektorCount[rawSektor] || 0) + 1;
        }
      }
    });

    // 4. Process PLTS (Luar Ring 1)
    const plts = pltsData || [];
    const luarRing1Programs = plts
      .filter(item => item.Keterangan && item.Keterangan.toLowerCase().includes('luar ring 1'))
      .map(item => `PLTS Irigasi Desa ${item.Desa}`);

    // 5. Fetch Monthly Progress for selected period
    let monthlyProgress = [];
    if (monthNames && targetYear) {
      const { data, error } = await supabase
        .from('SCD_Report_Monthly_Progress')
        .select('*')
        .eq('Tahun', targetYear)
        .in('Bulan', monthNames);
      if (!error && data) monthlyProgress = data;
    }

    // 6. Fetch Sales Data for selected period
    let salesData = [];
    if (monthNames && targetYear) {
      const { data, error } = await supabase
        .from('SCD_Report_Sales_Data')
        .select('*')
        .eq('Tahun', targetYear)
        .in('Bulan', monthNames);
      if (!error && data) salesData = data;
    }

    return {
      totalLokasi: {
        desa: uniqueDesa.size,
        kec: uniqueKec.size,
        kab: uniqueKab.size
      },
      totalProgram: {
        program: uniquePrograms.size,
        desa: uniqueProgramDesa.size
      },
      sektorCount,
      luarRing1Programs,
      groupedByLocation,
      mapData: ring1,
      monthlyProgress,
      salesData
    };
  }
};
