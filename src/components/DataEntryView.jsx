// src/components/DataEntryView.js

import React, { useState } from 'react';
import { PROGRAMS, PROGRAM_IMAGES } from '../data/mockData';
import { ChevronDown, CheckCircle, Edit2, TableIcon, FileText, TrendingUp, Paperclip, UploadCloud, Save, Plus } from './Icons';

export default function DataEntryView({ selectedProgram, selectedDate, setSelectedProgram, setSelectedDate }) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const getMonthNames = (dateString) => {
    if (!dateString) return { prev: "...", next: "..." };
    const d = new Date(dateString);
    if (isNaN(d)) return { prev: "...", next: "..." };
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const currentMonthIndex = d.getMonth();
    return { 
      prev: months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1], 
      next: months[currentMonthIndex === 11 ? 0 : currentMonthIndex + 1] 
    };
  };
  const monthLabels = getMonthNames(selectedDate);

  const [contextData, setContextData] = useState({ 
    anggaran: "Rp 1.766.000.000", 
    tpb: "TPB 1, 8, 13 (Tanpa Kemiskinan, Pekerjaan Layak, Penanganan Perubahan Iklim)", 
    lokasi: "Desa Talawi, Tanjung Karangan, Matas", 
    penerimaManfaat: "Kelompok Tani, Masyarakat Lingkar Tambang", 
    kpi: "", 
    objektif: "" 
  });
  const [editableContext, setEditableContext] = useState({ 
    anggaran: false, tpb: false, lokasi: false, penerimaManfaat: false, kpi: false, objektif: false 
  });
  
  const [pltsLocations, setPltsLocations] = useState([
    { id: 1, lokasi: "Talawi", kwp: 19, luas: 19, petani: 60 }, 
    { id: 2, lokasi: "Tanjung Karangan", kwp: 12, luas: 20, petani: 20 },
    { id: 3, lokasi: "Matas", kwp: 12, luas: 15, petani: 44 }, 
    { id: 4, lokasi: "Muara Gula", kwp: 7, luas: 4, petani: 20 }
  ]);
  const [isPltsEditing, setIsPltsEditing] = useState(false);

  const handlePltsChange = (id, field, value) => setPltsLocations(prev => prev.map(loc => loc.id === id ? { ...loc, [field]: value } : loc));
  const handleAddPltsRow = () => { 
    setPltsLocations([...pltsLocations, { id: Date.now(), lokasi: "", kwp: "", luas: "", petani: "" }]); 
    setIsPltsEditing(true); 
  };
  const handleContextEdit = (field) => setEditableContext(prev => ({ ...prev, [field]: !prev[field] }));
  const handleContextChange = (e, field) => setContextData(prev => ({ ...prev, [field]: e.target.value }));
  const handleSave = () => { 
    setShowSuccess(true); 
    setTimeout(() => setShowSuccess(false), 3000); 
  };
  const getBannerImage = () => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"];

  const PltsContextField = ({ label, fieldKey, rows = 1, minHeight = "min-h-[34px]", wrapperClass = "mb-2.5 flex-none" }) => (
    <div className={`${wrapperClass} flex flex-col`}>
      <label className="block text-[13px] font-bold text-black mb-1 flex-none">{label}</label>
      <div className="bg-white rounded border border-gray-300 relative flex items-stretch justify-between overflow-hidden shadow-sm flex-1">
        {editableContext[fieldKey] ? (
          <textarea className="w-full h-full text-[13px] text-black focus:outline-none p-2 resize-none" value={contextData[fieldKey]} onChange={(e) => handleContextChange(e, fieldKey)} rows={rows} autoFocus />
        ) : (
          <div className={`text-[13px] text-gray-800 flex-1 p-2 whitespace-pre-wrap leading-relaxed overflow-y-auto ${minHeight}`}>{contextData[fieldKey]}</div>
        )}
        <button onClick={() => handleContextEdit(fieldKey)} className="text-gray-500 hover:text-black p-2 border-l border-gray-300 bg-gray-50 flex items-center justify-center self-stretch min-w-[36px] transition-colors">
          {editableContext[fieldKey] ? <CheckCircle size={15} className="text-green-600" /> : <Edit2 size={15} />}
        </button>
      </div>
    </div>
  );

  const ContextField = ({ label, fieldKey }) => (
    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm relative group transition-all hover:border-gray-300">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        <button onClick={() => handleContextEdit(fieldKey)} className="text-gray-400 hover:text-[#1e3a8a] transition-colors"><Edit2 size={14} /></button>
      </div>
      {editableContext[fieldKey] ? (
        <textarea className="w-full text-sm border-b-2 border-[#1e3a8a] focus:outline-none focus:ring-0 p-1 resize-y bg-blue-50/50" value={contextData[fieldKey]} onChange={(e) => handleContextChange(e, fieldKey)} rows={2} autoFocus />
      ) : (
        <p className="text-sm text-gray-800 leading-snug">{contextData[fieldKey] || "-"}</p>
      )}
    </div>
  );

  const GenericDynamicTable = ({ title, headers, initialLabels }) => {
    const [rows, setRows] = useState(() => initialLabels.map((label, i) => ({ id: i + 1, label: label === "Lainnya" ? "" : label, isOthers: label === "Lainnya" })));
    const handleLabelChange = (id, newLabel) => {
      setRows(prev => {
        const newRows = [...prev]; 
        const rowIndex = newRows.findIndex(r => r.id === id);
        if (rowIndex === -1) return prev; 
        newRows[rowIndex].label = newLabel;
        if (newRows[rowIndex].isOthers && rowIndex === newRows.length - 1 && newLabel.trim() !== "") {
          newRows.push({ id: Date.now(), label: "", isOthers: true });
        }
        return newRows;
      });
    };
    return (
      <div className="mb-8 flex flex-col last:mb-0">
        <h3 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4 flex-none flex items-center gap-2">
          <TableIcon size={18} className="text-[#1e3a8a]" />{title}
        </h3>
        <div className="overflow-x-auto border-y border-gray-300 shadow-sm bg-white rounded-sm minimal-scrollbar">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-[#25326a] uppercase font-bold">
              <tr>{headers.map((h, i) => <th key={i} className={`px-4 py-3.5 border-b border-gray-200 ${i === 0 ? 'w-1/4' : ''}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/60">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">
                    {row.isOthers ? <input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" placeholder="Lainnya..." value={row.label} onChange={(e) => handleLabelChange(row.id, e.target.value)} /> : row.label}
                  </td>
                  {headers.slice(1).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2.5"><input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" placeholder="..." /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDynamicTables = () => {
    if (selectedProgram === "Budidaya Maggot BSF") return <GenericDynamicTable title="Penjualan Produk" headers={["PRODUK", "QTY (KG)", "HARGA SATUAN (RP)", "OMZET"]} initialLabels={["Fresh Maggot", "Maggot Kering", "Lainnya"]} />;
    if (selectedProgram === "Budidaya Ikan Air Tawar") return <GenericDynamicTable title="Penjualan Ikan Konsumsi" headers={["PRODUK", "QTY (KG)", "HARGA SATUAN (RP)", "OMZET"]} initialLabels={["Lele", "Nila", "Lainnya"]} />;
    if (selectedProgram === "SIBA Pembibitan") return <GenericDynamicTable title="Penjualan Bibit Tanaman" headers={["PRODUK", "QTY (BATANG)", "HARGA SATUAN (RP)", "OMZET"]} initialLabels={["Kaliandra", "Lainnya"]} />;
    return null;
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-2 tracking-tight">Data Entry</h2>
            <p className="text-gray-600 font-medium text-[13.5px] pr-4 leading-relaxed">Update ringkasan program dan data kuantitatif program sustainable community development.</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative z-50 mt-6 lg:mt-0">
            <div className="flex-1 relative">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">Periode</label>
              <input type="date" className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:ring-[#1e3a8a]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="flex-1 relative z-50">
              <label className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1.5">Program</label>
              <select className="w-full border border-gray-300 rounded-sm p-2 text-sm appearance-none focus:ring-[#1e3a8a]" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
                {PROGRAMS.map(prog => <option key={prog} value={prog}>{prog}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-8 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[200px] lg:min-h-0">
          <img src={getBannerImage()} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
        </div>
      </div>

      {selectedProgram === "PLTS Irigasi" ? (
        <section className="relative z-10 border border-gray-200 rounded-md p-5 bg-white shadow-sm">
          <h2 className="text-[14px] font-bold text-[#25326a] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4 flex items-center gap-2"><FileText size={18} className="text-[#1e3a8a]" />KONTEKS UMUM</h2>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
            <div className="col-span-1 xl:col-span-7 flex flex-col h-full">
              <h3 className="text-[15px] font-bold text-black mb-3 flex-none">Sebaran Lokasi</h3>
              <div className="overflow-y-auto overflow-x-auto flex-1 min-h-[300px] border-y border-gray-300 shadow-sm bg-white rounded-sm minimal-scrollbar">
                <table className="w-full text-[13px] text-center border-collapse">
                  <thead className="bg-[#f8f9fa] text-[#25326a] uppercase font-bold sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-4 py-3.5 border-b border-gray-200">LOKASI</th>
                      <th className="px-3 py-3.5 border-b border-gray-200">KWP</th>
                      <th className="px-3 py-3.5 border-b border-gray-200">LUAS (HA)</th>
                      <th className="px-3 py-3.5 border-b border-gray-200">PETANI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pltsLocations.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/60">
                        <td className="px-4 py-2.5 font-semibold text-gray-800">
                          {isPltsEditing ? <input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-blue-500" value={row.lokasi} onChange={(e) => handlePltsChange(row.id, 'lokasi', e.target.value)} /> : row.lokasi}
                        </td>
                        <td className="px-3 py-2.5">
                          {isPltsEditing ? <input type="number" className="w-full border p-1.5 rounded text-center" value={row.kwp} onChange={(e) => handlePltsChange(row.id, 'kwp', e.target.value)} /> : row.kwp}
                        </td>
                        <td className="px-3 py-2.5">
                          {isPltsEditing ? <input type="number" className="w-full border p-1.5 rounded text-center" value={row.luas} onChange={(e) => handlePltsChange(row.id, 'luas', e.target.value)} /> : row.luas}
                        </td>
                        <td className="px-3 py-2.5">
                          {isPltsEditing ? <input type="number" className="w-full border p-1.5 rounded text-center" value={row.petani} onChange={(e) => handlePltsChange(row.id, 'petani', e.target.value)} /> : row.petani}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3 mt-3 flex-none">
                <button onClick={() => setIsPltsEditing(!isPltsEditing)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-semibold text-white text-sm ${isPltsEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#70b268] hover:bg-[#5da055]'}`}>
                  {isPltsEditing ? <Save size={15} /> : <Edit2 size={15} />} {isPltsEditing ? 'Save' : 'Edit'}
                </button>
                <button onClick={handleAddPltsRow} className="flex items-center gap-1.5 bg-[#2f3565] hover:bg-[#1f2448] text-white px-4 py-1.5 rounded-md font-semibold text-sm">
                  <Plus size={15} /> Add New
                </button>
              </div>
            </div>
            <div className="col-span-1 xl:col-span-5 flex flex-col h-full">
              <PltsContextField label="Anggaran" fieldKey="anggaran" />
              <PltsContextField label="TPB/SDGs" fieldKey="tpb" rows={2} />
              <PltsContextField label="Lokasi" fieldKey="lokasi" rows={2} />
              <PltsContextField label="Penerima Manfaat" fieldKey="penerimaManfaat" rows={2} />
              <PltsContextField label="KPI" fieldKey="kpi" rows={3} minHeight="min-h-[60px]" />
              <PltsContextField label="Objektif" fieldKey="objektif" minHeight="min-h-[80px]" wrapperClass="flex-1 mb-0" />
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-6 border border-gray-200 rounded-md p-5 bg-white shadow-sm">
          <div>
            <h2 className="text-[14px] font-bold text-[#25326a] uppercase border-b border-gray-200 pb-2 mb-4 flex gap-2"><FileText size={18} className="text-[#1e3a8a]"/>KONTEKS UMUM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContextField label="Anggaran" fieldKey="anggaran" />
              <ContextField label="TPB/SDGs" fieldKey="tpb" />
              <ContextField label="Lokasi" fieldKey="lokasi" />
              <ContextField label="Penerima Manfaat" fieldKey="penerimaManfaat" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h2 className="text-[13px] font-bold text-[#25326a] uppercase border-b pb-1.5 mb-3">KPI</h2>
              <textarea className="w-full border border-gray-300 rounded-sm p-3 h-36 text-sm focus:ring-[#1e3a8a]" value={contextData.kpi} onChange={(e) => handleContextChange(e, 'kpi')} />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-[#25326a] uppercase border-b pb-1.5 mb-3">Objektif</h2>
              <textarea className="w-full border border-gray-300 rounded-sm p-3 h-36 text-sm focus:ring-[#1e3a8a]" value={contextData.objektif} onChange={(e) => handleContextChange(e, 'objektif')} />
            </div>
          </div>
        </section>
      )}

      <section className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-3 mb-5 gap-5">
          <h2 className="text-[14px] font-bold text-[#25326a] uppercase flex gap-2"><TrendingUp size={18} className="text-[#1e3a8a]"/>Progres Bulanan</h2>
          <div className="w-full md:w-[30%]">
            <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Realisasi Anggaran</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-[13px] font-bold">Rp.</span>
              <input type="text" className="w-full border border-gray-300 rounded-sm py-2 pl-9 pr-3 text-[13px] focus:ring-[#1e3a8a]" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-[13px] font-bold mb-1.5">Realisasi Bulan {monthLabels.prev}</label>
            <textarea className="w-full border border-gray-300 rounded-sm p-3 text-[13px] min-h-[120px]" />
          </div>
          <div>
            <label className="block text-[13px] font-bold mb-1.5">Rencana Bulan {monthLabels.next}</label>
            <textarea className="w-full border border-gray-300 rounded-sm p-3 text-[13px] min-h-[120px]" />
          </div>
        </div>
      </section>

      {selectedProgram !== "PLTS Irigasi" && <section className="w-full">{renderDynamicTables()}</section>}

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

      <div className="flex justify-end pt-5 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {showSuccess && <span className="flex items-center text-green-600 font-medium text-xs animate-pulse"><CheckCircle size={14} className="mr-1" /> Berhasil Disimpan</span>}
          <button onClick={handleSave} className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold text-sm py-2 px-6 rounded-md flex items-center gap-2 shadow-sm">
            <Save size={16} /> Simpan Progress
          </button>
        </div>
      </div>
    </div>
  );
}
