import React from 'react';
import { Paperclip, UploadCloud } from '../Icons';

export default function EvidenceUpload({ files = [], setFiles }) {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
    
    // Create preview URLs
    const newFiles = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    if (setFiles) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    if (setFiles) {
      setFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <section className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
      <h2 className="text-[14px] font-bold text-[#25326a] uppercase border-b pb-2 mb-5 flex gap-2"><Paperclip size={18} className="text-[#1e3a8a]"/>Eviden Progres</h2>
      
      {files.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4">
          {files.map((file, i) => (
            <div key={i} className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden shadow-sm group">
              <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <label htmlFor="eviden-upload" className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer">
        <UploadCloud size={32} className="text-[#1e3a8a] mb-3" />
        <p className="font-bold text-[14px] mb-1">Klik untuk unggah atau seret dan lepas</p>
        <p className="text-gray-500 text-[12px] mb-4">Tambahkan dokumentasi foto progres program (Hanya Format: PNG, JPG, JPEG)</p>
        <span className="bg-white border border-gray-300 px-4 py-2 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 shadow-sm">Pilih File</span>
        <input 
          id="eviden-upload" 
          type="file" 
          multiple
          accept=".png, .jpg, .jpeg, image/png, image/jpeg" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
    </section>
  );
}
