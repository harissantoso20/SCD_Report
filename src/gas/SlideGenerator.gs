function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { period, programs, reportStatement, logoUrl } = data;
    
    // Create new presentation
    const presentationTitle = `Laporan SCD - ${period}`;
    const presentation = SlidesApp.create(presentationTitle);
    const slides = presentation.getSlides();
    const ptbaLogoUrl = logoUrl || 'https://upload.wikimedia.org/wikipedia/id/d/d7/Bukit_Asam.png';
    
    // Default page size for Google Slides is usually 960x540 (16:9)
    const pageWidth = presentation.getPageWidth();
    const pageHeight = presentation.getPageHeight();
    
    // Helper to add Corporate Header & Logo
    const addCorporateHeader = (slide, title) => {
      // Add top blue bar (full width)
      slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, pageWidth, 60)
           .getFill().setSolidFill('#1e3a8a');
      
      // Title Text
      slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 20, 10, pageWidth - 150, 40)
           .getText().setText(title)
           .getTextStyle().setBold(true).setFontSize(22).setForegroundColor('#ffffff').setFontFamily('Arial');
      
      // Add Logo to top right
      try {
        slide.insertImage(ptbaLogoUrl, pageWidth - 120, 10, 100, 40);
      } catch(e){}
    };
    
    // --- Slide 1: Cover ---
    const coverSlide = slides[0];
    coverSlide.getShapes()[0].getText().setText(`Laporan Eksekutif SCD\nPeriode ${period}`)
      .getTextStyle().setForegroundColor('#1e3a8a').setBold(true).setFontFamily('Arial');
    coverSlide.getShapes()[1].getText().setText('PT Bukit Asam (Persero) Tbk\nGenerated automatically via System')
      .getTextStyle().setForegroundColor('#555555').setFontFamily('Arial');
    try {
      coverSlide.insertImage(ptbaLogoUrl, (pageWidth/2) - 50, pageHeight - 80, 100, 40);
    } catch(e){}
    
    // --- Slide 2: Report Statement ---
    const rsSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    addCorporateHeader(rsSlide, "Executive Summary");
    rsSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 40, 80, pageWidth - 80, pageHeight - 100)
            .getText().setText(reportStatement)
            .getTextStyle().setFontSize(14).setForegroundColor('#333333');
            
    // --- Slide 3: TOC ---
    const tocSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    addCorporateHeader(tocSlide, "Daftar Program Pemberdayaan");
    let tocText = "Program yang Berjalan:\n\n" + programs.map((p, idx) => `${idx + 1}. ${p.name}`).join('\n');
    tocSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 40, 80, pageWidth - 80, pageHeight - 100)
            .getText().setText(tocText)
            .getTextStyle().setFontSize(16).setBold(true).setForegroundColor('#1e3a8a');
            
    // Iterate over programs
    programs.forEach(prog => {
      // --- Slide A: Ringkasan Program (Corporate Table) ---
      const slideA = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
      addCorporateHeader(slideA, `${prog.name} - Ringkasan Program`);
      
      const table = slideA.insertTable(6, 4, 30, 80, pageWidth - 60, pageHeight - 120);
      
      const formatHeader = (cell, text) => {
        cell.getText().setText(text);
        cell.getText().getTextStyle().setBold(true).setForegroundColor('#ffffff').setFontSize(12).setFontFamily('Arial');
        cell.getFill().setSolidFill('#25326a');
        cell.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
      };
      const formatData = (cell, text, isZebra) => {
        cell.getText().setText(text || '-');
        cell.getText().getTextStyle().setFontSize(11).setForegroundColor('#333333').setFontFamily('Arial');
        cell.getFill().setSolidFill(isZebra ? '#eef2f6' : '#ffffff');
      };

      formatHeader(table.getCell(0, 0), "Lokasi");
      formatHeader(table.getCell(0, 1), "Objektif");
      formatHeader(table.getCell(0, 2), "KPI");
      formatHeader(table.getCell(0, 3), "Anggaran");
      
      formatData(table.getCell(1, 0), prog.location, false);
      formatData(table.getCell(1, 1), prog.objective, false);
      formatData(table.getCell(1, 2), prog.kpi, false);
      formatData(table.getCell(1, 3), prog.budget, false);
      
      formatHeader(table.getCell(2, 0), "Penerima Manfaat");
      formatHeader(table.getCell(2, 1), "TPB/SDGs");
      formatHeader(table.getCell(2, 2), "Realisasi Biaya");
      
      formatData(table.getCell(3, 0), prog.beneficiaries, true);
      formatData(table.getCell(3, 1), prog.tpb, true);
      formatData(table.getCell(3, 2), prog.realizationCost, true);
      
      formatHeader(table.getCell(4, 0), "Progress Bulan Ini");
      formatHeader(table.getCell(4, 2), "Rencana Kerja Bulan Depan");
      
      formatData(table.getCell(5, 0), prog.progress, false);
      formatData(table.getCell(5, 2), prog.plan, false);

      // Merge columns 2 & 3 for specific rows if needed (Skipping for robust layout)

      // --- Slide B: Insight Analitik & Grafik ---
      const slideB = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
      addCorporateHeader(slideB, `${prog.name} - Insight Analitik`);
      
      // Insight Text Box
      slideB.insertShape(SlidesApp.ShapeType.TEXT_BOX, 40, 80, (pageWidth / 2) - 60, pageHeight - 120)
            .getText().setText(prog.insight || "Tidak ada insight.")
            .getTextStyle().setFontSize(14).setForegroundColor('#333333').setFontFamily('Arial');
            
      // Chart Image from QuickChart URL
      if (prog.chartUrl) {
        try {
          slideB.insertImage(prog.chartUrl, (pageWidth / 2), 80, (pageWidth / 2) - 40, 300);
        } catch(e){
          slideB.insertShape(SlidesApp.ShapeType.TEXT_BOX, (pageWidth / 2), 80, 320, 50)
            .getText().setText("Grafik tidak tersedia.").getTextStyle().setForegroundColor('#999999');
        }
      }
      
      // --- Slide C: Dokumentasi (Eviden) ---
      if (prog.evidence && prog.evidence.length > 0) {
        const slideC = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
        addCorporateHeader(slideC, `${prog.name} - Dokumentasi`);
        
        let x = 40;
        let y = 80;
        const imgWidth = (pageWidth / 2) - 60;
        const imgHeight = (pageHeight / 2) - 80;
        
        prog.evidence.slice(0, 4).forEach((imgUrl, i) => {
           try {
             slideC.insertImage(imgUrl, x, y, imgWidth, imgHeight);
             x += imgWidth + 20;
             if (i === 1) {
                x = 40;
                y += imgHeight + 20;
             }
           } catch(e) {}
        });
      }
    });
    
    // Set permissions so anyone with the link can view
    const file = DriveApp.getFileById(presentation.getId());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: presentation.getUrl(),
      id: presentation.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Ensure CORS headers for preflight OPTIONS request
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
