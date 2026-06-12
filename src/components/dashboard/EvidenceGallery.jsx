import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { FileImage, X } from '../Icons';

export default function EvidenceGallery() {
  const evidenceData = useAppStore((state) => state.evidenceData);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!evidenceData || evidenceData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded border border-gray-200 text-[13px] text-gray-600 italic">
        Belum ada foto progres.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {evidenceData.map((ev, idx) => (
          <div 
            key={idx} 
            className="aspect-square border border-gray-200 rounded-md overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow group relative"
            onClick={() => setSelectedImage(ev.File_Url)}
          >
            <img 
              src={ev.File_Url} 
              alt={`Evidence ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-sm drop-shadow-md transition-opacity">Perbesar</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-red-500 transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Expanded Evidence" 
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-xl"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
          />
        </div>
      )}
    </>
  );
}
