import { supabase } from '../lib/supabaseClient';
import { sanitizeString } from '../utils/sanitize';

export const progressService = {
  fetchMonthlyProgress: async (fuzzyKeyword, targetYear, monthNames, targetMonthIdx) => {
    const { data, error } = await supabase
      .from('SCD_Report_Monthly_Progress')
      .select('*')
      .ilike('Program', fuzzyKeyword)
      .eq('Tahun', targetYear)
      .in('Bulan', monthNames)
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return {
        period_date: `${targetYear}-${(targetMonthIdx + 1).toString().padStart(2, '0')}-01`,
        past_month_realization: data.Realisasi,
        next_month_plan: data['Rencana kerja'],
        budget_realization_text: data['Penyerapan anggaran'] || "-",
      };
    }
    return null;
  },

  upsertMonthlyProgress: async (globalProgram, monthNames, targetMonth, targetYear, payload) => {
    // 1. Delete old progress
    const { error: delErr } = await supabase.from('SCD_Report_Monthly_Progress')
      .delete()
      .eq('Program', globalProgram)
      .in('Bulan', monthNames)
      .eq('Tahun', targetYear);
    
    if (delErr) throw delErr;

    // 2. Sanitize and Insert new progress
    const progressPayload = {
      "Program": globalProgram,
      "Bulan": targetMonth,
      "Tahun": targetYear,
      "Realisasi": sanitizeString(payload.monthlyProgress?.past_month_realization) || "-",
      "Rencana kerja": sanitizeString(payload.monthlyProgress?.next_month_plan) || "-"
    };
      
    const { error: insErr } = await supabase.from('SCD_Report_Monthly_Progress').insert([progressPayload]);
    if (insErr) throw insErr;
  }
};
