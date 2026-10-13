import React, { useState, useEffect } from 'react';
import { 
  Sparkles, RefreshCw, Copy, Check, AlertTriangle, ShieldCheck, 
  TrendingUp, Info, CheckSquare, Target, Calendar, MapPin, FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateText, DEFAULT_GEMINI_MODEL } from '../../lib/geminiClient';

export default function MonitoringAIEvaluation({ selectedRecord = null }) {
  // Store evaluations keyed by record ID so switching back and forth preserves previous AI outputs
  const [evaluationsCache, setEvaluationsCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const recordId = selectedRecord?.id || 'none';
  const currentAnalysisText = evaluationsCache[recordId] || '';

  const runEvaluation = async () => {
    if (!selectedRecord) {
      setErrorMsg('Pilih/centang salah satu program pada tabel monitoring terlebih dahulu.');
      return;
    }

    const items = Array.isArray(selectedRecord.items) ? selectedRecord.items : [];
    if (items.length === 0) {
      setErrorMsg('Dokumen program ini belum memiliki rincian uraian dan kendala monitoring untuk dianalisis.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Prepare detailed context for the selected program
    const itemsContext = items.map((it, idx) => 
      `Baris ${idx + 1}:
- Uraian / Kondisi Lapangan: ${it.uraian || '-'}
- Kendala / Permasalahan: ${it.kendala || 'Tidak ada'}
- Rencana Tindak Lanjut yang Diajukan Tim: ${it.tindak_lanjut || '-'}`
    ).join('\n\n');

    const prompt = `
Anda adalah Senior Sustainability Evaluator & TJSL Risk Analyst PT Bukit Asam (Persero) Tbk.

Tugas Anda adalah melakukan "EVALUASI MANAJEMEN TAHAP PERTAMA DARI HASIL MONITORING LAPANGAN" khusus untuk program yang dipilih berikut ini:

--- DATA DOKUMEN MONITORING LAPANGAN ---
Program TJSL: ${selectedRecord.program}
Tanggal Monitoring: ${selectedRecord.tanggal} (${selectedRecord.hari || '-'})
Lokasi Pelaksanaan: ${selectedRecord.lokasi || '-'}
Keterangan Fokus: ${selectedRecord.keterangan || '-'}
PIC Sustainability PTBA: ${selectedRecord.pic_sustainability || '-'}
Perwakilan Penerima Manfaat: ${selectedRecord.penerima_manfaat || '-'}

RINCIAN TEMUAN MONITORING:
${itemsContext}
--- AKHIR DATA ---

Mohon susun laporan "Evaluasi Tahap Pertama Hasil Monitoring" dalam format Markdown resmi, terstruktur rapi, dan mudah dibaca oleh pimpinan divisi:

### 1. 🔍 Diagnosis Akar Masalah & Titik Kritis (Root Cause Analysis)
- Berikan analisis tajam mengenai faktor penyebab utama dari kendala di atas (apakah aspek teknis sarana prasarana, kapasitas kelompok mitra, akses pasar, atau faktor eksternal).
- Sorot implikasi jangka pendek dan jangka panjang terhadap keberlanjutan program ${selectedRecord.program}.

### 2. ⚠️ Matriks Urgensi & Klasifikasi Risiko
Tampilkan dalam format TABEL MARKDOWN yang rapi dengan baris baru yang jelas:

| No | Isu / Kendala Utama | Tingkat Risiko | Dampak Operasional & Bisnis | Prioritas Penanganan |
| :---: | :--- | :---: | :--- | :---: |
| 1 | [Tulis ringkasan isu] | [TINGGI / SEDANG / RENDAH] | [Dampak spesifik] | [Segera / Terjadwal] |

*(Pastikan setiap baris tabel memiliki pemisah baris baru yang bersih)*.

### 3. ⚖️ Evaluasi Kualitas Rencana Tindak Lanjut Lapangan
- Nilai secara kritis apakah rencana tindak lanjut yang diajukan oleh tim lapangan sudah tepat sasaran dan realistis.
- Tunjukkan celah atau potensi kegagalan eksekusi jika rencana tersebut dijalankan tanpa intervensi manajerial.

### 4. 📌 Rekomendasi Tindakan Strategis Manajemen TJSL PTBA
- Berikan 3 poin rekomendasi intervensi manajerial konkret (alokasi dukungan, supervisi tambahan, atau penyesuaian SOP) khusus untuk program ${selectedRecord.program}.

Gunakan Bahasa Indonesia formal, lugas, profesional standar BUMN, dan jangan menggabungkan kolom tabel menjadi satu paragraf.
`;

    try {
      const response = await generateText(prompt, DEFAULT_GEMINI_MODEL, true);
      setEvaluationsCache((prev) => ({
        ...prev,
        [recordId]: response
      }));
    } catch (err) {
      console.error('AI Evaluation error:', err);
      setErrorMsg(err.message || 'Gagal menjalankan evaluasi AI. Periksa koneksi internet atau konfigurasi model.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentAnalysisText) return;
    navigator.clipboard.writeText(currentAnalysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden mb-6">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-[#1e3a8a] text-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold tracking-wide">
                Evaluasi Tahap I Hasil Monitoring (AI Insight)
              </h3>
              {selectedRecord ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {selectedRecord.program}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30 uppercase">
                  Pilih Dokumen
                </span>
              )}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              {selectedRecord
                ? `Fokus Evaluasi: ${selectedRecord.lokasi || '-'} (${selectedRecord.tanggal}) • ${Array.isArray(selectedRecord.items) ? selectedRecord.items.length : 0} temuan lapangan`
                : 'Pilih salah satu dokumen program pada tabel di bawah untuk melihat analisis khusus program tersebut.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {currentAnalysisText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
              title="Salin hasil evaluasi"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Evaluasi'}</span>
            </button>
          )}

          <button
            onClick={runEvaluation}
            disabled={loading || !selectedRecord}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-gray-900 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Menganalisis Dokumen...' : selectedRecord ? `Evaluasi ${selectedRecord.program}` : 'Pilih Dokumen Dulu'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STATE 1: No Record Selected in Checkbox */}
        {!selectedRecord ? (
          <div className="py-8 px-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/70">
            <CheckSquare className="w-10 h-10 text-[#1e3a8a] opacity-40 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-gray-800">
              Belum Ada Program yang Dicentang
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              Silakan <strong>centang kotak pilihan (checkbox)</strong> di sebelah nomor pada tabel arsip di bawah ini untuk melihat atau menjalankan evaluasi AI khusus untuk dokumen program tersebut.
            </p>
          </div>
        ) : loading ? (
          /* STATE 2: Loading Analysis */
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-800">
              Gemini AI sedang mengevaluasi temuan program: <span className="text-[#1e3a8a]">{selectedRecord.program}</span>
            </p>
            <p className="text-xs text-gray-500 max-w-md text-center">
              Mendiagnosis akar masalah di {selectedRecord.lokasi || 'lapangan'}, menyusun matriks risiko, dan merumuskan arahan manajerial...
            </p>
          </div>
        ) : currentAnalysisText ? (
          /* STATE 3: Render Markdown with Gorgeous Table & Typography */
          <div className="bg-slate-50/70 p-6 rounded-xl border border-gray-200">
            <div className="mb-4 pb-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{selectedRecord.program}</span>
                <span>•</span>
                <span>{selectedRecord.tanggal}</span>
                <span>•</span>
                <span>{selectedRecord.lokasi || '-'}</span>
              </div>
              <span className="text-[11px] bg-blue-100 text-[#1e3a8a] px-2 py-0.5 rounded-md font-semibold">
                Evaluasi Tahap I Aktif
              </span>
            </div>

            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom Table Styling for clean GFM display
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-5 rounded-xl border border-gray-300 shadow-xs bg-white">
                    <table className="w-full text-xs text-left border-collapse" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-[#1e3a8a] text-white uppercase text-[11px] font-bold tracking-wider" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="p-3 border border-blue-900 text-left font-bold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="p-3 border border-gray-200 align-top leading-relaxed text-gray-800" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="even:bg-gray-50 hover:bg-blue-50/40 transition-colors" {...props} />
                ),
                // Heading Styling
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-bold text-gray-900 mt-6 mb-2.5 pb-1.5 border-b border-gray-200 flex items-center gap-1.5" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-sm font-bold text-gray-800 mt-4 mb-2" {...props} />
                ),
                // Paragraph & List
                p: ({ node, ...props }) => (
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed my-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1.5 text-xs md:text-sm text-gray-700" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 my-2 space-y-1.5 text-xs md:text-sm text-gray-700" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-gray-900" {...props} />
                )
              }}
            >
              {currentAnalysisText}
            </ReactMarkdown>
          </div>
        ) : (
          /* STATE 4: Record selected but evaluation not run yet */
          <div className="py-8 px-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/70">
            <Info className="w-9 h-9 text-[#1e3a8a] opacity-70 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-800">
              Evaluasi Belum Dijalankan untuk {selectedRecord.program}
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              Dokumen terpilih: <strong>{selectedRecord.program}</strong> ({selectedRecord.tanggal}). Klik tombol <strong className="text-[#1e3a8a]">"Evaluasi {selectedRecord.program}"</strong> di atas untuk memperoleh diagnosis akar masalah, matriks risiko berbentuk tabel, dan rekomendasi manajerial.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-[11px] text-gray-600">
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Analisis Akar Kendala
              </span>
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Tabel Matriks Risiko
              </span>
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Rekomendasi Pimpinan
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
