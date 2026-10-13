/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - SERVICE UPLOAD EVIDEN SCD REPORT PT BUKIT ASAM TBK
 * ==============================================================================
 * Skrip ini berfungsi sebagai backend webhook untuk mengunggah foto dokumentasi &
 * scan presensi langsung ke Google Drive terpusat secara otomatis dan terorganisir.
 *
 * FITUR UTAMA:
 * 1. Otomatis membuat folder utama "SCD_Report_Evidence" di Google Drive (tidak butuh Folder ID manual).
 * 2. Mengorganisir struktur folder otomatis: [Program] / [Tahun] / [Bulan].
 * 3. Mengatur hak akses file otomatis ke "Anyone with link can view" agar gambar bisa dibuka publik.
 * 4. Mendukung format Foto (JPG, PNG, WebP) maupun Dokumen PDF.
 * ==============================================================================
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ success: false, error: "Tidak ada data yang dikirim." });
    }

    // 1. Parse data JSON dari aplikasi web
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return responseJSON({ success: false, error: "Format payload bukan JSON valid: " + parseErr.message });
    }

    var fileName = data.fileName || ("eviden_" + new Date().getTime() + ".jpg");
    var mimeType = data.mimeType || "image/jpeg";
    var base64Data = data.base64;
    var program = (data.program || "Umum").trim();
    var year = (data.year || new Date().getFullYear().toString()).trim();
    var month = (data.month || "Lainnya").trim();

    if (!base64Data) {
      return responseJSON({ success: false, error: "Data base64 file tidak ditemukan." });
    }

    // 2. Dapatkan atau buat Folder Induk "SCD_Report_Evidence" di Root Google Drive
    var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), "SCD_Report_Evidence");

    // 3. Dapatkan atau buat Subfolder Program (misal: "SIBA PEMBIBITAN", "PLTS IRIGASI")
    var programFolder = getOrCreateFolder(rootFolder, program);

    // 4. Dapatkan atau buat Subfolder Tahun (misal: "2026")
    var yearFolder = getOrCreateFolder(programFolder, year);

    // 5. Dapatkan atau buat Subfolder Bulan (misal: "Oktober")
    var targetFolder = getOrCreateFolder(yearFolder, month);

    // 6. Konversi base64 string menjadi file Blob
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);

    // 7. Simpan file ke folder Google Drive
    var file = targetFolder.createFile(blob);

    // 8. Berikan izin akses publik (siapa pun yang memiliki link dapat melihat)
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (permErr) {
      // Abaikan jika akun workspace organisasi memiliki restriksi domain tertentu
      Logger.log("Permission warning: " + permErr.toString());
    }

    var fileUrl = file.getUrl();
    var fileId = file.getId();

    // 9. Berikan respons sukses ke aplikasi web
    return responseJSON({
      success: true,
      fileUrl: fileUrl,
      fileId: fileId,
      fileName: fileName,
      folderPath: "SCD_Report_Evidence/" + program + "/" + year + "/" + month
    });

  } catch (error) {
    return responseJSON({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Handle GET request untuk cek status webhook langsung dari browser
 */
function doGet(e) {
  return responseJSON({
    status: "online",
    message: "Google Apps Script Webhook SCD Report PT Bukit Asam is Active & Ready!",
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper untuk mencari folder berdasarkan nama, jika belum ada maka otomatis dibuat
 */
function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * Helper response JSON
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
