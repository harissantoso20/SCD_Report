import React, { useEffect } from 'react';
import { UploadCloud, Database, AlertCircle } from 'lucide-react';

export default function SavingOverlay({ 
  title = "Menyimpan Data & Mengunggah Eviden...", 
  subtitle = "Sistem sedang mengunggah berkas dokumentasi ke Google Drive terpusat dan merekam data ke server.",
  isUploadingEvidence = true 
}) {
  // Prevent accidental tab close or page reload while saving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Proses penyimpanan data sedang berlangsung. Harap jangan menutup halaman ini.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center text-center overflow-hidden">
        
        {/* Animated Glow Halo */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Outer Pulsing Spinner Circle */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-[#1e3a8a] border-r-amber-400 animate-spin flex items-center justify-center"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-6 h-6 text-[#1e3a8a] animate-bounce" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-gray-600 leading-relaxed mb-5 max-w-sm">
          {subtitle}
        </p>

        {/* Animated Shimmer Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative mb-5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-700 via-amber-400 to-[#1e3a8a] rounded-full w-2/3 animate-shimmer"
            style={{
              animation: 'shimmer 1.8s infinite ease-in-out'
            }}
          ></div>
        </div>

        {/* Important Warning Notice Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 font-semibold shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Harap jangan menutup atau memuat ulang halaman ini.</span>
        </div>

        {/* GDrive & Cloud Status indicator */}
        {isUploadingEvidence && (
          <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sinkronisasi Google Drive & Basis Data Cloud</span>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(150%);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}} />
    </div>
  );
}
