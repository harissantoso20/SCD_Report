import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { generateText } from '../../lib/geminiClient';
import ReactMarkdown from 'react-markdown';

// In-memory cache for insights
const insightCache = new Map();

export default function GeminiInsight({ 
  programName, 
  period, 
  quantitativeData, 
  qualitativeData,
  headerAction
}) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInsight = async () => {
      // Return early if no data
      if (!quantitativeData && !qualitativeData) return;

      const cacheKey = `${programName}-${period}`;
      if (insightCache.has(cacheKey)) {
        setInsight(insightCache.get(cacheKey));
        return;
      }

      setIsLoading(true);
      setError(null);

      const prompt = `
Kamu adalah seorang Senior Data Analyst profesional. Tugasmu adalah memberikan "Insight Analitik" berupa catatan overview naratif yang komprehensif, tajam, dan tidak monoton untuk program "${programName}" pada periode ${period}.

Berikut adalah data kuantitatif yang tersedia (format JSON):
${JSON.stringify(quantitativeData, null, 2)}

Berikut adalah data kualitatif/catatan lapangan yang tersedia (format JSON/Text):
${JSON.stringify(qualitativeData, null, 2)}

Instruksi:
1. Buat insight analitik yang sangat objektif, to the point, dan langsung pada fakta data seperti teks pada papan informasi.
2. DILARANG KERAS menggunakan sapaan, basa-basi, atau gaya bahasa bercerita. Langsung paparkan inti analisis.
3. Gunakan bahasa korporat baku yang tegas dan lugas.
4. Hindari kata-kata kiasan atau kalimat berbunga-bunga. Fokus pada metrik dan kinerja.
5. Soroti capaian utama secara kuantitatif.
6. Hubungkan data kualitatif dengan kuantitatif secara ringkas.
7. Berikan rekomendasi strategis singkat di akhir.
8. Output harus dalam format Markdown yang rapi (gunakan bold untuk angka penting).
9. Panjang output maksimal 2 paragraf singkat.
10. Catatan penting: PETI adalah singkatan dari Pertambangan Tanpa Izin (bukan Pertambangan Emas Tanpa Izin). Tolong ingat ini jika ada data terkait PETI.
11. PENTING (ANTI-HALUSINASI): TIDAK ADA data pengeluaran atau biaya produksi di data ini. Semua metrik berupa uang (Rp) adalah OMZET / PENDAPATAN / PENJUALAN. JANGAN PERNAH menyimpulkannya sebagai biaya atau pengeluaran.
12. PENTING: Istilah "Konsumsi" merujuk pada "Produk Konsumsi" (misalnya Penjualan Ikan Konsumsi), BUKAN "Konsumsi Pakan" atau pemakaian bahan.
`;

      try {
        const response = await generateText(prompt);
        insightCache.set(cacheKey, response);
        if (isMounted) {
          setInsight(response);
        }
      } catch (err) {
        console.error("Gemini Error:", err);
        if (isMounted) setInsight(`Gagal menghasilkan insight AI. Error: ${err.message}`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInsight();

    return () => {
      isMounted = false;
    };
  }, [programName, period, quantitativeData, qualitativeData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col flex-1 relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full min-h-0">
      <div className="flex items-center justify-between mb-4 relative z-10 flex-shrink-0">
        <h4 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" />
          Insight Analitik
        </h4>
        {headerAction && <div>{headerAction}</div>}
      </div>
      
      <div className="flex-1 relative z-10 text-[13px] text-gray-700 leading-relaxed overflow-y-auto minimal-scrollbar min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-blue-600 font-medium text-xs animate-pulse">Menyusun catatan analitik...</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="markdown-content space-y-3 text-justify">
            <ReactMarkdown>{insight || "Belum ada insight yang dihasilkan."}</ReactMarkdown>
          </div>
        )}
      </div>
      
      {/* Decorative Sparkles */}
      <div className="absolute -bottom-6 -right-6 text-blue-50/50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        <Sparkles size={140} />
      </div>
    </div>
  );
}
