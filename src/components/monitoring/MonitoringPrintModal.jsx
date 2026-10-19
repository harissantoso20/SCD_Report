import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FileText, Camera, CheckSquare } from 'lucide-react';
import logoPTBA from '../../assets/logo/logo-ptba.png';

export default function MonitoringPrintModal({ record, onClose }) {
  const printAreaRef = useRef(null);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Format date nicely in Indonesian locale
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to extract Google Drive File ID
  const extractGDriveId = (url) => {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  };

  // Resolve best media URL for reliable rendering in preview and print sandbox
  // Uses direct lh3 CDN endpoint to eliminate 302 redirects which Chrome print preview blocks
  const resolveMediaUrl = (item) => {
    if (!item) return '';
    let target = item;
    if (typeof item === 'object') {
      if (item.preview && item.preview.startsWith('data:')) return item.preview;
      if (item.preview && item.preview.startsWith('blob:')) return item.preview;
      if (item.url) target = item.url;
      else if (item.preview) target = item.preview;
      else return '';
    }
    if (typeof target !== 'string') return '';
    if (target.startsWith('data:') || target.startsWith('blob:')) return target;

    const fileId = extractGDriveId(target);
    if (fileId) {
      // Direct Google CDN endpoint - NO 302 REDIRECT, delivers 200 OK image bytes directly
      return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    }
    return target;
  };

  // Fallback handler if Google CDN fails
  const handleImageFallback = (e, item) => {
    const raw = typeof item === 'string' ? item : (item?.url || item?.preview || '');
    const fileId = extractGDriveId(raw);
    if (fileId) {
      const attempt = Number(e.currentTarget.dataset.retry || 0);
      if (attempt === 0) {
        e.currentTarget.dataset.retry = '1';
        e.currentTarget.src = `https://lh3.googleusercontent.com/d/${fileId}`;
      } else if (attempt === 1) {
        e.currentTarget.dataset.retry = '2';
        e.currentTarget.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      } else if (attempt === 2) {
        e.currentTarget.dataset.retry = '3';
        e.currentTarget.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
  };

  const items = Array.isArray(record?.items) && record.items.length > 0
    ? record.items
    : [
        {
          no: 1,
          uraian: '-',
          kendala: '-',
          tindak_lanjut: '-'
        }
      ];

  const photos = Array.isArray(record?.foto_dokumentasi) ? record.foto_dokumentasi : [];
  const attendance = Array.isArray(record?.scan_daftar_hadir) ? record.scan_daftar_hadir : [];
  const hasAttachments = photos.length > 0 || attendance.length > 0;

  // Preload all images upon modal mount so Chrome print engine has them cached in memory
  useEffect(() => {
    const urls = [
      ...photos.map((p) => resolveMediaUrl(p)),
      ...attendance.map((a) => resolveMediaUrl(a))
    ].filter(Boolean);

    if (urls.length === 0) {
      setImagesReady(true);
      return;
    }

    let loadedCount = 0;
    const onDone = () => {
      loadedCount++;
      if (loadedCount >= urls.length) setImagesReady(true);
    };

    urls.forEach((url) => {
      const img = new Image();
      img.onload = onDone;
      img.onerror = onDone;
      img.src = url;
    });

    const fallbackTimer = setTimeout(() => setImagesReady(true), 1500);
    return () => clearTimeout(fallbackTimer);
  }, [photos, attendance]);

  const handlePrint = () => {
    // Brief 150ms buffer to ensure final paint before system print dialog spool
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Chunk photos to maximum 6 photos per A4 page to prevent overflow and maintain clean readability
  const PHOTOS_PER_PAGE = 6;
  const photoChunks = [];
  for (let i = 0; i < photos.length; i += PHOTOS_PER_PAGE) {
    photoChunks.push({
      photos: photos.slice(i, i + PHOTOS_PER_PAGE),
      startIndex: i,
      pageNumber: Math.floor(i / PHOTOS_PER_PAGE) + 1,
      totalPages: Math.ceil(photos.length / PHOTOS_PER_PAGE)
    });
  }

  // Adaptive, balanced layout for photos in each A4 sheet
  const renderPhotoGrid = (chunkPhotos, baseIndex) => {
    const count = chunkPhotos.length;

    // 1 Photo: Centered featured layout
    if (count === 1) {
      const photo = chunkPhotos[0];
      const idx = baseIndex;
      return (
        <div className="max-w-lg mx-auto border border-black p-3 bg-white flex flex-col items-center shadow-xs">
          <div className="w-full h-[450px] flex items-center justify-center bg-gray-50 overflow-hidden">
            <img
              src={resolveMediaUrl(photo)}
              alt={`Dokumentasi ${idx + 1}`}
              className="max-h-[450px] max-w-full object-contain border-0 outline-none block"
              loading="eager"
              decoding="sync"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageFallback(e, photo)}
            />
          </div>
          <div className="text-xs font-bold text-black mt-2.5 text-center border-t border-gray-200 pt-2 w-full truncate">
            Foto #{idx + 1} - {photo?.name || 'Dokumentasi Monitoring Lapangan'}
          </div>
        </div>
      );
    }

    // 2 Photos: Balanced 2 columns side by side
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-5">
          {chunkPhotos.map((photo, i) => {
            const idx = baseIndex + i;
            return (
              <div key={idx} className="border border-black p-2.5 bg-white flex flex-col items-center shadow-xs">
                <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 overflow-hidden">
                  <img
                    src={resolveMediaUrl(photo)}
                    alt={`Dokumentasi ${idx + 1}`}
                    className="max-h-[300px] max-w-full object-contain border-0 outline-none block"
                    loading="eager"
                    decoding="sync"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageFallback(e, photo)}
                  />
                </div>
                <div className="text-[11px] font-bold text-black mt-2 text-center border-t border-gray-200 pt-1.5 w-full truncate">
                  Foto #{idx + 1} - {photo?.name || 'Dokumentasi Monitoring Lapangan'}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 3 Photos: 2 on top, 1 centered on bottom
    if (count === 3) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {chunkPhotos.slice(0, 2).map((photo, i) => {
              const idx = baseIndex + i;
              return (
                <div key={idx} className="border border-black p-2 bg-white flex flex-col items-center shadow-xs">
                  <div className="w-full h-[220px] flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={resolveMediaUrl(photo)}
                      alt={`Dokumentasi ${idx + 1}`}
                      className="max-h-[220px] max-w-full object-contain border-0 outline-none block"
                      loading="eager"
                      decoding="sync"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageFallback(e, photo)}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-black mt-1.5 text-center border-t border-gray-200 pt-1 w-full truncate">
                    Foto #{idx + 1} - {photo?.name || 'Dokumentasi Monitoring Lapangan'}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="max-w-[48%] mx-auto">
            {(() => {
              const photo = chunkPhotos[2];
              const idx = baseIndex + 2;
              return (
                <div className="border border-black p-2 bg-white flex flex-col items-center shadow-xs">
                  <div className="w-full h-[220px] flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={resolveMediaUrl(photo)}
                      alt={`Dokumentasi ${idx + 1}`}
                      className="max-h-[220px] max-w-full object-contain border-0 outline-none block"
                      loading="eager"
                      decoding="sync"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageFallback(e, photo)}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-black mt-1.5 text-center border-t border-gray-200 pt-1 w-full truncate">
                    Foto #{idx + 1} - {photo?.name || 'Dokumentasi Monitoring Lapangan'}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      );
    }

    // 4 Photos: Symmetrical 2x2 grid
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {chunkPhotos.map((photo, i) => {
            const idx = baseIndex + i;
            return (
              <div key={idx} className="border border-black p-2 bg-white flex flex-col items-center shadow-xs">
                <div className="w-full h-[210px] flex items-center justify-center bg-gray-50 overflow-hidden">
                  <img
                    src={resolveMediaUrl(photo)}
                    alt={`Dokumentasi ${idx + 1}`}
                    className="max-h-[210px] max-w-full object-contain border-0 outline-none block"
                    loading="eager"
                    decoding="sync"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageFallback(e, photo)}
                  />
                </div>
                <div className="text-[11px] font-bold text-black mt-1.5 text-center border-t border-gray-200 pt-1 w-full truncate">
                  Foto #{idx + 1} - {photo?.name || 'Dokumentasi Monitoring Lapangan'}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 5 or 6 Photos: 2 Columns x 3 Rows
    return (
      <div className="grid grid-cols-2 gap-3.5">
        {chunkPhotos.map((photo, i) => {
          const idx = baseIndex + i;
          return (
            <div key={idx} className="border border-black p-2 bg-white flex flex-col items-center shadow-xs">
              <div className="w-full h-[175px] flex items-center justify-center bg-gray-50 overflow-hidden">
                <img
                  src={resolveMediaUrl(photo)}
                  alt={`Dokumentasi ${idx + 1}`}
                  className="max-h-[175px] max-w-full object-contain border-0 outline-none block"
                  loading="eager"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageFallback(e, photo)}
                />
              </div>
              <div className="text-[11px] font-bold text-black mt-1.5 text-center border-t border-gray-200 pt-1 w-full truncate">
                Foto #{idx + 1} - {photo?.name || 'Dokumentasi Monitoring Lapangan'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!record) return null;

  return createPortal(
    <div 
      className="executive-modal-backdrop fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible"
      onClick={onClose}
    >
      {/* ============================================================== */}
      {/* TOP ACTION BAR (Hidden on print)                                */}
      {/* ============================================================== */}
      <div 
        className="w-full max-w-[794px] bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between shadow-xl mb-6 print:hidden sticky top-0 z-50 shrink-0 gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1e3a8a]">
              Pratinjau Cetak Formulir Monitoring & Lampiran Eviden (1:1)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Format resmi dokumen monitoring TJSL PT Bukit Asam (Persero) Tbk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasAttachments && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={includeAttachments}
                onChange={(e) => setIncludeAttachments(e.target.checked)}
                className="rounded text-[#1e3a8a] focus:ring-[#1e3a8a]"
              />
              <span>Sertakan Lampiran ({photos.length} Foto, {attendance.length} Presensi)</span>
            </label>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 active:scale-95 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINTABLE PAGES WRAPPER                                        */}
      {/* ============================================================== */}
      <div 
        ref={printAreaRef}
        id="printable-monitoring-doc"
        className="w-full flex flex-col items-center print:block print:w-full space-y-8 print:space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* LEMBAR 1: FORMULIR MONITORING UTAMA                            */}
        {/* ============================================================== */}
        <section className="monitoring-section-form w-full max-w-[794px] flex flex-col items-center print:block print:w-full print:max-w-none">
          {/* Preview Page Badge (Hidden in Print) */}
          <div className="w-full flex items-center justify-between px-1 mb-2 print:hidden text-xs font-bold text-slate-300 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Lembar 1: Formulir Monitoring Utama</span>
            </div>
            <span className="text-[11px] font-normal text-slate-400">A4 Portrait</span>
          </div>

          <div
            className="monitoring-print-page w-full min-h-[1123px] bg-white p-8 md:p-12 shadow-2xl border border-slate-300 text-black font-sans leading-relaxed text-[13px] print:shadow-none print:border-none print:p-4 print:m-0 print:max-w-none print:w-full print:min-h-[250mm] flex flex-col justify-between"
            style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
          >
            <div>
              {/* Header Form */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
                <div className="w-24">
                  <img
                    src={logoPTBA}
                    alt="Logo PTBA"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="flex-1 text-center px-2">
                  <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider text-black">
                    {record.jenis_kegiatan === 'SURVEY' || record.program === 'SURVEY'
                      ? 'SURVEY PROGRAM TJSL'
                      : 'MONITORING PROGRAM TJSL'}
                  </h1>
                  <h2 className="text-sm md:text-base font-bold uppercase tracking-wide text-black">
                    PT BUKIT ASAM (PERSERO) TBK.
                  </h2>
                </div>
                <div className="w-24 text-right">
                  {/* Spacer */}
                </div>
              </div>

              {/* Form Metadata Section */}
              <div className="mb-5 space-y-1.5 text-xs md:text-sm">
                <div className="flex">
                  <span className="w-32 font-bold shrink-0">Hari / Tanggal</span>
                  <span className="mr-2">:</span>
                  <span className="flex-1 font-semibold">
                    {record.hari ? `${record.hari}, ` : ''}{formatDateIndo(record.tanggal)}
                  </span>
                </div>
                {record.jenis_kegiatan === 'SURVEY' || record.program === 'SURVEY' ? (
                  <div className="flex">
                    <span className="w-32 font-bold shrink-0">Kegiatan</span>
                    <span className="mr-2">:</span>
                    <span className="flex-1 font-semibold">SURVEY</span>
                  </div>
                ) : (
                  <div className="flex">
                    <span className="w-32 font-bold shrink-0">Program TJSL</span>
                    <span className="mr-2">:</span>
                    <span className="flex-1 font-semibold">{record.program || '-'}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-32 font-bold shrink-0">Lokasi</span>
                  <span className="mr-2">:</span>
                  <span className="flex-1 font-semibold">{record.lokasi || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold shrink-0">Keterangan</span>
                  <span className="mr-2">:</span>
                  <span className="flex-1">{record.keterangan || '-'}</span>
                </div>
              </div>

              {/* Monitoring Table */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs md:text-sm">
                  <thead className="bg-gray-100 print:bg-gray-100 print:table-header-group">
                    <tr>
                      <th className="border border-black px-2 py-2 w-12 text-center font-bold">
                        NO.
                      </th>
                      <th className="border border-black px-3 py-2 w-[34%] text-center font-bold">
                        URAIAN
                      </th>
                      <th className="border border-black px-3 py-2 w-[33%] text-center font-bold">
                        KENDALA / PERMASALAHAN
                      </th>
                      <th className="border border-black px-3 py-2 w-[33%] text-center font-bold">
                        RENCANA TINDAK LANJUT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="align-top monitoring-avoid-break">
                        <td className="border border-black px-2 py-3 text-center font-medium">
                          {item.no || index + 1}
                        </td>
                        <td className="border border-black px-3 py-3 text-left whitespace-pre-line leading-relaxed">
                          {item.uraian || '-'}
                        </td>
                        <td className="border border-black px-3 py-3 text-left whitespace-pre-line leading-relaxed">
                          {item.kendala || '-'}
                        </td>
                        <td className="border border-black px-3 py-3 text-left whitespace-pre-line leading-relaxed">
                          {item.tindak_lanjut || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Section */}
            <div className="monitoring-avoid-break pt-6 pb-2">
              <div className="grid grid-cols-2 gap-8 text-center text-xs md:text-sm">
                {/* Sustainability PTBA */}
                <div className="flex flex-col justify-between items-center h-44">
                  <div className="font-bold">
                    Sustainability PT Bukit Asam (Persero) Tbk.,
                  </div>
                  <div className="w-full flex flex-col items-center justify-end">
                    {record.ttd_pic ? (
                      <div className="h-16 flex items-center justify-center mb-1">
                        <img
                          src={record.ttd_pic}
                          alt="Tanda Tangan PIC"
                          className="max-h-16 max-w-[170px] object-contain border-0 outline-none"
                        />
                      </div>
                    ) : (
                      <div className="h-16" />
                    )}
                    <div className="border-b border-black w-48 mx-auto mb-1">
                      <span className="font-semibold text-xs md:text-sm">
                        {record.pic_sustainability ? `(${record.pic_sustainability})` : '(............................................)'}
                      </span>
                    </div>
                    {record.ttd_pic && (
                      <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider block">
                        ✓ Terverifikasi Digital
                      </span>
                    )}
                  </div>
                </div>

                {/* Penerima Manfaat */}
                <div className="flex flex-col justify-between items-center h-44">
                  <div className="font-bold">
                    Penerima Manfaat,
                  </div>
                  <div className="w-full flex flex-col items-center justify-end">
                    {record.ttd_penerima ? (
                      <div className="h-16 flex items-center justify-center mb-1">
                        <img
                          src={record.ttd_penerima}
                          alt="Tanda Tangan Penerima"
                          className="max-h-16 max-w-[170px] object-contain border-0 outline-none"
                        />
                      </div>
                    ) : (
                      <div className="h-16" />
                    )}
                    <div className="border-b border-black w-48 mx-auto mb-1">
                      <span className="font-semibold text-xs md:text-sm">
                        {record.penerima_manfaat ? `(${record.penerima_manfaat})` : '(............................................)'}
                      </span>
                    </div>
                    {record.ttd_penerima && (
                      <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider block">
                        ✓ Terverifikasi Digital
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-[10px] text-gray-500 border-t border-gray-300 pt-2 flex justify-between">
                <span>Halaman 1: Formulir Monitoring Resmi</span>
                <span>Dokumen: {record.program} ({record.tanggal || '-'})</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* LEMBAR 2+: LAMPIRAN I - FOTO DOKUMENTASI KEGIATAN              */}
        {/* ============================================================== */}
        {includeAttachments && photoChunks.length > 0 && photoChunks.map((chunk, chunkIdx) => (
          <section
            key={`photo-chunk-${chunkIdx}`}
            className="monitoring-section-eviden w-full max-w-[794px] flex flex-col items-center print:block print:w-full print:max-w-none mt-8 print:mt-0"
          >
            {/* Preview Page Badge (Hidden in Print) */}
            <div className="w-full flex items-center justify-between px-1 mb-2 print:hidden text-xs font-bold text-slate-300 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>
                  Lembar Lampiran I: Foto Eviden Kegiatan
                  {chunk.totalPages > 1 ? ` (Bagian ${chunk.pageNumber}/${chunk.totalPages})` : ` (${photos.length} Foto)`}
                </span>
              </div>
              <span className="text-[11px] font-normal text-slate-400">A4 Portrait</span>
            </div>

            <div
              className="monitoring-print-page w-full min-h-[1123px] bg-white p-8 md:p-12 shadow-2xl border border-slate-300 text-black font-sans leading-relaxed text-[13px] print:shadow-none print:border-none print:p-4 print:m-0 print:max-w-none print:w-full print:min-h-[250mm] flex flex-col justify-between"
              style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
            >
              <div>
                {/* Header Lampiran I */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-black">
                      LAMPIRAN I: DOKUMENTASI FOTO KEGIATAN
                      {chunk.totalPages > 1 ? ` (${chunk.pageNumber}/${chunk.totalPages})` : ''}
                    </h3>
                    <p className="text-xs text-gray-700 font-semibold mt-0.5">
                      Program: {record.program} • Lokasi: {record.lokasi || '-'} ({formatDateIndo(record.tanggal)})
                    </p>
                  </div>
                  <img src={logoPTBA} alt="Logo PTBA" className="h-9 w-auto object-contain" />
                </div>

                {/* Foto Grid Adaptif & Rapi */}
                <div className="mt-4">
                  {renderPhotoGrid(chunk.photos, chunk.startIndex)}
                </div>
              </div>

              {/* Footer Lampiran I */}
              <div className="pt-4 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between mt-6">
                <span>
                  Lampiran I: Dokumentasi Foto Kegiatan
                  {chunk.totalPages > 1 ? ` (Hal. ${chunk.pageNumber}/${chunk.totalPages})` : ''}
                </span>
                <span>{record.program} • PT Bukit Asam (Persero) Tbk.</span>
              </div>
            </div>
          </section>
        ))}

        {/* ============================================================== */}
        {/* LEMBAR 3+: LAMPIRAN II - SCAN / DAFTAR HADIR PESERTA           */}
        {/* ============================================================== */}
        {includeAttachments && attendance.length > 0 && (
          attendance.map((att, idx) => {
            const isPdf = typeof att === 'string'
              ? att.toLowerCase().includes('.pdf')
              : (att.isPdf || (att.name && att.name.toLowerCase().endsWith('.pdf')));
            const src = resolveMediaUrl(att);

            return (
              <section 
                key={`att-page-${idx}`} 
                className="monitoring-section-attendance w-full max-w-[794px] flex flex-col items-center print:block print:w-full print:max-w-none mt-8 print:mt-0"
              >
                {/* Preview Page Badge (Hidden in Print) */}
                <div className="w-full flex items-center justify-between px-1 mb-2 print:hidden text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <span>
                      Lembar Lampiran II: Scan Daftar Hadir Peserta
                      {attendance.length > 1 ? ` (${idx + 1}/${attendance.length})` : ''}
                    </span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-400">A4 Portrait</span>
                </div>

                <div
                  className="monitoring-print-page w-full min-h-[1123px] bg-white p-8 md:p-12 shadow-2xl border border-slate-300 text-black font-sans leading-relaxed text-[13px] print:shadow-none print:border-none print:p-4 print:m-0 print:max-w-none print:w-full print:min-h-[250mm] flex flex-col justify-between"
                  style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
                >
                  <div>
                    {/* Header Lampiran II */}
                    <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-wider text-black">
                          LAMPIRAN II: DAFTAR HADIR / PRESENSI PESERTA
                          {attendance.length > 1 ? ` (${idx + 1}/${attendance.length})` : ''}
                        </h3>
                        <p className="text-xs text-gray-700 font-semibold mt-0.5">
                          Program: {record.program} • Lokasi: {record.lokasi || '-'} ({formatDateIndo(record.tanggal)})
                        </p>
                      </div>
                      <img src={logoPTBA} alt="Logo PTBA" className="h-9 w-auto object-contain" />
                    </div>

                    {/* Scan Container */}
                    <div className="mt-4 flex justify-center">
                      {isPdf ? (
                        <div className="w-full border border-black p-6 bg-gray-50 flex items-center justify-between rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="w-10 h-10 text-[#1e3a8a]" />
                            <div>
                              <p className="font-bold text-sm text-black">Lembar Daftar Hadir Digital (PDF) #{idx + 1}</p>
                              <p className="text-xs text-gray-600">{att.name || 'Dokumen Presensi Terlampir di Google Drive'}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold border border-black px-3 py-1.5 bg-white rounded">
                            Arsip Dokumen PDF
                          </span>
                        </div>
                      ) : (
                        <div className="w-full border border-black p-2 bg-white flex flex-col items-center shadow-xs">
                          <div className="w-full max-h-[820px] flex items-center justify-center bg-gray-50 overflow-hidden">
                            <img
                              src={src}
                              alt={`Daftar Hadir ${idx + 1}`}
                              className="max-h-[820px] max-w-full object-contain border-0 outline-none block"
                              loading="eager"
                              decoding="sync"
                              referrerPolicy="no-referrer"
                              onError={(e) => handleImageFallback(e, att)}
                            />
                          </div>
                          <div className="text-xs font-bold text-black mt-2 text-center border-t border-gray-200 pt-1 w-full">
                            Lembar Daftar Hadir #{idx + 1}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Lampiran II */}
                  <div className="pt-4 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between mt-6">
                    <span>Lampiran II: Scan Daftar Hadir</span>
                    <span>{record.program} • PT Bukit Asam (Persero) Tbk.</span>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
}
