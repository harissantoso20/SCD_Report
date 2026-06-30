import React, { useEffect } from 'react';
import { TableIcon } from '../Icons';

export const GenericDynamicTable = ({ title, headers, initialLabels, value = [], onChange, unitOptionsMap = {} }) => {
  useEffect(() => {
    if (initialLabels.length > 0) {
      if (value.length === 0) {
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
      } else if (initialLabels.includes("Lainnya")) {
        const lastRow = value[value.length - 1];
        if (!lastRow.isOthers || lastRow.product_name !== "") {
          onChange([...value, { 
            id: Date.now(), 
            product_name: "", 
            isOthers: true, 
            qty: "", 
            unit_price: "", 
            revenue: "",
            unit: unitOptionsMap["Lainnya"] ? unitOptionsMap["Lainnya"][0] : ""
          }]);
        }
      }
    }
  }, [value.length, onChange]); 

  const handleFieldChange = (id, field, val) => {
    const newRows = [...value]; 
    const rowIndex = newRows.findIndex(r => r.id === id);
    if (rowIndex === -1) return; 
    
    let updatedRow = { ...newRows[rowIndex], [field]: val };

    if (field === 'qty' || field === 'unit_price') {
      const q = parseFloat(field === 'qty' ? val : updatedRow.qty);
      const p = parseFloat(field === 'unit_price' ? val : updatedRow.unit_price);
      if (!isNaN(q) && !isNaN(p)) {
        updatedRow.revenue = (q * p).toString();
      } else {
        updatedRow.revenue = "";
      }
    }

    newRows[rowIndex] = updatedRow;
    
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
              const uOptions = unitOptionsMap[row.product_name] || unitOptionsMap["Lainnya"];
              
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
                  <td className="px-3 py-2.5"><input type="number" className="w-full border border-gray-300 p-1.5 rounded bg-gray-100 text-gray-600 cursor-not-allowed" readOnly value={row.revenue} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SimpleQtyTable = ({ title, headers, initialLabels, value = [], onChange }) => {
  useEffect(() => {
    if (initialLabels.length > 0) {
      if (value.length === 0) {
        const initialRows = initialLabels.map((label, i) => ({ 
          id: i + 1, 
          product_name: label === "Lainnya" ? "" : label, 
          isOthers: label === "Lainnya", 
          qty: ""
        }));
        onChange(initialRows);
      } else if (initialLabels.includes("Lainnya")) {
        const lastRow = value[value.length - 1];
        if (!lastRow.isOthers || lastRow.product_name !== "") {
          onChange([...value, { 
            id: Date.now(), 
            product_name: "", 
            isOthers: true, 
            qty: ""
          }]);
        }
      }
    }
  }, [value.length, onChange]); 

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
        qty: ""
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
            <tr>{headers.map((h, i) => <th key={i} className={`px-4 py-3.5 border-b border-gray-200 ${i === 0 ? 'w-1/2' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {value.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/60">
                <td className="px-4 py-2.5 font-semibold text-gray-800">
                  {row.isOthers ? 
                    <input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" placeholder="Lainnya..." value={row.product_name} onChange={(e) => handleFieldChange(row.id, 'product_name', e.target.value)} /> 
                    : row.product_name}
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" value={row.qty} onChange={(e) => handleFieldChange(row.id, 'qty', e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PrabumenangDynamicTable = ({ title, value = [], onChange }) => {
  const headers = ["Jenis Produk", "Nama Produk", "Qty (Kg)", "Harga Satuan (Rp)", "Omzet"];
  const jenisProdukOptions = ["Produk Setengah Jadi", "Produk Olahan"];

  useEffect(() => {
    if (value.length === 0) {
      onChange([{ 
        id: 1, 
        jenis_produk: jenisProdukOptions[0],
        product_name: "", 
        qty: "", 
        unit_price: "", 
        revenue: ""
      }]);
    } else {
      const lastRow = value[value.length - 1];
      if (lastRow.product_name !== "") {
        onChange([...value, { 
          id: Date.now(), 
          jenis_produk: jenisProdukOptions[0],
          product_name: "", 
          qty: "", 
          unit_price: "", 
          revenue: ""
        }]);
      }
    }
  }, [value.length, onChange]); 

  const handleFieldChange = (id, field, val) => {
    const newRows = [...value]; 
    const rowIndex = newRows.findIndex(r => r.id === id);
    if (rowIndex === -1) return; 
    
    let updatedRow = { ...newRows[rowIndex], [field]: val };

    if (field === 'qty' || field === 'unit_price') {
      const q = parseFloat(field === 'qty' ? val : updatedRow.qty);
      const p = parseFloat(field === 'unit_price' ? val : updatedRow.unit_price);
      if (!isNaN(q) && !isNaN(p)) {
        updatedRow.revenue = (q * p).toString();
      } else {
        updatedRow.revenue = "";
      }
    }

    newRows[rowIndex] = updatedRow;
    
    if (field === 'product_name' && rowIndex === newRows.length - 1 && val.trim() !== "") {
      newRows.push({ 
        id: Date.now(), 
        jenis_produk: jenisProdukOptions[0],
        product_name: "", 
        qty: "", 
        unit_price: "", 
        revenue: ""
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
            <tr>{headers.map((h, i) => <th key={i} className="px-4 py-3.5 border-b border-gray-200">{h}</th>)}</tr>
          </thead>
          <tbody>
            {value.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/60">
                <td className="px-3 py-2.5">
                  <select 
                    className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a] bg-white cursor-pointer" 
                    value={row.jenis_produk || jenisProdukOptions[0]} 
                    onChange={(e) => handleFieldChange(row.id, 'jenis_produk', e.target.value)}
                  >
                    {jenisProdukOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input type="text" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" placeholder="Nama Produk..." value={row.product_name} onChange={(e) => handleFieldChange(row.id, 'product_name', e.target.value)} />
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" value={row.qty} onChange={(e) => handleFieldChange(row.id, 'qty', e.target.value)} />
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" className="w-full border border-gray-300 p-1.5 rounded focus:border-[#25326a]" value={row.unit_price} onChange={(e) => handleFieldChange(row.id, 'unit_price', e.target.value)} />
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" className="w-full border border-gray-300 p-1.5 rounded bg-gray-100 text-gray-600 cursor-not-allowed" readOnly value={row.revenue} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function DynamicTablesManager({ selectedProgram, tablesData, handleTableChange, extraFields, handleExtraFieldChange }) {
  const p = selectedProgram?.toLowerCase() || '';
  
  if (p === "plts irigasi" || p.includes("proklim") || p.includes("ras system") || p.includes("ba-maxi") || p.includes("sirah pulau") || p.includes("bedegung")) {
    return null;
  }

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
          initialLabels={["Fresh Maggot", "Maggot Kering", "Kasgot", "Lainnya"]} 
          value={tablesData['maggot']}
          onChange={(rows) => handleTableChange('maggot', rows)}
        />
      </div>
    );
  }
  
  if (p.includes("ikan air tawar")) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <GenericDynamicTable 
          title="Penjualan Ikan Konsumsi" 
          headers={["Produk", "Qty (Kg)", "Harga Satuan (Rp)", "Omzet"]} 
          initialLabels={["Lele", "Nila", "Patin", "Gurame", "Lainnya"]} 
          value={tablesData['Ikan Konsumsi']}
          onChange={(rows) => handleTableChange('Ikan Konsumsi', rows)}
        />
        <GenericDynamicTable 
          title="Penjualan Bibit Ikan" 
          headers={["Produk", "Qty (Ekor)", "Harga Satuan (Rp)", "Omzet"]} 
          initialLabels={["Lele", "Nila", "Patin", "Gurame", "Lainnya"]} 
          value={tablesData['Bibit Ikan']}
          onChange={(rows) => handleTableChange('Bibit Ikan', rows)}
        />
      </div>
    );
  }

  if (p.includes("pembibitan")) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <SimpleQtyTable 
          title="Jumlah Pembesaran (Batang)" 
          headers={["Jenis Tanaman", "Qty (Batang)"]} 
          initialLabels={["Kaliandra", "Lainnya"]} 
          value={tablesData['pembesaran_batang']}
          onChange={(rows) => handleTableChange('pembesaran_batang', rows)}
        />
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
        <SimpleQtyTable 
          title="Jumlah Pembesaran (Batang)" 
          headers={["Jenis Tanaman", "Qty (Batang)"]} 
          initialLabels={["Sawit", "Kayu Putih", "Lainnya"]} 
          value={tablesData['pembesaran_batang']}
          onChange={(rows) => handleTableChange('pembesaran_batang', rows)}
        />
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

  if (p.includes("prabumenang")) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <PrabumenangDynamicTable 
          title="Penjualan Produk" 
          value={tablesData['produk_olahan']}
          onChange={(rows) => handleTableChange('produk_olahan', rows)}
        />
      </div>
    );
  }

  if (p.includes("ecogrow")) {
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
