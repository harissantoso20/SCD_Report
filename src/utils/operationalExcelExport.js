import * as XLSX from 'xlsx';

const INDO_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function parseMonthIdx(monthStr) {
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

export function exportOperationalReportXlsx({
  programName,
  currentMonthName,
  currentMonthStr,
  currentYearStr,
  monthlyProgress,
  salesData = [],
  beneficiariesList = [],
  pltsLocations = [],
  programDescription = ''
}) {
  const currentMonthIdx = Number(currentMonthStr) - 1;
  const currentMonthLabel = INDO_MONTHS[currentMonthIdx] || currentMonthName || 'Bulan Berjalan';

  // Filter sales for the selected year
  const currYearRows = salesData.filter(d => String(d.Tahun) === String(currentYearStr));
  
  // Calculate Monthly Metrics
  let monthOmzet = 0;
  let monthVolume = 0;
  let ytdOmzet = 0;
  let ytdVolume = 0;

  const monthlyBreakdown = MONTHS_SHORT.map((m, idx) => ({
    no: idx + 1,
    bulan: INDO_MONTHS[idx],
    omzet: 0,
    volume: 0,
    itemsCount: 0
  }));

  currYearRows.forEach(row => {
    const mIdx = parseMonthIdx(row.Bulan);
    const omzet = Number(row.Omzet) || 0;
    const vol = Number(row.Jumlah) || 0;

    if (mIdx >= 0 && mIdx < 12) {
      monthlyBreakdown[mIdx].omzet += omzet;
      monthlyBreakdown[mIdx].volume += vol;
      monthlyBreakdown[mIdx].itemsCount += 1;

      if (mIdx <= currentMonthIdx) {
        ytdOmzet += omzet;
        ytdVolume += vol;
      }
      if (mIdx === currentMonthIdx) {
        monthOmzet += omzet;
        monthVolume += vol;
      }
    }
  });

  const wb = XLSX.utils.book_new();

  // =========================================================================
  // SHEET 1: RINGKASAN EKSEKUTIF & OPERASIONAL
  // =========================================================================
  const summaryRows = [
    { "KATEGORI / PARAMETER": "LAPORAN OPERASIONAL PROGRAM TJSL", "NILAI / KETERANGAN": "PT BUKIT ASAM (PERSERO) TBK." },
    { "KATEGORI / PARAMETER": "Nama Program", "NILAI / KETERANGAN": programName || "-" },
    { "KATEGORI / PARAMETER": "Periode Laporan", "NILAI / KETERANGAN": `${currentMonthLabel} ${currentYearStr}` },
    { "KATEGORI / PARAMETER": "Tanggal Unduh / Export", "NILAI / KETERANGAN": new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { "KATEGORI / PARAMETER": "", "NILAI / KETERANGAN": "" },
    { "KATEGORI / PARAMETER": "--- INDIKATOR KINERJA FINANSIAL & PRODUKSI ---", "NILAI / KETERANGAN": "" },
    { "KATEGORI / PARAMETER": `Total Omzet Periode (${currentMonthLabel})`, "NILAI / KETERANGAN": `Rp ${new Intl.NumberFormat('id-ID').format(monthOmzet)}` },
    { "KATEGORI / PARAMETER": `Total Omzet Kumulatif YTD (${currentYearStr})`, "NILAI / KETERANGAN": `Rp ${new Intl.NumberFormat('id-ID').format(ytdOmzet)}` },
    { "KATEGORI / PARAMETER": `Total Volume / Produksi Periode (${currentMonthLabel})`, "NILAI / KETERANGAN": new Intl.NumberFormat('id-ID').format(monthVolume) },
    { "KATEGORI / PARAMETER": `Total Volume / Produksi YTD (${currentYearStr})`, "NILAI / KETERANGAN": new Intl.NumberFormat('id-ID').format(ytdVolume) },
    { "KATEGORI / PARAMETER": "Total Penerima Manfaat / Anggota", "NILAI / KETERANGAN": `${beneficiariesList.length} Orang` },
    { "KATEGORI / PARAMETER": "", "NILAI / KETERANGAN": "" },
    { "KATEGORI / PARAMETER": "--- PROGRES KEGIATAN & RENCANA KERJA ---", "NILAI / KETERANGAN": "" },
    { "KATEGORI / PARAMETER": "Realisasi Kegiatan Bulan Ini", "NILAI / KETERANGAN": monthlyProgress?.past_month_realization || "-" },
    { "KATEGORI / PARAMETER": "Rencana Kerja Bulan Berikutnya", "NILAI / KETERANGAN": monthlyProgress?.next_month_plan || "-" },
    { "KATEGORI / PARAMETER": "Penyerapan Anggaran", "NILAI / KETERANGAN": monthlyProgress?.budget_realization_text || "-" },
    { "KATEGORI / PARAMETER": "Deskripsi Program", "NILAI / KETERANGAN": programDescription || "-" }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 45 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Operasional');

  // =========================================================================
  // SHEET 2: DETAIL TRANSAKSI & PENJUALAN
  // =========================================================================
  const detailRows = currYearRows.map((r, idx) => ({
    "No": idx + 1,
    "Tahun": r.Tahun || currentYearStr,
    "Bulan": r.Bulan || "-",
    "Program": r.Program || programName,
    "Kategori Produk": r['Kategori Produk'] || "-",
    "Nama Produk / Item": r.Produk || "-",
    "Volume / Jumlah": Number(r.Jumlah) || 0,
    "Satuan": r.Satuan_1 || "Kg",
    "Harga Satuan (Rp)": Number(r['Harga Satuan']) || 0,
    "Total Omzet (Rp)": Number(r.Omzet) || 0,
    "Keterangan Operasional": r.Operasional || "-",
    "Nilai Operasional": Number(r['Value Operasional']) || 0
  }));

  const wsDetail = XLSX.utils.json_to_sheet(detailRows.length > 0 ? detailRows : [{
    "No": 1,
    "Tahun": currentYearStr,
    "Bulan": currentMonthLabel,
    "Program": programName,
    "Kategori Produk": "-",
    "Nama Produk / Item": "Belum ada transaksi operasional tercatat",
    "Volume / Jumlah": 0,
    "Satuan": "-",
    "Harga Satuan (Rp)": 0,
    "Total Omzet (Rp)": 0,
    "Keterangan Operasional": "-",
    "Nilai Operasional": 0
  }]);
  wsDetail['!cols'] = [
    { wch: 6 }, { wch: 8 }, { wch: 14 }, { wch: 25 }, 
    { wch: 20 }, { wch: 25 }, { wch: 16 }, { wch: 10 }, 
    { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Transaksi');

  // =========================================================================
  // SHEET 3: TREN BULANAN YTD
  // =========================================================================
  const wsTrend = XLSX.utils.json_to_sheet(monthlyBreakdown.map(m => ({
    "No": m.no,
    "Bulan": m.bulan,
    "Total Omzet (Rp)": m.omzet,
    "Total Volume": m.volume,
    "Jumlah Item Transaksi": m.itemsCount
  })));
  wsTrend['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsTrend, `Tren Bulanan ${currentYearStr}`);

  // =========================================================================
  // SHEET 4: PENERIMA MANFAAT / ANGGOTA (Jika ada)
  // =========================================================================
  if (beneficiariesList.length > 0) {
    const benRows = beneficiariesList.map((b, idx) => ({
      "No": idx + 1,
      "Nama Anggota / Penerima": b.nama || "-",
      "Kelompok": b.nama_kelompok || b.kelompok || "-",
      "Jabatan / Peran": b.jabatan || "Anggota",
      "Jenis Kelamin": b.jenis_kelamin || "-",
      "Usia": b.usia || "-",
      "Jumlah Tanggungan": Number(b.jumlah_tanggungan) || 0,
      "No Telepon / Kontak": b.kontak || b.no_hp || "-",
      "Alamat / Desa": b.desa || b.lokasi || b.alamat || "-"
    }));
    const wsBen = XLSX.utils.json_to_sheet(benRows);
    wsBen['!cols'] = [
      { wch: 6 }, { wch: 26 }, { wch: 22 }, { wch: 18 },
      { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(wb, wsBen, 'Penerima Manfaat');
  }

  // =========================================================================
  // SHEET 5: LOKASI & ASET (Khusus PLTS Irigasi / Lokasi Proyek)
  // =========================================================================
  if (pltsLocations.length > 0) {
    const locRows = pltsLocations.map((l, idx) => ({
      "No": idx + 1,
      "Nama Lokasi / Desa": l.desa || l.location_name || l.nama_lokasi || "-",
      "Kecamatan": l.kecamatan || "-",
      "Kabupaten": l.kabupaten || "-",
      "Luas Lahan (Ha)": Number(l.area_ha ?? l.luas_lahan) || 0,
      "Jumlah Petani": Number(l.farmers ?? l.jumlah_petani) || 0,
      "Latitude": l.latitude ?? l.lat ?? "-",
      "Longitude": l.longitude ?? l.lng ?? "-",
      "Kapasitas / Spesifikasi": l.capacity_kwp ? `${l.capacity_kwp} kWp` : (l.kapasitas || l.spesifikasi || "-")
    }));
    const wsLoc = XLSX.utils.json_to_sheet(locRows);
    wsLoc['!cols'] = [
      { wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
      { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, wsLoc, 'Titik Lokasi');
  }

  // Generate filename
  const cleanName = (programName || 'Program')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_');
  const filename = `Laporan_Operasional_${cleanName}_${currentMonthLabel}_${currentYearStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}
