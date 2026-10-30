EMCY 🏫🔍
Aplikasi Progressive Web App (PWA) Monitoring dan Maintenance dan Monitoring Sarana Prasarana Sekolah**

SarprasCheck dirancang untuk menyederhanakan siklus pemeliharaan sarana dan prasarana sekolah secara digital, mulai dari pemeriksaan harian di lapangan hingga penerbitan laporan resmi untuk Kepala Sekolah.

---

## 🌟 Fitur Utama Berdasarkan Peran (Role)

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

### 3. Ketua Sarpras
- **Dashboard Monitoring Eksekutif**: Memantau tingkat kelaikan sarpras sekolah, persentase aset baik, perlu perbaikan, dan rusak.
- **Persetujuan Laporan**: Meninjau dan menyetujui draf laporan dari Penanggung Jawab Sarpras.
- **Pelaporan Resmi Kepala Sekolah**: Menerbitkan dan mengekspor dokumen laporan resmi lengkap dengan kop dinas sekolah, nomor surat, rekapitulasi, rekomendasi anggaran, dan lembar pengesahan tanda tangan untuk Kepala Sekolah (Cetak / PDF).

---

## 🛠️ Stack Teknologi

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Mobile-first, High Contrast, One-handed friendly)
- **Routing**: React Router DOM (Role-based protected routes)
- **Penyimpanan Offline**: IndexedDB via Dexie.js
- **PWA**: `vite-plugin-pwa` dengan Service Worker dan Web App Manifest
- **Backend & Cloud (Opsional)**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Bahasa Antarmuka**: 100% Bahasa Indonesia

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js versi 18 atau lebih baru
- NPM atau Bun / PNPM

### 1. Clone & Pasang Dependensi
```bash
git clone <url-repo>
cd SarprasCheck
npm install
```

### 2. Jalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

---

## ⚙️ Konfigurasi Firebase (Opsional)

Aplikasi telah dilengkapi arsitektur **Offline-First**. Anda dapat langsung menggunakannya tanpa Firebase karena seluruh data tersimpan di browser Anda melalui IndexedDB.

Namun jika Anda ingin menghubungkan aplikasi ke Firebase Cloud Firestore dan Firebase Authentication:

1. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru.
3. Aktifkan **Firebase Authentication** (Metode Email & Password).
4. Aktifkan **Cloud Firestore** dan **Firebase Storage**.
5. Salin konfigurasi web app dari Firebase Console ke file `.env`:
   ```env
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="project-id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="project-id"
   VITE_FIREBASE_STORAGE_BUCKET="project-id.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
   VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
   ```

---

## 📦 Cara Build & Deploy

### 1. Build Produksi (PWA bundle)
```bash
npm run build
```
Hasil build akan tersimpan di folder `dist/`.

### 2. Deploy ke Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Pilih folder dist sebagai public directory
firebase deploy --only hosting
```

Atau deploy ke platform seperti Vercel, Netlify, atau Cloud Run.

---

## 📱 Panduan PWA (Instalasi di Handphone)

1. **Android (Chrome)**: Buka tautan web SarprasCheck di Google Chrome, tekan tombol **"Install Aplikasi"** di bagian atas atau menu browser -> "Tambahkan ke Layar Utama".
2. **iPhone / iPad (Safari)**: Buka tautan web di browser Safari, tekan tombol **Share (Bagikan)** di bilah bawah, lalu pilih **"Add to Home Screen" (Tambah ke Layar Utama)**.

Setelah dipasang, aplikasi akan berjalan fullscreen tanpa address bar selayaknya aplikasi native.
