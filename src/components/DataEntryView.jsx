import React, { useState, useEffect } from 'react';
import { PROGRAMS, PROGRAM_IMAGES } from '../data/mockData';
import { ChevronDown, CheckCircle, Edit2, TableIcon, FileText, TrendingUp, Paperclip, UploadCloud, Save, Plus } from './Icons';
import useAppStore from '../store/useAppStore';

const GenericDynamicTable = ({ title, headers, initialLabels, value = [], onChange, unitOptionsMap = {} }) => {
  useEffect(() => {
    if (value.length === 0 && initialLabels.length > 0) {
      const initialRows = initialLabels.map((label, i) => ({ 
        id: i + 1, 
        product_name: label === "Lainnya" ? "" : label, 
        isOthers: label === "Lainnya", 
        qty: "", 
        unit_price: "", 
        revenue: "",
        unit: unitOptionsMap[label] ? unitOptionsMap[label][0] : ""
      }));
      onChange(initialRows);
    }
  }, [initialLabels, value.length, onChange]); 

  const handleFieldChange = (id, field, val) => {
    const newRows = [...value]; 
    const rowIndex = newRows.findIndex(r => r.id === id);
    if (rowIndex === -1) return; 
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: val };
    
    if (field === 'product_name' && newRows[rowIndex].isOthers && rowIndex === newRows.length - 1 && val.trim() !== "") {
      newRows.push({ 
        id: Date.now(), 
        product_name: "", 
        isOthers: true, 
        qty: "", 
        unit_price: "", 
        revenue: "",
        unit: unitOptionsMap["Lainnya"] ? unitOptionsMap["Lainnya"][0] : ""
      });
    }
    onChange(newRows);
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
            {value.map((row) => {
              const uOptions = unitOptionsMap[row.product_name] || (row.isOthers ? unitOptionsMap["Lainnya"] : null);
              
              return (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/60">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">
                    {row.isOthers ? 
                      <input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" placeholder="Lainnya..." value={row.product_name} onChange={(e) => handleFieldChange(row.id, 'product_name', e.target.value)} /> 
                      : row.product_name}
                  </td>
                  <td className="px-3 py-2.5">
                    {uOptions ? (
                      <div className="flex border border-gray-300 rounded focus-within:border-[#25326a] bg-white overflow-hidden">
                        <input type="number" className="w-full p-1.5 focus:outline-none" value={row.qty} onChange={(e) => handleFieldChange(row.id, 'qty', e.target.value)} />
                        <select className="bg-gray-50 border-l border-gray-300 px-2 text-sm focus:outline-none cursor-pointer" value={row.unit || uOptions[0]} onChange={(e) => handleFieldChange(row.id, 'unit', e.target.value)}>
                          {uOptions.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    ) : (
                      <input type="number" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" value={row.qty} onChange={(e) => handleFieldChange(row.id, 'qty', e.target.value)} />
                    )}
                  </td>
                  <td className="px-3 py-2.5"><input type="number" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" value={row.unit_price} onChange={(e) => handleFieldChange(row.id, 'unit_price', e.target.value)} /></td>
                  <td className="px-3 py-2.5"><input type="number" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" value={row.revenue} onChange={(e) => handleFieldChange(row.id, 'revenue', e.target.value)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function DataEntryView() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const setSelectedProgram = useAppStore((state) => state.setGlobalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  const setSelectedDate = useAppStore((state) => state.setGlobalDate);
  
  const programContext = useAppStore((state) => state.programContext);
  const storePltsLocations = useAppStore((state) => state.pltsLocations);
  const monthlyProgress = useAppStore((state) => state.monthlyProgress);
  const salesData = useAppStore((state) => state.salesData);
  const saveData = useAppStore((state) => state.saveData);
  const fetchData = useAppStore((state) => state.fetchData);
  const isLoading = useAppStore((state) => state.isLoading);
  const programListFromStore = useAppStore((state) => state.programList);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availablePrograms = programListFromStore?.length > 0 ? programListFromStore : PROGRAMS;

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const monthLabels = React.useMemo(() => {
    if (!selectedDate) return { prev: "...", next: "..." };
    const d = new Date(selectedDate);
    if (isNaN(d)) return { prev: "...", next: "..." };
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const currentMonthIndex = d.getMonth();
    return { 
      prev: months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1], 
      next: months[currentMonthIndex === 11 ? 0 : currentMonthIndex + 1] 
    };
  }, [selectedDate]);

  const [contextData, setContextData] = useState({ 
    budget_text: "", tpb: "", location: "", beneficiaries: "", kpi: "", objective: "" 
  });
  const [editableContext, setEditableContext] = useState({ 
    budget_text: false, tpb: false, location: false, beneficiaries: false, kpi: false, objective: false 
  });
  
  const [pltsLocations, setPltsLocations] = useState([]);
  const [monthlyState, setMonthlyState] = useState({ budget_realization_text: "", past_month_realization: "", next_month_plan: "" });
  
  // New States for Dynamic Tables and Extra Fields
  const tablesDataFromStore = useAppStore((state) => state.tablesData);
  const extraFieldsFromStore = useAppStore((state) => state.extraFields);
  
  const [tablesData, setTablesData] = useState({});
  const [extraFields, setExtraFields] = useState({});

  useEffect(() => {
    if (programContext) {
      setContextData({
        budget_text: programContext.budget_text || "",
        tpb: programContext.tpb || "",
        location: programContext.location || "",
        beneficiaries: programContext.beneficiaries || "",
        kpi: programContext.kpi || "",
        objective: programContext.objective || ""
      });
    } else {
      setContextData({ budget_text: "", tpb: "", location: "", beneficiaries: "", kpi: "", objective: "" });
    }

    if (storePltsLocations && storePltsLocations.length > 0) {
      setPltsLocations(storePltsLocations);
    } else {
      setPltsLocations([{ id: 1, location_name: "Talawi", capacity_kwp: "", area_ha: "", farmers: "" }]);
    }

    if (monthlyProgress) {
      setMonthlyState({
        budget_realization_text: monthlyProgress.budget_realization_text || "",
        past_month_realization: monthlyProgress.past_month_realization || "",
        next_month_plan: monthlyProgress.next_month_plan || ""
      });
    } else {
      setMonthlyState({ budget_realization_text: "", past_month_realization: "", next_month_plan: "" });
    }
    
    // Sync tables data and extra fields from store
    if (tablesDataFromStore && Object.keys(tablesDataFromStore).length > 0) {
      setTablesData(tablesDataFromStore);
    } else {
      setTablesData({});
    }
    
    if (extraFieldsFromStore && Object.keys(extraFieldsFromStore).length > 0) {
      setExtraFields(extraFieldsFromStore);
    } else {
      setExtraFields({});
    }
    
  }, [programContext, storePltsLocations, monthlyProgress, selectedProgram, tablesDataFromStore, extraFieldsFromStore]);
  
  const [isPltsEditing, setIsPltsEditing] = useState(false);

  const handlePltsChange = (id, field, value) => setPltsLocations(prev => prev.map(loc => loc.id === id ? { ...loc, [field]: value } : loc));
  const handleAddPltsRow = () => { 
    setPltsLocations([...pltsLocations, { id: Date.now(), location_name: "", capacity_kwp: "", area_ha: "", farmers: "" }]); 
    setIsPltsEditing(true); 
  };
  const handleContextEdit = (field) => setEditableContext(prev => ({ ...prev, [field]: !prev[field] }));
  const handleContextChange = (e, field) => setContextData(prev => ({ ...prev, [field]: e.target.value }));
  
  const handleTableChange = (tableId, newRows) => {
    setTablesData(prev => ({ ...prev, [tableId]: newRows }));
  };
  
  const handleExtraFieldChange = (fieldKey, value) => {
    setExtraFields(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleSave = async () => { 
    setIsSaving(true);
    
    // Flatten all tablesData into one array for saving (temporarily ignoring unit logic in DB)
    const allSalesData = Object.values(tablesData).flat().filter(row => row.product_name && row.product_name.trim() !== "");
    
    const result = await saveData({
      programContext: contextData,
      pltsLocations: pltsLocations,
      monthlyProgress: monthlyState,
      tablesData: tablesData,
      extraFields: extraFields
    });
    
    setIsSaving(false);

    if (result.success) {
      setShowSuccess(true); 
      setTimeout(() => setShowSuccess(false), 3000); 
    } else {
      alert("Gagal menyimpan data: " + result.error.message);
    }
  };
  const bannerImage = React.useMemo(() => PROGRAM_IMAGES[selectedProgram] || PROGRAM_IMAGES["default"], [selectedProgram]);

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

  const ContextField = ({ label, fieldKey, rows = 2, minHeight = "" }) => (
    <div className={`bg-white p-3 rounded-md border border-gray-200 shadow-sm relative group transition-all hover:border-gray-300 ${minHeight ? 'flex flex-col' : ''}`}>
      <div className="flex justify-between items-center mb-1.5 flex-none">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
        <button onClick={() => handleContextEdit(fieldKey)} className="text-gray-400 hover:text-[#1e3a8a] transition-colors">
          {editableContext[fieldKey] ? <CheckCircle size={16} className="text-green-600" /> : <Edit2 size={14} />}
        </button>
      </div>
      {editableContext[fieldKey] ? (
        <textarea className="w-full text-sm border-b-2 border-[#1e3a8a] focus:outline-none focus:ring-0 p-1 resize-y bg-blue-50/50 flex-1" value={contextData[fieldKey]} onChange={(e) => handleContextChange(e, fieldKey)} rows={rows} autoFocus />
      ) : (
        <p className={`text-sm text-gray-800 leading-snug whitespace-pre-wrap ${minHeight || ''}`}>{contextData[fieldKey] || "-"}</p>
      )}
    </div>
  );

  const renderDynamicTables = () => {
    const p = selectedProgram?.toLowerCase() || '';
    
    if (p.includes("maggot")) {
      return (
        <div className="flex flex-col gap-6 w-full">
           <div className="flex gap-4">
             <div className="flex-1">
               <label className="block text-sm font-bold text-gray-800 mb-1.5">Sampah Organik Terurai (Kg)</label>
               <input type="number" className="w-full border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#25326a]" value={extraFields['sampah_organik'] || ''} onChange={e => handleExtraFieldChange('sampah_organik', e.target.value)} />
             </div>
             <div className="flex-1">
               <label className="block text-sm font-bold text-gray-800 mb-1.5">Fresh Maggot Yang Dihasilkan (Kg)</label>
               <input type="number" className="w-full border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#25326a]" value={extraFields['maggot_dihasilkan'] || ''} onChange={e => handleExtraFieldChange('maggot_dihasilkan', e.target.value)} />
             </div>
           </div>
           <GenericDynamicTable 
             title="Penjualan" 
             headers={["Produk", "Qty (Kg)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Fresh Maggot", "Maggot Kering", "Kasgot"]} 
             value={tablesData['maggot']}
             onChange={(rows) => handleTableChange('maggot', rows)}
           />
        </div>
      );
    }
    
    if (p.includes("ikan air tawar") || p.includes("ras system")) {
      return (
        <div className="flex flex-col gap-4 w-full">
           <GenericDynamicTable 
             title="Penjualan Ikan Konsumsi" 
             headers={["Produk", "Qty (Kg)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Lele", "Nila", "Patin", "Gurame", "Lainnya"]} 
             value={tablesData['konsumsi']}
             onChange={(rows) => handleTableChange('konsumsi', rows)}
           />
           <GenericDynamicTable 
             title="Penjualan Bibit Ikan" 
             headers={["Produk", "Qty (Ekor)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Lele", "Nila", "Patin", "Gurame", "Lainnya"]} 
             value={tablesData['bibit']}
             onChange={(rows) => handleTableChange('bibit', rows)}
           />
        </div>
      );
    }

    if (p.includes("pembibitan")) {
      return (
        <div className="flex flex-col gap-4 w-full">
           <div className="w-1/2 pr-2 mb-2">
             <label className="block text-sm font-bold text-gray-800 mb-1.5">Jumlah Pembesaran (Batang)</label>
             <input type="number" className="w-full border border-gray-300 p-2.5 rounded-sm focus:outline-none focus:border-[#25326a]" value={extraFields['pembesaran_batang'] || ''} onChange={e => handleExtraFieldChange('pembesaran_batang', e.target.value)} />
           </div>
           <GenericDynamicTable 
             title="Penjualan Bibit Tanaman" 
             headers={["Produk", "Qty (Batang)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Kaliandra", "Lainnya"]} 
             value={tablesData['bibit_tanaman']}
             onChange={(rows) => handleTableChange('bibit_tanaman', rows)}
           />
           <GenericDynamicTable 
             title="Penjualan Produk Lainnya" 
             headers={["Produk", "Qty (Ea)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Media Tanam (Polybag)", "Lainnya"]} 
             value={tablesData['produk_lainnya']}
             onChange={(rows) => handleTableChange('produk_lainnya', rows)}
           />
        </div>
      );
    }
    
    if (p.includes("puyuh")) {
      return (
        <div className="flex flex-col gap-4 w-full">
           <GenericDynamicTable 
             title="Penjualan Telur Puyuh" 
             headers={["Produk", "Qty (Butir)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Telur Puyuh Mentah", "Lainnya"]} 
             value={tablesData['telur']}
             onChange={(rows) => handleTableChange('telur', rows)}
           />
           <GenericDynamicTable 
             title="Penjualan Produk Lainnya" 
             headers={["Produk", "Qty (Ea)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Kohe", "Lainnya"]} 
             value={tablesData['produk_lainnya']}
             onChange={(rows) => handleTableChange('produk_lainnya', rows)}
           />
        </div>
      );
    }

    if (p.includes("cahaya tani")) {
      return (
        <div className="flex flex-col gap-4 w-full">
           <GenericDynamicTable 
             title="Penjualan Bibit Tanaman" 
             headers={["Produk", "Qty (Batang)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Sawit", "Kayu Putih", "Lainnya"]} 
             value={tablesData['bibit_tanaman']}
             onChange={(rows) => handleTableChange('bibit_tanaman', rows)}
           />
        </div>
      );
    }

    if (p.includes("itik")) {
      return (
        <div className="flex flex-col gap-4 w-full">
           <GenericDynamicTable 
             title="Penjualan Telur Itik" 
             headers={["Produk", "Qty (Butir)", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Telur Mentah", "Telur Asin Mentah", "Telur Asin Matang", "Lainnya"]} 
             value={tablesData['telur']}
             onChange={(rows) => handleTableChange('telur', rows)}
           />
        </div>
      );
    }

    if (p.includes("prabumenang") || p.includes("ecogrow")) {
      return (
        <div className="flex flex-col gap-4 w-full">
           <GenericDynamicTable 
             title="Penjualan" 
             headers={["Produk", "Qty", "Harga Satuan (Rp)", "Omzet"]} 
             initialLabels={["Kangkung", "Terong", "Lainnya"]} 
             value={tablesData['sayur']}
             onChange={(rows) => handleTableChange('sayur', rows)}
             unitOptionsMap={{ 
               "Kangkung": ["Ikat", "Kg"], 
               "Terong": ["Kg", "Ikat"],
               "Lainnya": ["Kg", "Ikat", "Pcs"]
             }}
           />
        </div>
      );
    }

    // Default for any other program that is not PLTS
    if (p !== "plts irigasi") {
      return (
        <GenericDynamicTable 
          title="Data Kuantitatif / Penjualan" 
          headers={["ITEM / PRODUK", "QTY", "HARGA SATUAN (RP)", "NILAI / OMZET"]} 
          initialLabels={["Item Utama", "Lainnya"]} 
          value={tablesData['default']}
          onChange={(rows) => handleTableChange('default', rows)}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-2 tracking-tight">Data Entry {isLoading && <span className="text-sm font-normal text-gray-400">(Loading...)</span>}</h2>
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
                {availablePrograms.map(prog => <option key={prog} value={prog}>{prog}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-8 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 rounded-md overflow-hidden border border-gray-200 shadow-sm relative min-h-[200px] lg:min-h-0">
          <img src={bannerImage} alt={`Banner ${selectedProgram}`} className="absolute inset-0 w-full h-full object-cover object-center" />
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
                          {isPltsEditing ? <input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-blue-500" value={row.location_name} onChange={(e) => handlePltsChange(row.id, 'location_name', e.target.value)} /> : row.location_name}
                        </td>
                        <td className="px-3 py-2.5">
                          {isPltsEditing ? <input type="number" className="w-full border p-1.5 rounded text-center" value={row.capacity_kwp} onChange={(e) => handlePltsChange(row.id, 'capacity_kwp', e.target.value)} /> : row.capacity_kwp}
                        </td>
                        <td className="px-3 py-2.5">
                          {isPltsEditing ? <input type="number" className="w-full border p-1.5 rounded text-center" value={row.area_ha} onChange={(e) => handlePltsChange(row.id, 'area_ha', e.target.value)} /> : row.area_ha}
                        </td>
                        <td className="px-3 py-2.5">
                          {isPltsEditing ? <input type="number" className="w-full border p-1.5 rounded text-center" value={row.farmers} onChange={(e) => handlePltsChange(row.id, 'farmers', e.target.value)} /> : row.farmers}
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
              <PltsContextField label="Anggaran" fieldKey="budget_text" />
              <PltsContextField label="TPB/SDGs" fieldKey="tpb" rows={2} />
              <PltsContextField label="Lokasi" fieldKey="location" rows={2} />
              <PltsContextField label="Penerima Manfaat" fieldKey="beneficiaries" rows={2} />
              <PltsContextField label="KPI" fieldKey="kpi" rows={3} minHeight="min-h-[60px]" />
              <PltsContextField label="Objektif" fieldKey="objective" minHeight="min-h-[80px]" wrapperClass="flex-1 mb-0" />
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-6 border border-gray-200 rounded-md p-5 bg-white shadow-sm">
          <div>
            <h2 className="text-[14px] font-bold text-[#25326a] uppercase border-b border-gray-200 pb-2 mb-4 flex gap-2"><FileText size={18} className="text-[#1e3a8a]"/>KONTEKS UMUM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContextField label="Anggaran" fieldKey="budget_text" />
              <ContextField label="TPB/SDGs" fieldKey="tpb" />
              <ContextField label="Lokasi" fieldKey="location" />
              <ContextField label="Penerima Manfaat" fieldKey="beneficiaries" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ContextField label="KPI" fieldKey="kpi" rows={6} minHeight="min-h-[144px]" />
            <ContextField label="Objektif" fieldKey="objective" rows={6} minHeight="min-h-[144px]" />
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
              <input type="text" className="w-full border border-gray-300 rounded-sm py-2 pl-9 pr-3 text-[13px] focus:ring-[#1e3a8a]" value={monthlyState.budget_realization_text} onChange={(e) => setMonthlyState(prev => ({...prev, budget_realization_text: e.target.value}))} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-[13px] font-bold mb-1.5">Realisasi Bulan {monthLabels.prev}</label>
            <textarea className="w-full border border-gray-300 rounded-sm p-3 text-[13px] min-h-[120px]" value={monthlyState.past_month_realization} onChange={(e) => setMonthlyState(prev => ({...prev, past_month_realization: e.target.value}))} />
          </div>
          <div>
            <label className="block text-[13px] font-bold mb-1.5">Rencana Bulan {monthLabels.next}</label>
            <textarea className="w-full border border-gray-300 rounded-sm p-3 text-[13px] min-h-[120px]" value={monthlyState.next_month_plan} onChange={(e) => setMonthlyState(prev => ({...prev, next_month_plan: e.target.value}))} />
          </div>
        </div>
      </section>

      {selectedProgram !== "PLTS Irigasi" && <section className="w-full bg-white border border-gray-200 p-5 rounded-md shadow-sm">{renderDynamicTables()}</section>}

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
          <button onClick={handleSave} disabled={isSaving} className={`${isSaving ? 'bg-gray-400' : 'bg-[#1e3a8a] hover:bg-blue-900'} text-white font-semibold text-sm py-2 px-6 rounded-md flex items-center gap-2 shadow-sm transition-colors`}>
            <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan Progress'}
          </button>
        </div>
      </div>
    </div>
  );
}
