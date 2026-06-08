import React from 'react';
import { FileText, CheckCircle, Edit2, Save, Plus } from '../Icons';

export default function ProgramContextForm({
  selectedProgram,
  contextData,
  handleContextChange,
  editableContext,
  handleContextEdit,
  pltsLocations,
  handlePltsChange,
  handleAddPltsRow,
  isPltsEditing,
  setIsPltsEditing
}) {
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

  if (selectedProgram === "PLTS Irigasi") {
    return (
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
    );
  }

  return (
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
  );
}
