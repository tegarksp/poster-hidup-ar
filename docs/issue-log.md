| Tanggal | Gejala | Penyebab | Solusi | Status |
|---|---|---|---|---|
| 2026-11-10 | Halaman berhenti di "Memuat...", Console: module 'three' does not provide an export named 'sRGBEncoding' | MindAR 1.2.5 memakai sRGBEncoding yang dihapus di Three.js r162 | Three.js diturunkan ke 0.160.0 | Selesai |
| 2026-11-10 | CSS dan JS tidak termuat di Live Server (404, MIME type text/html) | Folder yang dibuka di VS Code adalah folder induk, bukan folder repository | Membuka folder `poster-hidup-ar` langsung sebagai akar proyek | Selesai |
| 2026-11-10 | Halaman berhenti di "Memuat...", Console: `sRGBEncoding` tidak ada | MindAR 1.2.5 memakai `sRGBEncoding` yang dihapus di Three.js r162 | Three.js diturunkan ke 0.160.0 | Selesai |
| 2026-11-10 | Lima file `.mind` terpisah tidak bisa dipakai bersamaan | Satu instance MindAR hanya membaca satu file `.mind` | Mengompilasi gambar menjadi satu `targets.mind` | Selesai |
| 2026-11-10 | HP: status "Siap..." tidak berubah, kamera lambat/gagal | Cache versi lama dan file `.mind` berat | Penanda versi di judul halaman, status tahap pemuatan, buka dengan `?v=` | Selesai |
| 2026-11-10 | Animasi langsung berputar saat poster di-scan | Klip pertama GLB dipakai otomatis sebagai idle | Idle hanya jika `animasiIdle` diisi di JSON; model diam sampai diketuk | Selesai |