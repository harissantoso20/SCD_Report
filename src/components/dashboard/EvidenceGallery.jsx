import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { FileImage, X, ChevronLeft, ChevronRight, ExternalLink } from '../Icons';

const GDriveIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 87.3 78" style={{ width: size, height: size }} className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27.5h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

function getDisplayImageUrl(url) {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url;
}

function isFolderUrl(url) {
  return url && (url.includes('/folders/') || url.includes('/drive/folders'));
}

export default function EvidenceGallery() {
  const evidenceData = useAppStore((state) => state.evidenceData);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Keyboard navigation for image lightbox
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
        Belum ada foto eviden progres.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {evidenceData.map((ev, idx) => {
          const isFolder = isFolderUrl(ev.File_Url);
          const imgSrc = getDisplayImageUrl(ev.File_Url);

          if (isFolder) {
            return (
              <a
                key={idx}
                href={ev.File_Url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square flex flex-col items-center justify-center p-4 bg-white border border-gray-200 hover:border-blue-400 rounded-lg shadow-xs hover:shadow-md transition-all group text-center"
              >
                <div className="p-3 bg-blue-50 rounded-full group-hover:scale-110 transition-transform mb-2">
                  <GDriveIcon size={32} />
                </div>
                <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600">
                  Folder Google Drive #{idx + 1}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1">
                  Buka Folder <ExternalLink size={11} />
                </span>
              </a>
            );
          }

          return (
            <div 
              key={idx} 
              className="aspect-square border border-gray-200 rounded-lg overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all group relative bg-gray-100 flex items-center justify-center"
              onClick={() => setSelectedIndex(idx)}
            >
              <img 
                src={imgSrc} 
                alt={`Evidence ${idx + 1}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to placeholder if thumbnail is blocked
                  e.target.onerror = null;
                }}
              />

              {/* GDrive indicator badge */}
              {ev.File_Url?.includes('drive.google.com') && (
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-xs">
                  <GDriveIcon size={14} />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-xs bg-black/60 px-3 py-1 rounded-full drop-shadow-md transition-opacity">
                  Perbesar
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
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

          {/* Image & Controls */}
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center pointer-events-none">
            <img 
              src={getDisplayImageUrl(evidenceData[selectedIndex].File_Url)} 
              alt={`Expanded Evidence ${selectedIndex + 1}`} 
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()} 
            />

            {/* Bottom Actions & Counter */}
            <div className="mt-3 flex items-center gap-3 pointer-events-auto">
              <span className="bg-black/60 text-white px-3.5 py-1 rounded-full text-xs font-medium tracking-wide">
                {selectedIndex + 1} / {evidenceData.length}
              </span>

              {evidenceData[selectedIndex].File_Url && (
                <a
                  href={evidenceData[selectedIndex].File_Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GDriveIcon size={14} /> Buka di Google Drive <ExternalLink size={12} />
                </a>
              )}
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
