import React, { useRef } from 'react';
import { UploadCloud, X, FileImage, ExternalLink } from '../Icons';

const GDriveBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
    <svg viewBox="0 0 87.3 78" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27.5h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
    Tersimpan ke Google Drive
  </span>
);

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getGDriveThumbnail(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w300`;
  }
  return url;
}

export default function EvidenceUpload({ items = [], setItems }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newItems = selectedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      type: 'file',
      file: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));

    setItems((prev) => [...prev, ...newItems]);
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (idxToRemove) => {
    setItems((prev) => {
      const target = prev[idxToRemove];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, idx) => idx !== idxToRemove);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length === 0) return;

    const newItems = droppedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      type: 'file',
      file: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  return (
    <section className="w-full bg-white border border-gray-200 p-5 rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide flex items-center gap-2">
          <FileImage size={18} className="text-[#1e3a8a]" />
          EVIDEN PROGRES KEGIATAN
        </h3>
        <GDriveBadge />
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Unggah foto dokumentasi kegiatan. Foto akan otomatis diunggah langsung ke Google Drive terpusat saat tombol "Simpan Progress" ditekan.
      </p>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-[#1e3a8a] bg-gray-50/70 hover:bg-blue-50/40 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group text-center"
      >
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] group-hover:scale-110 transition-transform mb-2">
          <UploadCloud size={24} />
        </div>
        <p className="text-sm font-semibold text-gray-700">
          Klik untuk pilih foto atau tarik file ke sini
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Mendukung format JPG, PNG, WEBP (Bisa pilih beberapa foto sekaligus)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* File & Evidence List Preview */}
      {items.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">
            Foto Dipilih ({items.length}):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item, idx) => {
              const isLocalFile = item.type === 'file';
              const displayImg = isLocalFile ? item.preview : getGDriveThumbnail(item.url);
              const displayName = isLocalFile ? item.name : `Eviden Tersimpan #${idx + 1}`;
              const displaySub = isLocalFile ? formatFileSize(item.size) : 'Google Drive';

              return (
                <div
                  key={item.id || idx}
                  className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {displayImg ? (
                      <img
                        src={displayImg}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback if direct thumbnail fails
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FileImage size={32} className="text-gray-400" />
                    )}

                    {/* Badge local new file vs already in drive */}
                    <span className={`absolute top-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded shadow-xs ${
                      isLocalFile 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {isLocalFile ? 'Siap Upload' : 'Tersimpan'}
                    </span>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Hapus foto"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] font-medium text-gray-700 truncate" title={displayName}>
                      {displayName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{displaySub}</span>
                      {!isLocalFile && item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Lihat <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
