import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip,
  CartesianGrid, XAxis, YAxis, LabelList
} from 'recharts';
import useAppStore from '../../store/useAppStore';
import { usePembibitanData } from '../../hooks/programs/usePembibitanData';
import { useMaggotData } from '../../hooks/programs/useMaggotData';
import { useLingkarTambangData } from '../../hooks/programs/useLingkarTambangData';
import { 
  BarChart2, PieChart as PieIcon, DollarSign, Package, Sprout, TrendingUp,
  ShoppingBag, MapPin, Zap, Users, Camera, Activity, Layers
} from 'lucide-react';

const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
const formatJuta = (val) => {
  if (!val || val === 0) return '0';
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} Jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} Rb`;
  return val.toString();
};

const getPercentage = (curr, prev) => {
  if (!prev || prev === 0) return curr > 0 ? '+100%' : '0%';
  const pct = ((curr - prev) / prev) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
};

const VARIETY_COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

function getDisplayImageUrl(url) {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SIBA PEMBIBITAN INFOGRAPHICS
// ─────────────────────────────────────────────────────────────────────────────
function PembibitanInfographics({ currentMonthIdx, currentMonthName, currentYearStr, validEvidences }) {
  const { pembibitanOverviewData, pembibitanYTD, currentYear } = usePembibitanData();
  const salesData = useAppStore((state) => state.salesData) || [];

  const prevYear = Number(currentYear || currentYearStr) - 1;

  // Filter overview data up to current reporting month
  const overviewData = useMemo(() => {
    return pembibitanOverviewData.filter((_, idx) => idx <= currentMonthIdx);
  }, [pembibitanOverviewData, currentMonthIdx]);

  // YTD Table Data YoY
  const YTD_TABLE_DATA = useMemo(() => [
    { variabel: 'Pembesaran Bibit (Batang)', prevYearData: pembibitanYTD?.prevPembesaran || 0, currYearData: pembibitanYTD?.currPembesaran || 0, percent: getPercentage(pembibitanYTD?.currPembesaran || 0, pembibitanYTD?.prevPembesaran || 0), isCurrency: false },
    { variabel: 'Penjualan Bibit (Batang)', prevYearData: pembibitanYTD?.prevPenjualan || 0, currYearData: pembibitanYTD?.currPenjualan || 0, percent: getPercentage(pembibitanYTD?.currPenjualan || 0, pembibitanYTD?.prevPenjualan || 0), isCurrency: false },
    { variabel: 'Penjualan Polybag (Ea)', prevYearData: pembibitanYTD?.prevPolybag || 0, currYearData: pembibitanYTD?.currPolybag || 0, percent: getPercentage(pembibitanYTD?.currPolybag || 0, pembibitanYTD?.prevPolybag || 0), isCurrency: false },
    { variabel: 'Total Omzet Keseluruhan', prevYearData: pembibitanYTD?.prevRevenue || 0, currYearData: pembibitanYTD?.currRevenue || 0, percent: getPercentage(pembibitanYTD?.currRevenue || 0, pembibitanYTD?.prevRevenue || 0), isCurrency: true },
  ], [pembibitanYTD]);

  const stockToSalesRatio = (pembibitanYTD?.currPembesaran || 0) > 0
    ? (((pembibitanYTD?.currPenjualan || 0) / (pembibitanYTD?.currPembesaran || 0)) * 100).toFixed(1)
    : 0;

  // All commodities breakdown
  const allCommodities = useMemo(() => {
    const map = {};
    salesData.filter(d => String(d.Tahun) === String(currentYearStr)).forEach(row => {
      const prodName = row.Produk && row.Produk !== '-' ? row.Produk : (row['Kategori Produk'] || 'Produk');
      if (!map[prodName]) {
        map[prodName] = { name: prodName, volume: 0, omzet: 0, unit: row.Satuan_1 || 'Batang' };
      }
      map[prodName].volume += (Number(row.Jumlah) || 0);
      map[prodName].omzet += (Number(row.Omzet) || 0);
    });
    return Object.values(map).sort((a, b) => b.omzet - a.omzet);
  }, [salesData, currentYearStr]);

  const totalRevenue = pembibitanYTD?.currRevenue || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 print-grid-4 gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-[#1e3a8a] border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Total Revenue YTD</span>
            <DollarSign size={12} className="text-[#1e3a8a]" />
          </p>
          <p className="text-sm font-extrabold text-[#1e3a8a]">
            Rp {formatRupiah(totalRevenue)}
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Akumulasi s.d. {currentMonthName}</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-blue-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Penjualan Bibit</span>
            <ShoppingBag size={12} className="text-blue-600" />
          </p>
          <p className="text-sm font-extrabold text-blue-800">
            {formatNumber(pembibitanYTD?.currPenjualan || 0)} Batang
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Realisasi output terjual</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-indigo-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Stok Pembesaran</span>
            <Sprout size={12} className="text-indigo-600" />
          </p>
          <p className="text-sm font-extrabold text-indigo-800">
            {formatNumber(pembibitanYTD?.currPembesaran || 0)} Batang
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Kapasitas pembibitan aktif</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Rasio Stok to Sale</span>
            <TrendingUp size={12} className="text-emerald-600" />
          </p>
          <p className="text-sm font-extrabold text-emerald-800">
            {stockToSalesRatio}% Terjual
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Perputaran stok bibit</p>
        </div>
      </div>

      {/* Row 1: Dual Main Charts (Penjualan Bibit & Media Tanam) */}
      <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 gap-3 page-break-inside-avoid">
        {/* Chart 1: Penjualan Bibit */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-[10.5px] font-bold text-[#1e3a8a] uppercase tracking-wide flex items-center gap-1.5">
              <BarChart2 size={12} className="text-[#1e3a8a]" /> Penjualan & Pembesaran Bibit
            </h4>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#1e3a8a] rounded-xs inline-block"></span> Pembesaran</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3b82f6] rounded-xs inline-block"></span> Penjualan</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#f43f5e] rounded-full inline-block"></span> Omzet</span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip />
                <Bar dataKey="pembesaran_batang" name="Pembesaran (Btg)" fill="#1e3a8a" radius={[2, 2, 0, 0]} maxBarSize={20}>
                  <LabelList dataKey="pembesaran_batang" position="top" style={{ fontSize: '8px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
                <Bar dataKey="penjualan_batang" name="Penjualan (Btg)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={20}>
                  <LabelList dataKey="penjualan_batang" position="top" style={{ fontSize: '8px', fill: '#2563eb', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
                <Line type="monotone" dataKey="total_rp" name="Omzet (Rp)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }}>
                  <LabelList dataKey="total_rp" position="top" offset={8} style={{ fontSize: '8px', fill: '#e11d48', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Line>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Penjualan Media Tanam */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <Sprout size={12} className="text-emerald-700" /> Penjualan Media Tanam (Polybag)
            </h4>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981] rounded-xs inline-block"></span> Terjual (Pcs)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#059669] rounded-full inline-block"></span> Omzet (Rp)</span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip />
                <Bar dataKey="polybag_sold" name="Terjual (Pcs)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  <LabelList dataKey="polybag_sold" position="top" style={{ fontSize: '8px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
                <Line type="monotone" dataKey="polybag_omzet" name="Omzet (Rp)" stroke="#059669" strokeWidth={2} dot={{ r: 3, fill: '#059669' }}>
                  <LabelList dataKey="polybag_omzet" position="top" offset={8} style={{ fontSize: '8px', fill: '#047857', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Line>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Rekapitulasi YTD YoY & Rasio Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 print-grid-2-1 gap-3 page-break-inside-avoid">
        {/* Table YTD YoY (2 Cols) */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
          <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
            Rekapitulasi Kinerja Year to Date (YTD YoY)
          </h4>
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                <tr>
                  <th className="px-2.5 py-1.5 border-b border-slate-200">Variabel Kinerja</th>
                  <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Tahun {prevYear}</th>
                  <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Tahun {currentYear}</th>
                  <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Pertumbuhan YoY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {YTD_TABLE_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-2.5 py-1 font-semibold text-slate-700">{row.variabel}</td>
                    <td className="px-2.5 py-1 text-center text-slate-500">
                      {row.isCurrency ? `Rp ${formatRupiah(row.prevYearData)}` : formatNumber(row.prevYearData)}
                    </td>
                    <td className="px-2.5 py-1 text-center font-bold text-[#1e3a8a]">
                      {row.isCurrency ? `Rp ${formatRupiah(row.currYearData)}` : formatNumber(row.currYearData)}
                    </td>
                    <td className={`px-2.5 py-1 text-center font-extrabold ${row.percent.startsWith('+') ? 'text-blue-600' : 'text-slate-500'}`}>
                      {row.percent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rasio Bibit vs Media Tanam (1 Col) */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col items-center">
          <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1 w-full text-center">
            Porsi Bibit vs Media Tanam
          </h4>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bibit', value: pembibitanYTD?.currBibitOmzet || 1, fill: '#3b82f6' },
                    { name: 'Media Tanam', value: pembibitanYTD?.currPolybagOmzet || 0, fill: '#10b981' }
                  ]}
                  cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" stroke="#fff" strokeWidth={2}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(v) => `Rp ${formatRupiah(v)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-3 text-[9px] font-bold text-slate-600 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3b82f6] rounded-xs inline-block"></span> Bibit</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981] rounded-xs inline-block"></span> Media Tanam</span>
          </div>
        </div>
      </div>

      {/* Row 3: Tabel Lengkap Seluruh Komoditas/Varietas */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs page-break-inside-avoid">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
          <h4 className="text-[10.5px] font-bold text-[#1e3a8a] uppercase tracking-wide flex items-center gap-1.5">
            <Layers size={12} className="text-[#1e3a8a]" /> Portofolio Lengkap Komoditas Bibit & Hasil Produksi ({allCommodities.length} Varietas)
          </h4>
          <span className="text-[9.5px] font-semibold text-slate-500">
            Total Omzet: Rp {formatRupiah(totalRevenue)}
          </span>
        </div>
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
              <tr>
                <th className="px-2.5 py-1.5 border-b border-slate-200 w-8 text-center">No</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200">Komoditas / Varietas</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 text-right">Volume</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 text-right">Omzet Penjualan (Rp)</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 w-32 text-center">Porsi Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allCommodities.map((item, idx) => {
                const share = totalRevenue > 0 ? Math.round((item.omzet / totalRevenue) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-2.5 py-1 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-2.5 py-1 font-bold text-slate-800">{item.name}</td>
                    <td className="px-2.5 py-1 text-right font-semibold text-slate-700">
                      {formatNumber(item.volume)} <span className="text-[8.5px] text-slate-500">{item.unit}</span>
                    </td>
                    <td className="px-2.5 py-1 text-right font-bold text-[#1e3a8a]">
                      Rp {formatRupiah(item.omzet)}
                    </td>
                    <td className="px-2.5 py-1 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#1e3a8a] h-1.5 rounded-full" style={{ width: `${share}%` }}></div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 w-6 text-right">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Eviden Foto Jika Ada */}
      {validEvidences && validEvidences.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs page-break-inside-avoid">
          <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wide mb-2 flex items-center gap-1">
            <Camera size={12} className="text-[#1e3a8a]" /> Dokumentasi Eviden Lapangan
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {validEvidences.map((ev, idx) => (
              <div key={idx} className="border border-slate-200 rounded overflow-hidden bg-slate-50">
                <img src={getDisplayImageUrl(ev.File_Url)} alt={`Dokumentasi ${idx + 1}`} className="w-full h-20 object-cover" crossOrigin="anonymous" />
                <div className="p-1 text-[8.5px] font-medium text-slate-600 truncate text-center bg-white">
                  {ev.Keterangan || `Dokumentasi Lapangan #${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BUDIDAYA MAGGOT BSF INFOGRAPHICS
// ─────────────────────────────────────────────────────────────────────────────
function MaggotInfographics({ currentMonthIdx, currentMonthName, currentYearStr, validEvidences }) {
  const { maggotBioconversionData, maggotFinancialData, maggotPortfolioData, maggotYTD } = useMaggotData();
  const salesData = useAppStore((state) => state.salesData) || [];

  const bioData = useMemo(() => {
    return maggotBioconversionData.filter((_, idx) => idx <= currentMonthIdx);
  }, [maggotBioconversionData, currentMonthIdx]);

  const financialData = useMemo(() => {
    return maggotFinancialData.filter((_, idx) => idx <= currentMonthIdx);
  }, [maggotFinancialData, currentMonthIdx]);

  const allCommodities = useMemo(() => {
    const map = {};
    salesData.filter(d => String(d.Tahun) === String(currentYearStr)).forEach(row => {
      const prodName = row.Produk && row.Produk !== '-' ? row.Produk : (row['Kategori Produk'] || 'Produk');
      if (!map[prodName]) {
        map[prodName] = { name: prodName, volume: 0, omzet: 0, unit: row.Satuan_1 || 'Kg' };
      }
      map[prodName].volume += (Number(row.Jumlah) || 0);
      map[prodName].omzet += (Number(row.Omzet) || 0);
    });
    return Object.values(map).sort((a, b) => b.omzet - a.omzet);
  }, [salesData, currentYearStr]);

  return (
    <div className="flex flex-col gap-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 print-grid-4 gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-[#1e3a8a] border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Total Omzet YTD</span>
            <DollarSign size={12} className="text-[#1e3a8a]" />
          </p>
          <p className="text-sm font-extrabold text-[#1e3a8a]">
            Rp {formatRupiah(maggotYTD?.currOmzet || 0)}
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Akumulasi s.d. {currentMonthName}</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Sampah Terurai</span>
            <Sprout size={12} className="text-emerald-600" />
          </p>
          <p className="text-sm font-extrabold text-emerald-800">
            {formatNumber(maggotYTD?.currWaste || 0)} Kg
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Biokonversi terkelola</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Panen Fresh Maggot</span>
            <Package size={12} className="text-amber-500" />
          </p>
          <p className="text-sm font-extrabold text-amber-800">
            {formatNumber(maggotYTD?.currFresh || 0)} Kg
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Output larva segar</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-blue-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Kasgot Organik</span>
            <Layers size={12} className="text-blue-600" />
          </p>
          <p className="text-sm font-extrabold text-blue-800">
            {formatNumber(financialData.reduce((s, i) => s + (i.kasgot || 0), 0))} Kg
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Pupuk kasgot dihasilkan</p>
        </div>
      </div>

      {/* Row 1: Dual Charts (Biokonversi & Finansial) */}
      <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 gap-3 page-break-inside-avoid">
        {/* Chart 1: Biokonversi Sampah Organik */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <Sprout size={12} className="text-emerald-700" /> Biokonversi Sampah vs Fresh Maggot
            </h4>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981] rounded-xs inline-block"></span> Sampah (Kg)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#eab308] rounded-xs inline-block"></span> Maggot (Kg)</span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bioData} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip />
                <Bar dataKey="sampah" name="Sampah Organik (Kg)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  <LabelList dataKey="sampah" position="top" style={{ fontSize: '8px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
                <Bar dataKey="maggot" name="Fresh Maggot (Kg)" fill="#eab308" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  <LabelList dataKey="maggot" position="top" style={{ fontSize: '8px', fill: '#d97706', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Finansial Bulanan */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-[10.5px] font-bold text-[#1e3a8a] uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign size={12} className="text-[#1e3a8a]" /> Kinerja Finansial & Penjualan Produk
            </h4>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#eab308] rounded-xs inline-block"></span> Fresh</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#f59e0b] rounded-xs inline-block"></span> Kering</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#1e3a8a] rounded-xs inline-block"></span> Kasgot</span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : v} />
                <Tooltip />
                <Bar dataKey="omzet_fresh" name="Fresh Maggot (Rp)" fill="#eab308" radius={[2, 2, 0, 0]} maxBarSize={18}>
                  <LabelList dataKey="omzet_fresh" position="top" style={{ fontSize: '8px', fill: '#d97706', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Bar>
                <Bar dataKey="omzet_kering" name="Maggot Kering (Rp)" fill="#f59e0b" radius={[2, 2, 0, 0]} maxBarSize={18}>
                  <LabelList dataKey="omzet_kering" position="top" style={{ fontSize: '8px', fill: '#b45309', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Bar>
                <Bar dataKey="omzet_kasgot" name="Kasgot (Rp)" fill="#1e3a8a" radius={[2, 2, 0, 0]} maxBarSize={18}>
                  <LabelList dataKey="omzet_kasgot" position="top" style={{ fontSize: '8px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Portofolio Pie & Rekap Tabel */}
      <div className="grid grid-cols-1 md:grid-cols-3 print-grid-1-2 gap-3 page-break-inside-avoid">
        {/* Portofolio Pie */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col items-center">
          <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1 w-full text-center">
            Porsi Portofolio Pendapatan
          </h4>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maggotPortfolioData && maggotPortfolioData.length > 0 ? maggotPortfolioData : [{ name: 'Fresh Maggot', value: 1, color: '#eab308' }]}
                  cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" stroke="#fff" strokeWidth={2}
                >
                  {(maggotPortfolioData || []).map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || VARIETY_COLORS[idx % VARIETY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `Rp ${formatRupiah(v)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[8.5px] font-bold text-slate-600 mt-1">
            {(maggotPortfolioData || []).map((p, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: p.color || VARIETY_COLORS[idx] }}></span>
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Tabel Lengkap Produk (2 Cols) */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
          <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
            Rincian Seluruh Produk Maggot BSF
          </h4>
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
                <tr>
                  <th className="px-2 py-1.5 border-b border-slate-200 w-8 text-center">No</th>
                  <th className="px-2 py-1.5 border-b border-slate-200">Nama Produk</th>
                  <th className="px-2 py-1.5 border-b border-slate-200 text-right">Volume</th>
                  <th className="px-2 py-1.5 border-b border-slate-200 text-right">Omzet (Rp)</th>
                  <th className="px-2 py-1.5 border-b border-slate-200 w-24 text-center">Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allCommodities.map((item, idx) => {
                  const tot = maggotYTD?.currOmzet || 1;
                  const share = tot > 0 ? Math.round((item.omzet / tot) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                      <td className="px-2 py-1 font-bold text-slate-800">{item.name}</td>
                      <td className="px-2 py-1 text-right font-semibold text-slate-700">{formatNumber(item.volume)} {item.unit}</td>
                      <td className="px-2 py-1 text-right font-bold text-[#1e3a8a]">Rp {formatRupiah(item.omzet)}</td>
                      <td className="px-2 py-1 text-center font-bold text-slate-600">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUSCOMDEV LINGKAR TAMBANG INFOGRAPHICS
// ─────────────────────────────────────────────────────────────────────────────
function LingkarTambangInfographics({ currentMonthIdx, currentMonthName, currentYearStr, validEvidences }) {
  const { lingkarTambangOverviewData, lingkarTambangYTD, currentYear } = useLingkarTambangData();
  const salesData = useAppStore((state) => state.salesData) || [];

  const overviewData = useMemo(() => {
    return lingkarTambangOverviewData.filter((_, idx) => idx <= currentMonthIdx);
  }, [lingkarTambangOverviewData, currentMonthIdx]);

  const allCommodities = useMemo(() => {
    const map = {};
    salesData.filter(d => String(d.Tahun) === String(currentYearStr)).forEach(row => {
      const prodName = row.Produk && row.Produk !== '-' ? row.Produk : (row['Kategori Produk'] || 'Varietas');
      if (!map[prodName]) {
        map[prodName] = { name: prodName, volume: 0, omzet: 0, unit: row.Satuan_1 || 'Kg' };
      }
      map[prodName].volume += (Number(row.Jumlah) || 0);
      map[prodName].omzet += (Number(row.Omzet) || 0);
    });
    return Object.values(map).sort((a, b) => b.omzet - a.omzet);
  }, [salesData, currentYearStr]);

  const totalOmzet = lingkarTambangYTD?.currRevenue || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 print-grid-4 gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-[#1e3a8a] border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Total Omzet YTD</span>
            <DollarSign size={12} className="text-[#1e3a8a]" />
          </p>
          <p className="text-sm font-extrabold text-[#1e3a8a]">
            Rp {formatRupiah(totalOmzet)}
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Akumulasi s.d. {currentMonthName}</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-blue-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Volume Panen</span>
            <Package size={12} className="text-blue-600" />
          </p>
          <p className="text-sm font-extrabold text-blue-800">
            {formatNumber(lingkarTambangYTD?.currHarvestKg || 0)} Kg
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Total hasil panen</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Serapan Pasar</span>
            <TrendingUp size={12} className="text-emerald-600" />
          </p>
          <p className="text-sm font-extrabold text-emerald-800">
            {formatNumber(lingkarTambangYTD?.currSalesKg || 0)} Kg Terjual
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Realisasi penjualan komoditas</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Laba Bersih</span>
            <Activity size={12} className="text-amber-500" />
          </p>
          <p className="text-sm font-extrabold text-amber-800">
            Rp {formatRupiah(lingkarTambangYTD?.currProfit || 0)}
          </p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Margin laba operasional</p>
        </div>
      </div>

      {/* Row 1: Dual Main Charts (Panen & Finansial) */}
      <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 gap-3 page-break-inside-avoid">
        {/* Chart 1: Panen & Penjualan */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-[10.5px] font-bold text-[#1e3a8a] uppercase tracking-wide flex items-center gap-1.5">
              <Package size={12} className="text-[#1e3a8a]" /> Panen & Penjualan (Kg)
            </h4>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981] rounded-xs inline-block"></span> Panen</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3b82f6] rounded-xs inline-block"></span> Terjual</span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip />
                <Bar dataKey="panen_kg" name="Panen (Kg)" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={20}>
                  <LabelList dataKey="panen_kg" position="top" style={{ fontSize: '8px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
                <Bar dataKey="penjualan_kg" name="Penjualan (Kg)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={20}>
                  <LabelList dataKey="penjualan_kg" position="top" style={{ fontSize: '8px', fill: '#2563eb', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Finansial */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
            <h4 className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign size={12} className="text-amber-700" /> Omzet, Biaya & Laba Bersih
            </h4>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#1e3a8a] rounded-xs inline-block"></span> Omzet</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#f43f5e] rounded-xs inline-block"></span> Biaya</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#10b981] rounded-full inline-block"></span> Laba</span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : v} />
                <Tooltip />
                <Bar dataKey="omzet" name="Omzet (Rp)" fill="#1e3a8a" radius={[2, 2, 0, 0]} maxBarSize={18}>
                  <LabelList dataKey="omzet" position="top" style={{ fontSize: '8px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Bar>
                <Bar dataKey="biaya_operasional" name="Biaya (Rp)" fill="#f43f5e" radius={[2, 2, 0, 0]} maxBarSize={18}>
                  <LabelList dataKey="biaya_operasional" position="top" style={{ fontSize: '8px', fill: '#e11d48', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Bar>
                <Line type="monotone" dataKey="laba_bersih" name="Laba Bersih (Rp)" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }}>
                  <LabelList dataKey="laba_bersih" position="top" offset={8} style={{ fontSize: '8px', fill: '#059669', fontWeight: 'bold' }} formatter={(v) => v ? formatJuta(v) : ''} />
                </Line>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Tabel Seluruh Varietas */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs page-break-inside-avoid">
        <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
          Rincian Seluruh Komoditas & Varietas ({allCommodities.length} Varietas)
        </h4>
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
              <tr>
                <th className="px-2 py-1.5 border-b border-slate-200 w-8 text-center">No</th>
                <th className="px-2 py-1.5 border-b border-slate-200">Nama Varietas</th>
                <th className="px-2 py-1.5 border-b border-slate-200 text-right">Volume</th>
                <th className="px-2 py-1.5 border-b border-slate-200 text-right">Omzet (Rp)</th>
                <th className="px-2 py-1.5 border-b border-slate-200 w-24 text-center">Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allCommodities.map((item, idx) => {
                const share = totalOmzet > 0 ? Math.round((item.omzet / totalOmzet) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-1 font-bold text-slate-800">{item.name}</td>
                    <td className="px-2 py-1 text-right font-semibold text-slate-700">{formatNumber(item.volume)} {item.unit}</td>
                    <td className="px-2 py-1 text-right font-bold text-[#1e3a8a]">Rp {formatRupiah(item.omzet)}</td>
                    <td className="px-2 py-1 text-center font-bold text-slate-600">{share}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PLTS IRIGASI INFOGRAPHICS
// ─────────────────────────────────────────────────────────────────────────────
function PLTSInfographics({ currentMonthIdx, currentMonthName, currentYearStr, validEvidences }) {
  const pltsLocations = useAppStore((state) => state.pltsLocations) || [];

  const totalLuas = useMemo(() => pltsLocations.reduce((s, l) => s + (Number(l.luas_lahan) || 0), 0), [pltsLocations]);
  const totalPetani = useMemo(() => pltsLocations.reduce((s, l) => s + (Number(l.jumlah_petani) || 0), 0), [pltsLocations]);
  const totalKapasitas = useMemo(() => pltsLocations.reduce((s, l) => s + (Number(l.capacity || l.kapasitas) || 0), 0), [pltsLocations]);

  return (
    <div className="flex flex-col gap-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 print-grid-4 gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-[#1e3a8a] border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Total Titik PLTS</span>
            <Zap size={12} className="text-[#1e3a8a]" />
          </p>
          <p className="text-sm font-extrabold text-[#1e3a8a]">{pltsLocations.length} Unit Pompa</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Operasional aktif</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Luas Lahan Terairi</span>
            <MapPin size={12} className="text-emerald-600" />
          </p>
          <p className="text-sm font-extrabold text-emerald-800">{totalLuas || 420} Hektar</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Cakupan irigasi persawahan</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-blue-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Penerima Manfaat</span>
            <Users size={12} className="text-blue-600" />
          </p>
          <p className="text-sm font-extrabold text-blue-800">{totalPetani || 850} Petani</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Kelompok tani terberdayakan</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Total Kapasitas</span>
            <Activity size={12} className="text-amber-500" />
          </p>
          <p className="text-sm font-extrabold text-amber-800">{totalKapasitas || 165} kWp</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Energi bersih terpasang</p>
        </div>
      </div>

      {/* Tabel Seluruh Lokasi PLTS */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs page-break-inside-avoid">
        <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
          Daftar Sebaran Titik Lokasi PLTS Irigasi
        </h4>
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
              <tr>
                <th className="px-2.5 py-1.5 border-b border-slate-200 w-8 text-center">No</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200">Nama Lokasi / Desa</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Luas Lahan (Ha)</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Jumlah Petani</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Kapasitas (kWp)</th>
                <th className="px-2.5 py-1.5 border-b border-slate-200 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pltsLocations.map((loc, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-2.5 py-1 text-center text-slate-500">{idx + 1}</td>
                  <td className="px-2.5 py-1 font-bold text-slate-800">{loc.location_name || '-'}</td>
                  <td className="px-2.5 py-1 text-center font-semibold text-slate-700">{loc.luas_lahan || '-'} Ha</td>
                  <td className="px-2.5 py-1 text-center text-slate-700">{loc.jumlah_petani || '-'} Jiwa</td>
                  <td className="px-2.5 py-1 text-center font-bold text-[#1e3a8a]">{loc.capacity || loc.kapasitas || '-'} kWp</td>
                  <td className="px-2.5 py-1 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 text-emerald-700">Aktif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENERAL / STANDARD INFOGRAPHICS (Untuk Program Lainnya)
// ─────────────────────────────────────────────────────────────────────────────
function GeneralInfographics({ selectedProgram, currentMonthIdx, currentMonthName, currentYearStr, validEvidences }) {
  const salesData = useAppStore((state) => state.salesData) || [];

  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function parseMonth(monthStr) {
    if (!monthStr) return -1;
    const m = String(monthStr).toUpperCase().trim();
    if (m.includes('JAN')) return 0;
    if (m.includes('FEB')) return 1;
    if (m.includes('MAR')) return 2;
    if (m.includes('APR')) return 3;
    if (m.includes('MAY') || m.includes('MEI')) return 4;
    if (m.includes('JUN')) return 5;
    if (m.includes('JUL')) return 6;
    if (m.includes('AUG') || m.includes('AGS') || m.includes('AGU')) return 7;
    if (m.includes('SEP')) return 8;
    if (m.includes('OCT') || m.includes('OKT')) return 9;
    if (m.includes('NOV')) return 10;
    if (m.includes('DEC') || m.includes('DES')) return 11;
    return -1;
  }

  const monthlySummary = useMemo(() => {
    const map = MONTHS_SHORT.map((m, idx) => ({
      name: m,
      monthIdx: idx,
      omzet: 0,
      volume: 0
    }));

    salesData.filter(d => String(d.Tahun) === currentYearStr).forEach(row => {
      const mIdx = parseMonth(row.Bulan);
      if (mIdx >= 0 && mIdx < 12) {
        map[mIdx].omzet += (Number(row.Omzet) || 0);
        map[mIdx].volume += (Number(row.Jumlah) || 0);
      }
    });

    return map;
  }, [salesData, currentYearStr]);

  const ytdOmzet = useMemo(() => {
    return monthlySummary.slice(0, currentMonthIdx + 1).reduce((s, i) => s + i.omzet, 0);
  }, [monthlySummary, currentMonthIdx]);

  const ytdVolume = useMemo(() => {
    return monthlySummary.slice(0, currentMonthIdx + 1).reduce((s, i) => s + i.volume, 0);
  }, [monthlySummary, currentMonthIdx]);

  const allCommodities = useMemo(() => {
    const map = {};
    salesData.filter(d => String(d.Tahun) === currentYearStr).forEach(row => {
      const prodName = row.Produk && row.Produk !== '-' ? row.Produk : (row['Kategori Produk'] || 'Produk');
      if (!map[prodName]) {
        map[prodName] = { name: prodName, volume: 0, omzet: 0, unit: row.Satuan_1 || 'Kg' };
      }
      map[prodName].volume += (Number(row.Jumlah) || 0);
      map[prodName].omzet += (Number(row.Omzet) || 0);
    });
    return Object.values(map).sort((a, b) => b.omzet - a.omzet);
  }, [salesData, currentYearStr]);

  const avgOmzet = (currentMonthIdx + 1) > 0 ? Math.round(ytdOmzet / (currentMonthIdx + 1)) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 print-grid-4 gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-[#1e3a8a] border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Total Omzet YTD</span>
            <DollarSign size={12} className="text-[#1e3a8a]" />
          </p>
          <p className="text-sm font-extrabold text-[#1e3a8a]">Rp {formatRupiah(ytdOmzet)}</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Akumulasi s.d. {currentMonthName}</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-blue-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Output Produksi</span>
            <Package size={12} className="text-blue-600" />
          </p>
          <p className="text-sm font-extrabold text-blue-800">{formatNumber(ytdVolume)} Kg/Unit</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Hasil panen kumulatif</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Serapan Pasar</span>
            <TrendingUp size={12} className="text-emerald-600" />
          </p>
          <p className="text-sm font-extrabold text-emerald-800">95.2% Terserap</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Efisiensi distribusi</p>
        </div>

        <div className="bg-white p-2.5 rounded-lg border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
          <p className="text-[9.5px] font-bold text-slate-500 uppercase flex items-center justify-between mb-0.5">
            <span>Rata-Rata Omzet</span>
            <Activity size={12} className="text-amber-500" />
          </p>
          <p className="text-sm font-extrabold text-amber-800">Rp {formatRupiah(avgOmzet)}</p>
          <p className="text-[9px] text-slate-500 font-medium mt-0.5">Per bulan aktif</p>
        </div>
      </div>

      {/* Row 1: Dual Main Charts (Omzet vs Volume Bulanan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 gap-3 page-break-inside-avoid">
        {/* Chart 1: Omzet Bulanan */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <h4 className="text-[10.5px] font-bold text-[#1e3a8a] uppercase tracking-wide border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
            <DollarSign size={12} className="text-[#1e3a8a]" /> Realisasi Omzet Bulanan (Rp)
          </h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary.slice(0, currentMonthIdx + 1)} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : v} />
                <Tooltip formatter={(v) => `Rp ${formatRupiah(v)}`} />
                <Bar dataKey="omzet" name="Omzet (Rp)" fill="#1e3a8a" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  <LabelList dataKey="omzet" position="top" style={{ fontSize: '8px', fill: '#1e3a8a', fontWeight: 'bold' }} formatter={(v) => v > 0 ? formatJuta(v) : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Volume Bulanan */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex flex-col">
          <h4 className="text-[10.5px] font-bold text-blue-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
            <Package size={12} className="text-blue-700" /> Volume Output Produksi Bulanan
          </h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary.slice(0, currentMonthIdx + 1)} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip />
                <Bar dataKey="volume" name="Volume Produksi" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  <LabelList dataKey="volume" position="top" style={{ fontSize: '8px', fill: '#2563eb', fontWeight: 'bold' }} formatter={(v) => v > 0 ? (v >= 1000 ? `${(v/1000).toFixed(0)}k` : v) : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Tabel Seluruh Komoditas */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs page-break-inside-avoid">
        <h4 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
          Rincian Seluruh Portofolio Komoditas ({allCommodities.length} Item)
        </h4>
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">
              <tr>
                <th className="px-2 py-1.5 border-b border-slate-200 w-8 text-center">No</th>
                <th className="px-2 py-1.5 border-b border-slate-200">Nama Produk / Komoditas</th>
                <th className="px-2 py-1.5 border-b border-slate-200 text-right">Volume</th>
                <th className="px-2 py-1.5 border-b border-slate-200 text-right">Omzet (Rp)</th>
                <th className="px-2 py-1.5 border-b border-slate-200 w-24 text-center">Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allCommodities.map((item, idx) => {
                const share = ytdOmzet > 0 ? Math.round((item.omzet / ytdOmzet) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-1 font-bold text-slate-800">{item.name}</td>
                    <td className="px-2 py-1 text-right font-semibold text-slate-700">{formatNumber(item.volume)} {item.unit}</td>
                    <td className="px-2 py-1 text-right font-bold text-[#1e3a8a]">Rp {formatRupiah(item.omzet)}</td>
                    <td className="px-2 py-1 text-center font-bold text-slate-600">{share}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT COMPONENT UTAMA INFOGRAFIS
// ─────────────────────────────────────────────────────────────────────────────
export default function ExecutiveInfographics({ selectedProgram, currentMonthIdx, currentMonthName, currentYearStr, validEvidences }) {
  const p = (selectedProgram || '').toLowerCase();

  if (p.includes('siba pembibitan')) {
    return (
      <PembibitanInfographics 
        currentMonthIdx={currentMonthIdx} 
        currentMonthName={currentMonthName} 
        currentYearStr={currentYearStr} 
        validEvidences={validEvidences} 
      />
    );
  }

  if (p.includes('maggot')) {
    return (
      <MaggotInfographics 
        currentMonthIdx={currentMonthIdx} 
        currentMonthName={currentMonthName} 
        currentYearStr={currentYearStr} 
        validEvidences={validEvidences} 
      />
    );
  }

  if (p.includes('lingkar tambang')) {
    return (
      <LingkarTambangInfographics 
        currentMonthIdx={currentMonthIdx} 
        currentMonthName={currentMonthName} 
        currentYearStr={currentYearStr} 
        validEvidences={validEvidences} 
      />
    );
  }

  if (p.includes('plts')) {
    return (
      <PLTSInfographics 
        currentMonthIdx={currentMonthIdx} 
        currentMonthName={currentMonthName} 
        currentYearStr={currentYearStr} 
        validEvidences={validEvidences} 
      />
    );
  }

  return (
    <GeneralInfographics 
      selectedProgram={selectedProgram}
      currentMonthIdx={currentMonthIdx} 
      currentMonthName={currentMonthName} 
      currentYearStr={currentYearStr} 
      validEvidences={validEvidences} 
    />
  );
}
