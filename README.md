# SCD Analytics Dashboard (Sistem Pelaporan Suscomdev)

SCD Analytics Dashboard adalah aplikasi pelaporan dan analisis data berbasis web modern yang dikembangkan secara khusus untuk memudahkan pemantauan dan pengelolaan program *Sustainable Community Development* (SCD) atau *Corporate Social Responsibility* (CSR) PT Bukit Asam Tbk. 

Aplikasi ini menaungi manajemen berbagai program unggulan, termasuk Siba Pembibitan, Siba Maggot, Cahaya Tani, Suscomdev Prabumenang, Siba Itik, Siba Puyuh, Budidaya Ikan Air Tawar, hingga Siba Ecogrow.

---

## 1. Fungsi Aplikasi

Aplikasi ini berfungsi sebagai **pusat kendali informasi (Dashboard)** terpadu yang memadukan input data lapangan, visualisasi metrik performa (*Key Performance Indicators*), dan kecerdasan buatan. 

Melalui aplikasi ini, pengelola program dapat:
*   Merekam operasional bulanan (produksi, volume penjualan, omzet, harga satuan).
*   Melihat visualisasi performa secara interaktif untuk memantau keberhasilan dari target yang ditentukan.
*   Mendapatkan pembacaan naratif analitis secara otomatis terhadap ringkasan data melalui bantuan sistem Artificial Intelligence (AI).
*   Menghasilkan bahan presentasi ringkas berdasarkan kondisi data riil di lapangan.

## 2. Maksud dan Tujuan Pengembangan

*   **Digitalisasi dan Sentralisasi Data:** Mengubah proses administrasi pelaporan yang sebelumnya terpencar/manual (seperti lembaran Excel dan kertas) menjadi digital sehingga seluruh data program SCD tersentralisasi dalam satu basis data yang aman dan mudah diakses kapan saja.
*   **Monitoring Kinerja Secara Real-Time:** Memudahkan para pemangku kepentingan (stakeholder) dan tim manajemen untuk secara langsung memantau kemajuan, omzet, dan hambatan operasional setiap program binaan.
*   **Analisis Mendalam yang Mudah Dipahami:** Membantu tim lapangan dalam membaca tren finansial (misal: perbandingan volume penjualan dengan total pendapatan) melalui visualisasi grafik yang interaktif.
*   **Efisiensi Waktu Pelaporan:** Memangkas birokrasi penyusunan laporan rutin bulanan dengan adanya fitur ekspor narasi *insight* otomatis dan laporan langsung ke format presentasi (*Google Slides*).

## 3. Cara Penggunaan Aplikasi

Penggunaan aplikasi berpusat pada dua siklus utama: **Memasukkan Data** dan **Membaca Laporan (Dashboard)**.

1.  **Entri Data (Data Entry)**
    *   Buka menu/tab **Entri Data**.
    *   Pilih program binaan yang ingin dilaporkan pada panel kontrol di sisi layar.
    *   Tentukan rentang pelaporan (Pilih Bulan dan Tahun).
    *   Isi formulir tabel dinamis yang muncul (tabel akan otomatis berubah wujud sesuai dengan jenis program yang dipilih, misalnya tabel "Telur" untuk Siba Itik atau tabel "Bibit & Pembesaran" untuk Cahaya Tani).
    *   Masukkan kuantitas (*Qty*) dan Harga Satuan. Omzet akan dihitungkan secara otomatis.
    *   Klik **Simpan Data** (Save) untuk merekam transaksi ke dalam sistem *cloud database*.
2.  **Monitoring Dasbor (Dashboard)**
    *   Berpindah ke menu **Dasbor**.
    *   Gunakan filter di bagian atas halaman untuk mengerucutkan data berdasarkan **Tahun**, **Bulan**, dan **Program**.
    *   Sistem secara otomatis akan menampilkan Ringkasan Angka (KPI Cards), perbandingan nilai berjalan (*Year-To-Date*), dan grafik "Tren Volume vs Omzet" per bulan.
3.  **Analisis AI (Gemini Insight)**
    *   Pada halaman dasbor, gulir ke panel *Insight Analitik*. Sistem AI (Google Gemini Vertex) akan menganalisa grafik dasbor secara mendalam untuk merumuskan tren penjualan atau rekomendasi.
4.  **Ekspor Presentasi**
    *   Klik tombol **Ekspor Laporan** jika anda membutuhkan hasil *dashboard* bulanan tersebut sebagai *slide* presentasi manajemen untuk rapat evaluasi.

## 4. Kelebihan Penggunaan Aplikasi Ini

*   **Antarmuka (UI) Modern, Responsif, & Intuitif:** Dibangun menggunakan desain gaya masa kini yang cantik (vibrant & clean) dengan komponen berbasis *Tailwind CSS*. Tampilannya menawan dan nyaman digunakan.
*   **Formulir Cerdas & Fleksibel (Dynamic Form):** Tidak menggunakan banyak halaman terpisah, namun menggunakan komponen tabel canggih yang merubah wujud isian menyesuaikan karakteristik bisnis tiap-tiap program secara instan.
*   **Sistem AI Terintegrasi:** Dibekali dengan kecerdasan buatan generatif Google Gemini yang aktif membaca struktur data *dashboard*, membantu tim yang kesulitan menyusun paragraf laporan evaluasi menjadi lebih profesional.
*   **Cloud Native & Aman:** Dibangun terhubung dengan Supabase PostgreSQL, memastikan ketahanan penyimpanan, kontrol akses yang baik (RLS - *Row Level Security*), serta rekam jejak (*history*) yang rapi.
*   **Performa Cepat (SPA - Single Page Application):** Menggunakan *React.js* dan *Vite*, perpindahan antar halaman dan filter grafik termuat ulang dalam sekejap tanpa memuat ulang (loading/refresh) halaman situs web.

## 5. Langkah-Langkah Pengembangan (Development Steps)

Adapun fase teknis yang dilalui dalam membidani aplikasi ini adalah:

1.  **Requirement & UI/UX Design:** Menganalisa struktur laporan manual historis Suscomdev PTBA, mengelompokkan variabel, merancang metrik-metrik yang relevan (KPI), dan mendesain kerangka tata letak visual (*wireframe* & *mockup*).
2.  **Project Initialization & Frontend Architecture:** Membangun *scaffolding* (kerangka) proyek menggunakan ekosistem `Vite` + `React.js` serta merakit pustaka gaya menggunakan `Tailwind CSS`.
3.  **Database Configuration (Supabase):** Menyusun arsitektur relasional tabel basis data secara online (`SCD_Report_Sales_Data`, `SCD_Report_Evidence_Data`), menerapkan pengaturan otorisasi akses (CORS & RLS), dan membangun SDK modul pemanggil data (Service Layer).
4.  **Dynamic Component Engineering:** Memprogram komponen tabel cerdas (`DynamicTablesManager.jsx`) agar dapat me-*render* format formulir masukan berdasarkan program aktif (Logika Kondisional antar *State*).
5.  **Data Modeling & Hooks (Business Logic):** Memisahkan kerumitan penyortiran data mentah ke dalam komponen *Custom React Hooks* (`useTempeData`, `useCahayaTaniData`, dll) guna menyaring dan mengagregasi data *database* menjadi himpunan metrik siap pakai untuk diagram bulanan maupun kumulatif YTD.
6.  **Data Visualization (Recharts):** Menghubungkan *hooks* keluaran agregasi ke dalam pustaka *Recharts* untuk mencetak visualisasi data yang responsif, menonjolkan fitur *Tooltip*, *Legend*, serta pewarnaan yang selaras dengan tema program.
7.  **AI Integration (Vertex AI):** Memasangkan pustaka `@google/genai` yang mengambil intisari (JSON state) dari Dasbor untuk disuntikkan ke perintah (*prompt*) LLM, yang bertugas mendikte analisis teks dalam hitungan detik.
8.  **Testing, Debugging, & Refactoring:** Melaksanakan siklus pengecekan fungsionalitas; melacak eror pembacaan pada *Edge-Case* (seperti inkonsistensi input lama dan baru), memperbaiki variabel kategori (`Kategori Produk` vs `Produk`), hingga merapikan susunan *layout* dasbor agar estetik serta responsif (bebas dari penabrakan *UI element*).