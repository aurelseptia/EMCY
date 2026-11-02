EMCY 🏫🔍
Aplikasi Progressive Web App (PWA) Monitoring dan Maintenance dan Monitoring Sarana Prasarana Sekolah

SarprasCheck dirancang untuk menyederhanakan siklus pemeliharaan sarana dan prasarana sekolah secara digital, mulai dari pemeriksaan harian di lapangan hingga penerbitan laporan resmi untuk Ketua.

---

🌟 Fitur Utama Berdasarkan Peran (Role)

### 1. OB (Petugas Lapangan)
- **Ceklis Digital**: Memeriksa kondisi sarana prasarana sekolah (Bangku/Meja, Elektronik, Transportasi) dengan satu tangan.
- **Tiga Pilihan Status Mudah**: "Baik" (Hijau), "Perlu Perbaikan" (Kuning), atau "Rusak" (Merah).
- **Bukti Foto & Catatan Kerusakan**: Mengambil foto bukti langsung dari kamera smartphone atau galeri.
- **Auto-Save Draft**: Draf tersimpan otomatis ke IndexedDB (Dexie.js) setiap kali ada perubahan jawaban.
- **Offline-First**: Dapat digunakan secara normal tanpa koneksi internet; data disinkronkan otomatis saat kembali online.
- **Riwayat Pemeriksaan**: Melihat arsip hasil ceklis yang pernah dikirimkan.

### 2. Penanggung Jawab Sarpras (PJ Sarpras)
- **Verifikasi Ceklis**: Memeriksa dan memverifikasi laporan ceklis yang dikirimkan oleh OB.
- **Monitoring Kerusakan**: Melihat daftar fasilitas yang mengalami penurunan fungsi atau kerusakan.
- **Tindak Lanjut Maintenance**: Mengatur status pengerjaan ("Menunggu", "Diproses", "Selesai") serta menambahkan catatan teknisi.
- **Penyusunan Laporan**: Mengompilasikan hasil monitoring dan perbaikan ke dalam laporan formal untuk Ketua Sarpras.

### 3. Kepala Sarpras
- **Dashboard Monitoring Eksekutif**: Memantau tingkat kelaikan sarpras sekolah, persentase aset baik, perlu perbaikan, dan rusak.
- **Persetujuan Laporan**: Meninjau dan menyetujui draf laporan dari Penanggung Jawab Sarpras.
- **Pelaporan Resmi Kepala Sekolah**: Menerbitkan dan mengekspor dokumen laporan resmi lengkap dengan kop dinas sekolah, nomor surat, rekapitulasi, rekomendasi anggaran, dan lembar pengesahan tanda tangan untuk Kepala Sekolah (Cetak / PDF).

---

🛠️ Stack Teknologi

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Mobile-first, High Contrast, One-handed friendly)
- **Routing**: React Router DOM (Role-based protected routes)
- **Penyimpanan Offline**: IndexedDB via Dexie.js
- **PWA**: `vite-plugin-pwa` dengan Service Worker dan Web App Manifest
- **Backend & Cloud (Opsional)**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Bahasa Antarmuka**: 100% Bahasa Indonesia


📱 Panduan PWA (Instalasi di Handphone)

1. **Android (Chrome)**: Buka tautan web EMCY di Google Chrome, tekan tombol **"Install Aplikasi"** di bagian atas atau menu browser -> "Tambahkan ke Layar Utama".
2. **iPhone**: Buka tautan web di browser Safari, tekan tombol **Share (Bagikan)** di bawah, lalu pilih **"Add to Home Screen" (Tambah ke Layar Utama)**.

Setelah dipasang, aplikasi akan berjalan fullscreen tanpa address bar selayaknya aplikasi native.
