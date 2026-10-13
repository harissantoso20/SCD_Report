import React, { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { getGDriveThumbnail } from '../../services/monitoringService';

/**
 * Reusable, resilient image component for Google Drive & Base64 evidence files.
 * Handles:
 * 1. Automatic stripping of HTTP Referer (referrerPolicy="no-referrer") to avoid Google Drive 429 / hotlink blocks.
 * 2. Sequential fallback across candidate endpoints (Thumbnail -> LH3 -> UC view -> original).
 * 3. Support for both permanent base64 data URLs and remote Google Drive URLs.
 * 4. Graceful loading spinner & failure fallback with direct GDrive link.
 */
export default function EvidenceImage({
  src,
  alt = 'Eviden Dokumentasi',
  className = '',
  containerClassName = '',
  size = 'w1000',
  onClick
}) {
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Extract raw source and possible Google Drive file ID
  const rawUrl = typeof src === 'string' ? src : (src?.preview || src?.url || '');
  const isDataOrBlob = rawUrl.startsWith('data:') || rawUrl.startsWith('blob:');

  const fileId = useMemo(() => {
    if (!rawUrl || isDataOrBlob) return '';
    const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  }, [rawUrl, isDataOrBlob]);

  // Construct list of candidate URLs in order of reliability
  const candidates = useMemo(() => {
    if (!rawUrl) return [];
    if (isDataOrBlob) return [rawUrl];

    const list = [];

    // If item has a base64 preview, prioritize it for instant 0ms rendering
    if (src?.preview && (src.preview.startsWith('data:') || src.preview.startsWith('blob:'))) {
      list.push(src.preview);
    }

    if (fileId) {
      // 1. Google Drive official thumbnail endpoint (most reliable for embedding)
      list.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`);
      // 2. lh3 direct CDN
      list.push(`https://lh3.googleusercontent.com/d/${fileId}=${size}`);
      // 3. lh3 default
      list.push(`https://lh3.googleusercontent.com/d/${fileId}`);
      // 4. uc export view
      list.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
    }

    if (!list.includes(rawUrl) && rawUrl.startsWith('http')) {
      list.push(rawUrl);
    }

    return list.length > 0 ? list : [rawUrl];
  }, [rawUrl, fileId, isDataOrBlob, src]);

  const currentSrc = candidates[candidateIndex] || '';

  // Reset when candidates change
  useEffect(() => {
    setCandidateIndex(0);
    setLoadState('loading');
  }, [candidates]);

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setLoadState('error');
    }
  };

  const handleLoad = () => {
    setLoadState('loaded');
  };

  if (!rawUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-gray-100 text-gray-400 text-xs ${containerClassName}`}>
        <ImageIcon className="w-6 h-6 mb-1 text-gray-300" />
        <span>Berkas tidak ditemukan</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center bg-gray-100 ${containerClassName}`} 
      onClick={onClick}
    >
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 z-10">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-5 h-5 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-gray-400 font-medium">Memuat foto...</span>
          </div>
        </div>
      )}

      {loadState === 'error' ? (
        <div className="p-4 flex flex-col items-center justify-center text-center text-gray-400 gap-1.5 w-full">
          <ImageIcon className="w-7 h-7 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Foto Tersimpan di Google Drive</span>
          <span className="text-[11px] text-gray-400 max-w-xs">
            Foto aman dan dapat diakses langsung melalui Google Drive.
          </span>
          {rawUrl.startsWith('http') && (
            <a 
              href={rawUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-1 px-3 py-1 bg-[#1e3a8a] text-white rounded-md text-[11px] font-bold hover:bg-blue-900 transition-colors inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Buka di Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-200 ${loadState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
