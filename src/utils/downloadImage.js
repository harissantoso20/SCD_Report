/**
 * ==============================================================================
 * UTILITAS DOWNLOAD GAMBAR / EVIDEN DOKUMENTASI KE PERANGKAT (LOCAL DISK)
 * ==============================================================================
 * Mengatasi kendala browser membuka gambar di tab baru karena restriksi CORS:
 * 1. Mendukung URL Google Drive, Base64 Data URL, Blob URL, dan URL Remote.
 * 2. Mengambil blob gambar melalui endpoint CORS-friendly (Google LH3 CDN / Canvas)
 *    lalu men-trigger download menggunakan elemen <a> dengan blob URL lokal.
 * 3. Menjamin file terunduh langsung ke folder Downloads perangkat pengguna tanpa
 *    membuka tab baru (zero tab popups).
 * ==============================================================================
 */

/**
 * Konversi base64 data URL ke Blob secara synchronous
 */
function dataURLtoBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Trigger pengunduhan file dari Blob lokal ke perangkat
 */
function triggerBlobDownload(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Bersihkan elemen & revoke URL memori setelah jeda aman
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(blobUrl);
  }, 2000);
}

/**
 * Ekstraksi Google Drive File ID dari berbagai format link
 */
export function extractGDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Fallback download via HTML5 Canvas untuk gambar cross-origin yang mendukung anonymous mode
 */
function downloadViaCanvas(imgUrl, filename) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              triggerBlobDownload(blob, filename);
              resolve(true);
            } else {
              reject(new Error('Gagal mengonversi canvas ke blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(err);
    };

    img.src = imgUrl;
  });
}

/**
 * Fallback via hidden iframe ke direct download endpoint Google Drive
 * Menggunakan Content-Disposition: attachment bawaan Google Drive
 * sehingga browser otomatis menyimpan file tanpa membuka tab baru
 */
function downloadViaHiddenIframe(fileId) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve(true);
    }, 15000);
  });
}

/**
 * Fungsi utama untuk mengunduh gambar / eviden ke perangkat
 *
 * @param {string|object} src - Link gambar (GDrive, web URL, atau base64)
 * @param {string} filename - Nama file target saat disimpan (contoh: 'Eviden_Program_1.jpg')
 * @returns {Promise<boolean>}
 */
export async function downloadEvidenceImage(src, filename = 'eviden_kegiatan.jpg') {
  if (!src) return false;

  // Normalisasi input string dari berbagai struktur objek
  let rawUrl = src;
  if (typeof src === 'object') {
    rawUrl = src.url || src.preview || src.src || '';
  }
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  rawUrl = rawUrl.trim();

  // Sanitasi nama file agar valid di filesystem Windows/Mac/Linux
  let safeFilename = filename.replace(/[/\\?%*:|"<>]/g, '_');
  if (!/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(safeFilename)) {
    safeFilename += '.jpg';
  }

  // 1. Kasus Base64 Data URL (Langsung ubah ke Blob tanpa request network)
  if (rawUrl.startsWith('data:')) {
    try {
      const blob = dataURLtoBlob(rawUrl);
      triggerBlobDownload(blob, safeFilename);
      return true;
    } catch (e) {
      console.warn('Gagal decode data URL langsung, coba fallback...', e);
    }
  }

  // 2. Kasus Blob URL (Langsung trigger download)
  if (rawUrl.startsWith('blob:')) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = rawUrl;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 2000);
    return true;
  }

  // 3. Kasus Google Drive (Mempunyai fileId)
  const fileId = extractGDriveFileId(rawUrl);
  if (fileId) {
    // Daftar endpoint CORS-friendly Google yang mengirim header 'Access-Control-Allow-Origin: *'
    const corsCandidates = [
      `https://lh3.googleusercontent.com/d/${fileId}=s0`,      // Resolusi asli penuh
      `https://lh3.googleusercontent.com/d/${fileId}=w2400`,   // Resolusi tinggi
      `https://lh3.googleusercontent.com/d/${fileId}`          // Default LH3
    ];

    // Coba fetch langsung sebagai Blob
    for (const endpoint of corsCandidates) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        if (response.ok) {
          const blob = await response.blob();
          if (blob && blob.size > 0) {
            triggerBlobDownload(blob, safeFilename);
            return true;
          }
        }
      } catch {
        // Lanjutkan ke kandidat berikutnya jika gagal
      }
    }

    // Jika fetch gagal (misal dibatasi proxy), coba via HTML5 Canvas
    for (const endpoint of corsCandidates) {
      try {
        await downloadViaCanvas(endpoint, safeFilename);
        return true;
      } catch {
        // Coba kandidat berikutnya
      }
    }

    // Terakhir: Gunakan hidden iframe ke direct download endpoint Google Drive
    // Endpoint ini mengembalikan header 'Content-Disposition: attachment'
    // sehingga browser men-download file ke perangkat tanpa membuka tab baru!
    try {
      await downloadViaHiddenIframe(fileId);
      return true;
    } catch {
      // Abaikan jika iframe selesai
    }
  }

  // 4. Kasus URL Remote Umum (Non-GDrive)
  try {
    const response = await fetch(rawUrl, {
      method: 'GET',
      mode: 'cors'
    });
    if (response.ok) {
      const blob = await response.blob();
      triggerBlobDownload(blob, safeFilename);
      return true;
    }
  } catch {
    // Coba via Canvas
    try {
      await downloadViaCanvas(rawUrl, safeFilename);
      return true;
    } catch {
      // Fallback tanpa target="_blank" agar tidak membuka tab baru
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = rawUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 2000);
      return true;
    }
  }

  return false;
}

