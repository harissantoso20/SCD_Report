import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { FileImage, X, ChevronLeft, ChevronRight } from '../Icons';

export default function EvidenceGallery() {
  const evidenceData = useAppStore((state) => state.evidenceData);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : evidenceData.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev < evidenceData.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, evidenceData]);

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
            className="aspect-square border border-gray-200 rounded-md overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow group relative bg-gray-100"
            onClick={() => setSelectedIndex(idx)}
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

      {selectedIndex !== null && evidenceData[selectedIndex] && (
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white bg-black/60 p-2 rounded-full hover:bg-red-600 transition-colors z-[10000]"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
          >
            <X size={28} />
          </button>

          {/* Previous Button */}
          {evidenceData.length > 1 && (
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transition-colors z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : evidenceData.length - 1));
              }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image */}
          <div className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none">
            <img 
              src={evidenceData[selectedIndex].File_Url} 
              alt={`Expanded Evidence ${selectedIndex + 1}`} 
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-md shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()} 
            />
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
              {selectedIndex + 1} / {evidenceData.length}
            </div>
          </div>

          {/* Next Button */}
          {evidenceData.length > 1 && (
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transition-colors z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev < evidenceData.length - 1 ? prev + 1 : 0));
              }}
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
