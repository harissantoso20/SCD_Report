import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { CheckCircle, Save } from './Icons';

import DataEntryHeader from './data-entry/DataEntryHeader';
import ProgramContextForm from './data-entry/ProgramContextForm';
import MonthlyProgressForm from './data-entry/MonthlyProgressForm';
import DynamicTablesManager from './data-entry/DynamicTablesManager';
import EvidenceUpload from './data-entry/EvidenceUpload';

export default function DataEntryView() {
  const selectedProgram = useAppStore((state) => state.globalProgram);
  const selectedDate = useAppStore((state) => state.globalDate);
  
  const programContext = useAppStore((state) => state.programContext);
  const storePltsLocations = useAppStore((state) => state.pltsLocations);
  const monthlyProgress = useAppStore((state) => state.monthlyProgress);
  const saveData = useAppStore((state) => state.saveData);
  const fetchData = useAppStore((state) => state.fetchData);
  const isLoading = useAppStore((state) => state.isLoading);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      current: months[currentMonthIndex], 
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
  
  const tablesDataFromStore = useAppStore((state) => state.tablesData);
  const extraFieldsFromStore = useAppStore((state) => state.extraFields);
  
  const [tablesData, setTablesData] = useState({});
  const [extraFields, setExtraFields] = useState({});
  const [isPltsEditing, setIsPltsEditing] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);

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

  const handlePltsChange = (id, field, value) => setPltsLocations(prev => prev.map(loc => loc.id === id ? { ...loc, [field]: value } : loc));
  const handleAddPltsRow = () => { 
    setPltsLocations([...pltsLocations, { id: Date.now(), location_name: "", capacity_kwp: "", area_ha: "", farmers: "" }]); 
    setIsPltsEditing(true); 
  };
  const handleContextEdit = (field) => setEditableContext(prev => ({ ...prev, [field]: !prev[field] }));
  const handleContextChange = (e, field) => setContextData(prev => ({ ...prev, [field]: e.target.value }));
  
  const handleTableChange = (tableId, newRows) => setTablesData(prev => ({ ...prev, [tableId]: newRows }));
  const handleExtraFieldChange = (fieldKey, value) => setExtraFields(prev => ({ ...prev, [fieldKey]: value }));

  const handleSave = async () => { 
    setIsSaving(true);
    const result = await saveData({
      programContext: contextData,
      pltsLocations: pltsLocations,
      monthlyProgress: monthlyState,
      tablesData: tablesData,
      extraFields: extraFields,
      evidenceFiles: evidenceFiles
    });
    
    setIsSaving(false);

    if (result.success) {
      setShowSuccess(true); 
      setTimeout(() => setShowSuccess(false), 3000); 
    } else {
      alert("Gagal menyimpan data: " + result.error.message);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <DataEntryHeader isLoading={isLoading} />

      <ProgramContextForm 
        selectedProgram={selectedProgram}
        contextData={contextData}
        handleContextChange={handleContextChange}
        editableContext={editableContext}
        handleContextEdit={handleContextEdit}
        pltsLocations={pltsLocations}
        handlePltsChange={handlePltsChange}
        handleAddPltsRow={handleAddPltsRow}
        isPltsEditing={isPltsEditing}
        setIsPltsEditing={setIsPltsEditing}
      />

      <MonthlyProgressForm 
        monthLabels={monthLabels}
        monthlyState={monthlyState}
        setMonthlyState={setMonthlyState}
      />

      {selectedProgram !== "PLTS Irigasi" && (
        <section className="w-full bg-white border border-gray-200 p-5 rounded-md shadow-sm">
          <DynamicTablesManager 
            selectedProgram={selectedProgram}
            tablesData={tablesData}
            handleTableChange={handleTableChange}
            extraFields={extraFields}
            handleExtraFieldChange={handleExtraFieldChange}
          />
        </section>
      )}

      <EvidenceUpload files={evidenceFiles} setFiles={setEvidenceFiles} />

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
