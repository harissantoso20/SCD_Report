import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function TimePicker24({ 
  value = '', 
  onChange, 
  placeholder = '08:00',
  align = 'left' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  // Extract current hour and minute
  const [hour, minute] = (() => {
    if (!value || typeof value !== 'string') return ['', ''];
    const parts = value.split(':');
    const h = parts[0]?.trim() || '';
    const m = parts[1]?.trim() || '';
    return [h, m];
  })();

  const activeHour = hour || placeholder.split(':')[0] || '08';
  const activeMinute = minute || placeholder.split(':')[1] || '00';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll active hour and minute into view upon opening
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (hourListRef.current) {
          const selectedH = hourListRef.current.querySelector('[data-selected="true"]');
          if (selectedH) {
            hourListRef.current.scrollTop = selectedH.offsetTop - hourListRef.current.offsetTop - 10;
          }
        }
        if (minuteListRef.current) {
          const selectedM = minuteListRef.current.querySelector('[data-selected="true"]');
          if (selectedM) {
            minuteListRef.current.scrollTop = selectedM.offsetTop - minuteListRef.current.offsetTop - 10;
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const selectHour = (newH) => {
    const newM = minute || activeMinute || '00';
    onChange(`${newH}:${newM}`);
  };

  const selectMinute = (newM) => {
    const newH = hour || activeHour || '08';
    onChange(`${newH}:${newM}`);
  };

  const handleManualInput = (e) => {
    let val = e.target.value.replace(/[^0-9:]/g, '');
    if (!val.includes(':') && val.length >= 3) {
      val = val.slice(0, 2) + ':' + val.slice(2, 4);
    }
    onChange(val.slice(0, 5));
  };

  const handleBlur = () => {
    if (!value) return;
    const trimmed = value.trim();
    if (/^\d{1,2}$/.test(trimmed)) {
      const num = Math.min(23, Math.max(0, parseInt(trimmed, 10)));
      onChange(`${String(num).padStart(2, '0')}:00`);
    } else if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      let hNum = parseInt(parts[0] || '0', 10);
      let mNum = parseInt(parts[1] || '0', 10);
      hNum = isNaN(hNum) ? 0 : Math.min(23, Math.max(0, hNum));
      mNum = isNaN(mNum) ? 0 : Math.min(59, Math.max(0, mNum));
      onChange(`${String(hNum).padStart(2, '0')}:${String(mNum).padStart(2, '0')}`);
    }
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      {/* Input Box */}
      <div 
        className={`flex items-center justify-between px-2.5 py-2 text-sm bg-white border rounded-lg transition-all ${
          isOpen 
            ? 'border-blue-500 ring-2 ring-blue-500/20' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="text"
          value={value}
          onChange={handleManualInput}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          maxLength={5}
          className="w-full text-center font-mono font-medium text-gray-800 text-xs sm:text-sm focus:outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
          title="Buka Pilihan Jam & Menit"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-Column Popup Picker (24 Jam & 00-59 Menit) */}
      {isOpen && (
        <div 
          className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-2.5 w-48 sm:w-52 animate-fadeIn`}
          style={{ minWidth: '190px' }}
        >
          {/* Header Column Labels */}
          <div className="grid grid-cols-2 gap-2 mb-2 pb-1.5 border-b border-gray-100 text-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Jam
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Menit
            </span>
          </div>

          {/* Two Scrollable Columns without scrollbar */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Hours Column (00 - 23) */}
            <div 
              ref={hourListRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="h-44 overflow-y-auto space-y-1 pr-1 border-r border-gray-100 no-scrollbar [&::-webkit-scrollbar]:hidden"
            >
              {HOURS.map((h) => {
                const isSelected = h === hour;
                return (
                  <button
                    key={h}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => selectHour(h)}
                    className={`w-full py-1.5 text-xs font-mono font-bold rounded-lg text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column (00 - 59) */}
            <div 
              ref={minuteListRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="h-44 overflow-y-auto space-y-1 pl-1 no-scrollbar [&::-webkit-scrollbar]:hidden"
            >
              {MINUTES.map((m) => {
                const isSelected = m === minute;
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => selectMinute(m)}
                    className={`w-full py-1.5 text-xs font-mono font-bold rounded-lg text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer px-1 py-0.5"
            >
              Kosongkan
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
