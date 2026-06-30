import pptxgen from "pptxgenjs";
import { programService } from "./programService";
import { progressService } from "./progressService";
import { salesService } from "./salesService";
import { evidenceService } from "./evidenceService";
import { getFuzzyKeyword } from "../utils/programUtils";

const addHeader = (slide) => {
  // Adding placeholders for logos
  slide.addText('Danantara\nIndonesia', { x: 0.5, y: 0.2, w: 2, h: 0.5, fontSize: 14, bold: true, color: '000000', align: 'left' });
  slide.addText('BukitAsam', { x: 7.5, y: 0.2, w: 2, h: 0.5, fontSize: 16, bold: true, color: 'd92a2a', align: 'right' });
};

export const exportDashboardPresentation = async (globalDate) => {
  const targetYear = globalDate.split('-')[0];
  const currentMonthStr = globalDate.split('-')[1];
  const targetMonthIdx = parseInt(currentMonthStr, 10) - 1;
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const currentMonthName = monthNames[targetMonthIdx];
  const nextMonthName = targetMonthIdx < 11 ? monthNames[targetMonthIdx + 1] : "Januari";
  
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Fetch all programs
  const programList = await programService.fetchProgramList();

  for (const program of programList) {
    const fuzzyKeyword = getFuzzyKeyword(program);
    
    // Fetch Data for the program
    const context = await programService.fetchProgramContext(program);
    const progressList = await progressService.fetchMonthlyProgress(fuzzyKeyword, targetYear, monthNames, targetMonthIdx);
    const progress = progressList && progressList.length > 0 ? progressList[0] : null;
    const { salesData } = await salesService.fetchSalesData(fuzzyKeyword, program, targetYear);
    const evidence = await evidenceService.fetchEvidenceData(fuzzyKeyword, targetYear, monthNames);

    // --- Template 1: Table Slide ---
    const slideTable = pptx.addSlide();
    addHeader(slideTable);
    
    // Title
    slideTable.addText(`${program}${context?.location ? ` - ${context.location}` : ''}`, { x: 0, y: 0.3, w: '100%', align: 'center', fontSize: 24, bold: true, color: '000000' });
    
    const tableRows = [];
    tableRows.push([
      { text: 'Lokasi', options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', fontSize: 10 } },
      { text: 'Objektif', options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', fontSize: 10 } },
      { text: 'KPI', options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', fontSize: 10 } },
      { text: `Anggaran ${targetYear} (Rp)`, options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', fontSize: 10 } }
    ]);
    tableRows.push([
      { text: context?.location || '-', options: { fill: 'e2e8f0', align: 'center', fontSize: 9 } },
      { text: context?.objective || '-', options: { fill: 'e2e8f0', fontSize: 9 } },
      { text: context?.kpi || '-', options: { fill: 'e2e8f0', fontSize: 9 } },
      { text: context?.budget_text || '-', options: { fill: 'e2e8f0', align: 'center', fontSize: 9 } }
    ]);
    tableRows.push([
      { text: 'Penerima Manfaat', options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', fontSize: 10 } },
      { text: 'TPB/SDGs', options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', fontSize: 10 } },
      { text: `Realisasi Biaya ${targetYear} (Rp)`, options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', colspan: 2, fontSize: 10 } }
    ]);
    tableRows.push([
      { text: context?.beneficiaries || '-', options: { fill: 'e2e8f0', align: 'center', fontSize: 9 } },
      { text: context?.tpb || '-', options: { fill: 'e2e8f0', align: 'center', fontSize: 9 } },
      { text: progress?.Realisasi_Biaya_Formatted || 'Rp.0,-', options: { fill: 'e2e8f0', align: 'center', fontSize: 9, colspan: 2 } }
    ]);
    
    tableRows.push([
      { text: `Progress ${currentMonthName} ${targetYear}`, options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', colspan: 2, fontSize: 10 } },
      { text: `Rencana Kerja ${nextMonthName} ${targetYear}`, options: { fill: '1e3a8a', color: 'ffffff', bold: true, align: 'center', colspan: 2, fontSize: 10 } }
    ]);
    tableRows.push([
      { text: progress?.Realisasi || '-', options: { fill: 'e2e8f0', fontSize: 9, colspan: 2 } },
      { text: progress?.Rencana_Tindak_Lanjut || '-', options: { fill: 'e2e8f0', fontSize: 9, colspan: 2 } }
    ]);

    slideTable.addTable(tableRows, { x: 0.5, y: 1.2, w: 9, colW: [2.25, 2.25, 2.25, 2.25], margin: 0.1 });

    // --- Template 2: Chart/Image Slide (Conditional) ---
    if (salesData && salesData.length > 0) {
      const slideChart = pptx.addSlide();
      addHeader(slideChart);
      slideChart.addText(`${program}${context?.location ? ` - ${context.location}` : ''}`, { x: 0, y: 0.3, w: '100%', align: 'center', fontSize: 24, bold: true, color: '000000' });
      
      // Images (up to 4)
      for(let i=0; i<Math.min(evidence.length, 4); i++) {
        const xPositions = [0.5, 2.7, 0.5, 2.7];
        const yPositions = [1.2, 1.2, 3.4, 3.4];
        try {
          slideChart.addImage({ path: evidence[i].File_Url, x: xPositions[i], y: yPositions[i], w: 2.0, h: 2.0 });
        } catch(e) {
          console.warn("Failed to load image", evidence[i].File_Url);
        }
      }

      // Group sales data to create multi-series chart
      const uniqueMonths = [...new Set(salesData.map(s => s.Bulan))];
      let uniqueProducts = [...new Set(salesData.map(s => {
        if (s.Produk && s.Produk !== '-') return s.Produk;
        if (s['Kategori Produk'] && s['Kategori Produk'] !== '-') return s['Kategori Produk'];
        return null;
      }).filter(Boolean))];

      const chartData = [];
      
      if (uniqueProducts.length > 0) {
        uniqueProducts.forEach(product => {
          const values = uniqueMonths.map(month => {
            const row = salesData.find(s => s.Bulan === month && (s.Produk === product || s['Kategori Produk'] === product));
            return row ? (row.Omzet || 0) : 0;
          });
          // Only add series if it has some non-zero data
          if (values.some(v => v > 0)) {
            chartData.push({
              name: product,
              labels: uniqueMonths.map(m => m.substring(0,3)),
              values: values
            });
          }
        });
      }
      
      // Fallback if no specific products or all were zero
      if (chartData.length === 0) {
        const values = uniqueMonths.map(month => {
          const rows = salesData.filter(s => s.Bulan === month);
          return rows.reduce((sum, r) => sum + (r.Omzet || 0), 0);
        });
        chartData.push({
          name: 'Total Omzet',
          labels: uniqueMonths.map(m => m.substring(0,3)),
          values: values
        });
      }

      slideChart.addChart(pptx.ChartType.line, chartData, { 
        x: 4.8, y: 1.2, w: 4.8, h: 2.6, 
        showLegend: true, 
        legendPos: 'b',
        showTitle: true, 
        title: 'Tren Omzet Produk (Rp)',
        lineDataSymbol: 'circle',
        lineSmooth: true,
        valAxisLabelFormatCode: '#,##0,, "Jt"' // Format as millions
      });
      
      // Add text for Totals
      let totalOmzet = salesData.reduce((acc, curr) => acc + (curr.Omzet || 0), 0);
      slideChart.addText(`Total Periode ${targetYear}`, { x: 5.0, y: 4.0, fontSize: 12, bold: true, color: '000000' });
      slideChart.addText(`Omzet: Rp ${totalOmzet.toLocaleString('id-ID')}`, { x: 5.0, y: 4.3, fontSize: 11, color: '333333' });
      
      // S.D Target Month
      let ytdOmzet = salesData.slice(0, targetMonthIdx + 1).reduce((acc, curr) => acc + (curr.Omzet || 0), 0);
      slideChart.addShape(pptx.ShapeType.rect, { x: 5.0, y: 4.6, w: 4.5, h: 0.8, fill: '5bc0de' });
      slideChart.addText(`S.D ${currentMonthName.toUpperCase()} ${targetYear}`, { x: 5.1, y: 4.7, fontSize: 10, bold: true, color: '000000' });
      slideChart.addText(`Omzet: Rp ${ytdOmzet.toLocaleString('id-ID')}`, { x: 5.1, y: 5.0, fontSize: 10, bold: true, color: '000000' });
    }
  }

  pptx.writeFile({ fileName: `Laporan_SCD_${currentMonthName}_${targetYear}.pptx` });
};
