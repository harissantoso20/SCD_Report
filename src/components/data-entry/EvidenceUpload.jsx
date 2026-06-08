import React from 'react';
import { Paperclip, UploadCloud } from '../Icons';

export default function EvidenceUpload() {
  return (
    <section className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
      <h2 className="text-[14px] font-bold text-[#25326a] uppercase border-b pb-2 mb-5 flex gap-2"><Paperclip size={18} className="text-[#1e3a8a]"/>Eviden Progres</h2>
      <label htmlFor="eviden-upload" className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer">
        <UploadCloud size={32} className="text-[#1e3a8a] mb-3" />
        <p className="font-bold text-[14px] mb-1">Klik untuk unggah atau seret dan lepas</p>
        <p className="text-gray-500 text-[12px] mb-4">Tambahkan dokumentasi foto progres program (Hanya Format: PNG, JPG, JPEG)</p>
        <span className="bg-white border border-gray-300 px-4 py-2 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-sm">Pilih File</span>
        <input id="eviden-upload" type="file" accept=".png, .jpg, .jpeg, image/png, image/jpeg" className="hidden" />
      </label>
    </section>
  );
}
