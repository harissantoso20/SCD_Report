import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PenTool, RotateCcw, Check, X, ShieldCheck } from 'lucide-react';

export default function SignaturePadModal({
  isOpen,
  onClose,
  onSave,
  title = 'Tanda Tangan Digital Langsung di Layar',
  signerName = '',
  roleName = ''
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Setup high-DPI canvas resolution
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a'; // Deep slate stroke for clear, formal signature

    setHasSigned(false);
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;

    // Export transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a8a] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-800/80 rounded-lg">
              <PenTool className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{title}</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {roleName ? `${roleName}` : 'Verifikasi Tanda Tangan Digital'}
                {signerName ? ` • ${signerName}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Gunakan jari, stylus, atau mouse di area bawah untuk menandatangani:
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-600 font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulangi / Hapus
            </button>
          </div>

          {/* Canvas Signature Pad Area */}
          <div className="relative w-full h-64 bg-white border-2 border-dashed border-slate-300 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              style={{ touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Guide line inside canvas */}
            <div className="absolute bottom-10 left-8 right-8 border-b border-dashed border-slate-300 pointer-events-none flex justify-between items-center text-[11px] text-slate-400">
              <span>Area Tanda Tangan</span>
              <span>{signerName || 'Tanda Tangan di Sini'}</span>
            </div>

            {!hasSigned && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                <PenTool className="w-8 h-8 mb-2 opacity-30 text-[#1e3a8a]" />
                <span className="text-xs font-semibold opacity-60">Goreskan tanda tangan Anda di sini</span>
              </div>
            )}
          </div>

          {signerName && (
            <div className="text-center text-xs font-semibold text-slate-700">
              Tertanda: <span className="font-bold text-slate-900">{signerName}</span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSigned}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-red-600 disabled:opacity-40 disabled:hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Hapus
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasSigned}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan Tanda Tangan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
