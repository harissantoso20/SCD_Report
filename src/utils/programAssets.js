import imgPlts from '../assets/banner/1. PLTS Irigasi.png';
import imgMaggot from '../assets/banner/2. BUDIDAYA MAGGOT.png';
import imgIkanAirTawar from '../assets/banner/3. BUDIDAYA IKAN AIR TAWAR.png';
import imgSiba from '../assets/banner/4. SIBA PEMBIBITAN.png';
import imgPuyuhSeleman from '../assets/banner/5. BUDIDAYA PUYUH PETELUR SELEMAN.png';
import imgPuyuhDarmo from '../assets/banner/6. Budidaya Puyuh Petelur Darmo.png';
import imgEcogrow from '../assets/banner/7. ECOGROW MOM UTUM MAKMUR.png';
import imgCahayaTani from '../assets/banner/8. POKTAN CAHAYA TANI.png';
import imgItikPetelur from '../assets/banner/9. BUDIDAYA ITIK PETELUR.png';
import imgLingkarTambang from '../assets/banner/10. SUSCOMDEV LINGKAR TAMBANG.png';
import imgPrabumenang from '../assets/banner/11. SUSCOMDEV PRABUMENANG.png';
import imgRasSystem from '../assets/banner/12. BUDIDAYA RAS SYSTEM.png';
import imgBamaxi from '../assets/banner/13. BA-MAXI.png';
import imgTamanKehati from '../assets/banner/14. Revitalisasi Taman Kehati Bedegung.png';
import imgSirahPulau from '../assets/banner/15. Pengembangan Desa Sirah Pulau.png';
import imgProklim from '../assets/banner/16. Proklim.png';

export const PROGRAM_IMAGES = {
  "PLTS Irigasi": imgPlts,
  "Budidaya Maggot BSF": imgMaggot,
  "Budidaya Ikan Air Tawar": imgIkanAirTawar,
  "SIBA Pembibitan": imgSiba,
  "Budidaya Puyuh Petelur (Seleman)": imgPuyuhSeleman,
  "Budidaya Puyuh Petelur (Darmo)": imgPuyuhDarmo,
  "EcoGrow Mom Utun Makmur": imgEcogrow,
  "Poktan Cahaya Tani": imgCahayaTani,
  "Budidaya Itik Petelur": imgItikPetelur,
  "Suscomdev Lingkar Tambang": imgLingkarTambang,
  "Suscomdev Prabumenang": imgPrabumenang,
  "Budidaya Ikan RAS System": imgRasSystem,
  "BA-MAXI": imgBamaxi,
  "Revitalisasi Taman Kehati": imgTamanKehati,
  "Suscomdev Sirah Pulau": imgSirahPulau,
  "PROKLIM": imgProklim,
  "default": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
};

export const PROGRAMS = [
  "PLTS Irigasi", "Budidaya Maggot BSF", "Budidaya Ikan Air Tawar", "SIBA Pembibitan", 
  "Budidaya Puyuh Petelur (Seleman)", "Budidaya Puyuh Petelur (Darmo)", "EcoGrow Mom Utun Makmur", 
  "Poktan Cahaya Tani", "Budidaya Itik Petelur", "Suscomdev Lingkar Tambang", "Suscomdev Sirah Pulau", 
  "Suscomdev Prabumenang", "Budidaya Ikan RAS System", "BA-MAXI", "PROKLIM", "Revitalisasi Taman Kehati"
];

/**
 * Maps a raw program name (e.g. from Ring 1 UPTE or Map Locations) and desa to the active dashboard program name.
 * Returns null if the program is not yet active / does not have a dedicated dashboard (e.g. Persiapan...).
 */
export function getDashboardProgram(rawName, desa = '', programList = []) {
  if (!rawName || typeof rawName !== 'string') return null;
  const p = rawName.toLowerCase().trim();
  const d = (desa || '').toLowerCase().trim();

  // Exclude programs that are still in preparation or not yet implemented
  if (p.startsWith('persiapan') || p.includes('belum ada program')) {
    return null;
  }

  let targetKey = null;
  if (p.includes('plts') || p.includes('irigasi')) targetKey = 'plts';
  else if (p.includes('maggot') || p.includes('sampah organik')) targetKey = 'maggot';
  else if (p.includes('ras system') || (p.includes('kolam pangan') && p.includes('ras'))) targetKey = 'ras system';
  else if (p.includes('ikan air tawar') || p.includes('bara agro')) targetKey = 'ikan air tawar';
  else if (p.includes('siba') || p.includes('pembibitan') || p.includes('santri agro')) targetKey = 'siba';
  else if (p.includes('puyuh')) {
    if (d.includes('seleman') || p.includes('seleman')) targetKey = 'seleman';
    else targetKey = 'darmo';
  }
  else if (p.includes('ecogrow') || p.includes('mom utun') || p.includes('mom utum')) targetKey = 'ecogrow';
  else if (p.includes('cahaya tani')) targetKey = 'cahaya tani';
  else if (p.includes('itik') || p.includes('telur omega')) targetKey = 'itik';
  else if (p.includes('lingkar tambang') || p.includes('melon') || p.includes('smart green house')) targetKey = 'lingkar tambang';
  else if (p.includes('prabumenang') || p.includes('tempe') || p.includes('co-elevation')) targetKey = 'prabumenang';
  else if (p.includes('ba-maxi') || p.includes('bamaxi')) targetKey = 'ba-maxi';
  else if (p.includes('sirah pulau')) targetKey = 'sirah pulau';
  else if (p.includes('proklim')) targetKey = 'proklim';
  else if (p.includes('taman kehati') || p.includes('bedegung')) targetKey = 'kehati';

  if (!targetKey) return null;

  // Search in programList first (to match case from database if available)
  const candidateList = Array.isArray(programList) && programList.length > 0 ? programList : PROGRAMS;
  const matched = candidateList.find(prog => prog.toLowerCase().includes(targetKey));
  
  if (matched) return matched;

  // Fallback to default PROGRAMS
  return PROGRAMS.find(prog => prog.toLowerCase().includes(targetKey)) || null;
}
