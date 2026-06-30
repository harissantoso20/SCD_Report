import { programService } from "./programService";
import { progressService } from "./progressService";
import { salesService } from "./salesService";
import { evidenceService } from "./evidenceService";
import { getFuzzyKeyword } from "../utils/programUtils";
import { generateText } from "../lib/geminiClient";
import { supabase } from "../lib/supabaseClient";

// REPLACE THIS WITH YOUR GAS WEB APP URL ONCE DEPLOYED
export const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby12e9TLKdgySeyKX-rR9xNaVoAFAgpx5xr7CwR_QuhDJK_Uo8Q3qChBNkfGimMkiHK/exec";


export const generateGoogleSlide = async (globalDate, existingReportStatement) => {
  const targetYear = globalDate.split('-')[0];
  const currentMonthStr = globalDate.split('-')[1];
  const targetMonthIdx = parseInt(currentMonthStr, 10) - 1;
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const currentMonthName = monthNames[targetMonthIdx];
  const periodStr = `${currentMonthName} ${targetYear}`;

  // 1. Fetch all programs
  const programList = await programService.fetchProgramList();
  const programsData = [];

  for (const program of programList) {
    const fuzzyKeyword = getFuzzyKeyword(program);

    // Fetch Data for the program
    const context = await programService.fetchProgramContext(program);
    const progressList = await progressService.fetchMonthlyProgress(fuzzyKeyword, targetYear, monthNames, targetMonthIdx);
    const progress = progressList && progressList.length > 0 ? progressList[0] : null;
    const { salesData } = await salesService.fetchSalesData(fuzzyKeyword, program, targetYear);
    const evidence = await evidenceService.fetchEvidenceData(fuzzyKeyword, targetYear, monthNames);

    // Generate insight specifically for the slide
    const prompt = `
Kamu adalah seorang Senior Data Analyst profesional. Tugasmu adalah memberikan "Insight Analitik" berupa catatan overview naratif yang komprehensif untuk program "${program}" pada periode ${periodStr}.
Data Kuantitatif: ${JSON.stringify(progress)}
Data Sales: ${JSON.stringify(salesData)}
Buat 1-2 paragraf laporan yang sangat objektif dan faktual (bahasa Indonesia) layaknya papan informasi data. JANGAN gunakan gaya bercerita atau sapaan. PASTIKAN: Tulis dalam teks polos (plain text). JANGAN GUNAKAN format markdown seperti bintang (**) atau pagar (#).
`;
    let insight = "Tidak ada insight khusus.";
    try {
      // Add a 2-second delay to avoid HTTP 429 Too Many Requests (Rate Limiting)
      await new Promise(resolve => setTimeout(resolve, 2000));
      insight = await generateText(prompt);
    } catch (e) {
      console.warn("Gagal generate insight untuk", program);
    }

    let chartUrl = null;
    if (salesData && salesData.length > 0) {
      const labels = [...new Set(salesData.map(s => s.Bulan.substring(0,3)))];
      const dataPoints = labels.map(m => {
        const rows = salesData.filter(s => s.Bulan.substring(0,3) === m);
        return rows.reduce((sum, r) => sum + (r.Omzet || 0), 0);
      });
      
      const chartConfig = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Omzet (Rp)',
            data: dataPoints,
            borderColor: '#d92a2a',
            backgroundColor: 'rgba(217, 42, 42, 0.1)',
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          title: { display: true, text: 'Tren Omzet Keseluruhan', fontSize: 14 }
        }
      };
      chartUrl = `https://quickchart.io/chart?w=500&h=300&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    }

    programsData.push({
      name: program,
      location: context?.location || "-",
      objective: context?.objective || "-",
      kpi: context?.kpi || "-",
      budget: context?.budget_text || "-",
      beneficiaries: context?.beneficiaries || "-",
      tpb: context?.tpb || "-",
      realizationCost: progress?.Realisasi_Biaya_Formatted || "-",
      progress: progress?.Realisasi || "-",
      plan: progress?.Rencana_Tindak_Lanjut || "-",
      insight: insight,
      evidence: evidence ? evidence.map(e => e.File_Url) : [],
      chartUrl: chartUrl
    });
  }

  // Generate Executive Summary for the presentation
  let reportStatement = existingReportStatement || "Laporan Eksekutif SCD";
  if (!existingReportStatement || existingReportStatement.includes("Gagal") || existingReportStatement.includes("**")) {
    const sumPrompt = `Buat 2 paragraf executive summary untuk seluruh program pemberdayaan bulan ${periodStr}. Instruksi: Buat laporan sangat objektif, to the point, dan langsung pada inti data seperti papan informasi. JANGAN gunakan gaya bercerita/sapaan. PASTIKAN: Tulis dalam teks polos (plain text), jangan gunakan format markdown seperti bintang (**) atau pagar (#).`;
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      reportStatement = await generateText(sumPrompt);
    } catch (e) { }
  }

  const payload = {
    period: periodStr,
    reportStatement,
    programs: programsData
  };

  // 2. Call Google Apps Script Web App
  const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "text/plain;charset=utf-8", // GAS sometimes prefers text/plain to avoid CORS preflight issues
    }
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Gagal membuat Google Slide di server.");
  }

  // 3. Save to Supabase
  const { data, error } = await supabase
    .from('presentations')
    .insert([
      { period: periodStr, slide_url: result.url }
    ])
    .select();

  if (error) {
    console.error("Gagal menyimpan link presentasi ke Supabase", error);
  }

  return {
    url: result.url,
    record: data ? data[0] : null
  };
};

export const fetchPresentations = async () => {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
