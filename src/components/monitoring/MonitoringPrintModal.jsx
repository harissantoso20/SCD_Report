import React, { useRef, useState } from 'react';
import { Printer, X, Download, Camera, FileText, CheckSquare, Image as ImageIcon } from 'lucide-react';
import logoPTBA from '../../assets/logo/logo-ptba.png';
import { getGDriveThumbnail } from '../../services/monitoringService';

export default function MonitoringPrintModal({ record, onClose }) {
  const printAreaRef = useRef(null);
  const [includeAttachments, setIncludeAttachments] = useState(true);

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

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

  const items = Array.isArray(record.items) && record.items.length > 0
    ? record.items
    : [
        {
          no: 1,
          uraian: '-',
          kendala: '-',
          tindak_lanjut: '-'
        }
      ];

  const photos = Array.isArray(record.foto_dokumentasi) ? record.foto_dokumentasi : [];
  const attendance = Array.isArray(record.scan_daftar_hadir) ? record.scan_daftar_hadir : [];
  const hasAttachments = photos.length > 0 || attendance.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Modal Actions Bar (Hidden on print) */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-gray-200">
        <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Pratinjau Formulir Monitoring & Lampiran Eviden (1:1)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Format resmi dokumen monitoring TJSL PT Bukit Asam (Persero) Tbk beserta lampiran foto dan daftar hadir.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasAttachments && (
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-300">
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
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout simulation) */}
        <div className="p-4 md:p-8 bg-gray-200 flex justify-center overflow-x-auto max-h-[82vh] overflow-y-auto">
          <div
            ref={printAreaRef}
            id="printable-monitoring-doc"
            className="w-full max-w-[794px] min-h-[1123px] bg-white p-8 md:p-12 shadow-md border border-gray-300 text-black font-sans leading-relaxed text-[13px] print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full space-y-8"
            style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
          >
            {/* ============================================================== */}
            {/* HALAMAN 1: FORMULIR MONITORING UTAMA                           */}
            {/* ============================================================== */}
            <div className="min-h-[1000px] flex flex-col justify-between">
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
                      MONITORING PROGRAM TJSL
                    </h1>
                    <h2 className="text-sm md:text-base font-bold uppercase tracking-wide text-black">
                      PT BUKIT ASAM (PERSERO) TBK
                    </h2>
                  </div>
                  <div className="w-24 text-right">
                    {/* Symmetry spacer */}
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
                  <div className="flex">
                    <span className="w-32 font-bold shrink-0">Program</span>
                    <span className="mr-2">:</span>
                    <span className="flex-1 font-semibold">{record.program || '-'}</span>
                  </div>
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
                    <thead>
                      <tr className="bg-gray-100 print:bg-gray-100">
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
                        <tr key={index} className="align-top">
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

              {/* Signature Section (2 Kolom Formal) */}
              <div className="pt-6 pb-2 break-inside-avoid">
                <div className="grid grid-cols-2 gap-8 text-center text-xs md:text-sm">
                  {/* Sustainability PTBA */}
                  <div className="flex flex-col justify-between items-center h-36">
                    <div className="font-bold">
                      Sustainability PT Bukit Asam (Persero) Tbk,
                    </div>
                    <div className="w-full">
                      <div className="border-b border-black w-48 mx-auto mb-1">
                        <span className="font-semibold text-xs md:text-sm">
                          {record.pic_sustainability ? `(${record.pic_sustainability})` : '(............................................)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Penerima Manfaat */}
                  <div className="flex flex-col justify-between items-center h-36">
                    <div className="font-bold">
                      Penerima Manfaat,
                    </div>
                    <div className="w-full">
                      <div className="border-b border-black w-48 mx-auto mb-1">
                        <span className="font-semibold text-xs md:text-sm">
                          {record.penerima_manfaat ? `(${record.penerima_manfaat})` : '(............................................)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-[10px] text-gray-500 border-t border-gray-300 pt-2 flex justify-between">
                  <span>Halaman 1: Formulir Monitoring Resmi</span>
                  <span>Dokumen: {record.program} ({record.tanggal || '-'})</span>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* HALAMAN 2: LAMPIRAN I - FOTO DOKUMENTASI KEGIATAN              */}
            {/* ============================================================== */}
            {includeAttachments && photos.length > 0 && (
              <div className="pt-8 border-t-2 border-black break-before-page min-h-[1000px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider text-black">
                        LAMPIRAN I: DOKUMENTASI FOTO KEGIATAN
                      </h3>
                      <p className="text-xs text-gray-700 font-semibold mt-0.5">
                        Program: {record.program} • Lokasi: {record.lokasi || '-'} ({formatDateIndo(record.tanggal)})
                      </p>
                    </div>
                    <img src={logoPTBA} alt="Logo" className="h-9 w-auto object-contain" />
                  </div>

                  {/* Foto Grid (2 Kolom Presisi Cetak) */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {photos.map((photo, idx) => {
                      const rawSrc = typeof photo === 'string' ? photo : (photo.preview || photo.url);
                      const src = getGDriveThumbnail(rawSrc, 'w1000');

                      return (
                        <div key={idx} className="border border-black p-2 bg-white flex flex-col items-center">
                          <div className="w-full h-56 flex items-center justify-center bg-gray-50 overflow-hidden">
                            <img
                              src={src}
                              alt={`Dokumentasi ${idx + 1}`}
                              className="max-h-56 max-w-full object-contain"
                              crossOrigin="anonymous"
                              loading="eager"
                            />
                          </div>
                          <div className="text-[11px] font-bold text-black mt-2 text-center border-t border-gray-200 pt-1 w-full">
                            Foto #{idx + 1} - Dokumentasi Monitoring Lapangan
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between">
                  <span>Halaman 2: Lampiran I - Foto Dokumentasi</span>
                  <span>{record.program} • PT Bukit Asam (Persero) Tbk</span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* HALAMAN 3: LAMPIRAN II - SCAN / DAFTAR HADIR PESERTA           */}
            {/* ============================================================== */}
            {includeAttachments && attendance.length > 0 && (
              <div className="pt-8 border-t-2 border-black break-before-page min-h-[1000px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider text-black">
                        LAMPIRAN II: DAFTAR HADIR / PRESENSI PESERTA
                      </h3>
                      <p className="text-xs text-gray-700 font-semibold mt-0.5">
                        Program: {record.program} • Lokasi: {record.lokasi || '-'} ({formatDateIndo(record.tanggal)})
                      </p>
                    </div>
                    <img src={logoPTBA} alt="Logo" className="h-9 w-auto object-contain" />
                  </div>

                  {/* Scan Presensi List */}
                  <div className="space-y-6 mt-6">
                    {attendance.map((att, idx) => {
                      const rawSrc = typeof att === 'string' ? att : (att.preview || att.url);
                      const isPdf = typeof att === 'string' ? att.toLowerCase().includes('.pdf') : att.isPdf;
                      const src = getGDriveThumbnail(rawSrc, 'w1200');

                      if (isPdf) {
                        return (
                          <div key={idx} className="border border-black p-5 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-black" />
                              <div>
                                <p className="font-bold text-sm">Lembar Daftar Hadir Digital (PDF) #{idx + 1}</p>
                                <p className="text-xs text-gray-600">{att.name || 'Dokumen Presensi Terlampir di Google Drive'}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold border border-black px-3 py-1 bg-white">
                              Arsip PDF
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="border border-black p-3 bg-white flex flex-col items-center">
                          <div className="w-full max-h-[750px] flex items-center justify-center bg-gray-50 overflow-hidden">
                            <img
                              src={src}
                              alt={`Daftar Hadir ${idx + 1}`}
                              className="max-h-[750px] max-w-full object-contain"
                              crossOrigin="anonymous"
                              loading="eager"
                            />
                          </div>
                          <div className="text-xs font-bold text-black mt-2 text-center border-t border-gray-200 pt-1 w-full">
                            Lembar Daftar Hadir #{idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between">
                  <span>Halaman 3: Lampiran II - Scan Daftar Hadir</span>
                  <span>{record.program} • PT Bukit Asam (Persero) Tbk</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Print Stylesheet for this document */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-monitoring-doc, #printable-monitoring-doc * {
            visibility: visible !important;
          }
          #printable-monitoring-doc {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          .break-before-page {
            page-break-before: always !important;
            break-before: page !important;
            display: block !important;
            margin-top: 20mm !important;
          }
        }
      `}} />
    </div>
  );
}
