# Project Brief: Poster dan Brosur Hidup

| | |
|---|---|
| **Mata kuliah** | Prak. Augmented dan Virtual Reality (ITIA730591), Teknologi Informasi, FIKTI UMSU |
| **Topik modul** | Topik 2. Poster dan Brosur Hidup (AR Gambar Target) |
| **Level menuju UAS** | Level A (jalur gambar target), pondasi untuk pengembangan Level B |
| **Repository** | https://github.com/tegarksp/poster-hidup-ar |
| **Aplikasi (HTTPS)** | https://tegarksp.github.io/poster-hidup-ar/ |
| **Kelompok** | Kelompok Tegar Raya Harahap (nomor kelompok tidak dicantumkan) |

## 1. Latar belakang dan tujuan

Poster cetak FIKTI UMSU menyampaikan informasi secara statis. Proyek ini
mengembangkan prototipe AR berbasis web yang menampilkan objek 3D dan informasi
tambahan saat pengguna mengarahkan kamera ponsel ke gambar target, tanpa perlu
memasang aplikasi.

Tujuan:
- Menyediakan prototipe AR web v0.5 yang dapat dibuka melalui HTTPS di ponsel.
- Melacak lima gambar target poster dan menampilkan model 3D beranimasi.
- Menampilkan panel informasi dari `data/targets.json` ketika target ditemukan.
- Mendukung ketukan untuk animasi aksi dan gestur cubit untuk mengubah ukuran.

Pengguna sasaran: calon mahasiswa, mahasiswa, dan pengunjung yang ingin melihat
informasi serta konten interaktif FIKTI UMSU.

## 2. Konten target

| No | Gambar target | Objek 3D | Isi panel info |
|---|---|---|---|
| 1 | Poster prestasi FIKTI (judul data: “JUARA 1 LIGA 1 INDONESIA 2023/2024”) | THE_BANANA_CAT (`model1.glb`) | Ucapan selamat kepada mahasiswa atas prestasi turnamen futsal dan tautan ke unggahan terkait |
| 2 | Poster Dirgahayu Republik Indonesia ke-81 | Lightning McQueen (`model2.glb`) | Ucapan kemerdekaan dan pesan kebangsaan |
| 3 | Poster ajakan mendaftar ke FIKTI UMSU | Arlo (`model3.glb`) | Informasi program studi, pendaftaran, dan tautan ke unggahan terkait |
| 4 | Poster penutupan pendaftaran mahasiswa baru | Animated Swan (`model4.glb`) | Pengingat penutupan pendaftaran dan informasi program studi |
| 5 | Poster Program Beasiswa Mahasiswa Disabilitas | Professor Z (`model5.glb`) | Informasi program beasiswa dan kontak |

Judul, deskripsi, tautan, model, dan konfigurasi animasi tiap target dibaca dari
`data/targets.json`; tidak ditulis langsung sebagai konten target di kode.

## 3. Fitur

**Fitur yang tersedia:**
- Lima gambar target berbeda, masing-masing terkait dengan model GLB.
- Animasi model saat target ditemukan; ketuk model untuk memutar animasi aksi.
- Cubit dengan dua jari untuk memperbesar atau memperkecil model.
- Panel informasi muncul ketika target ditemukan dan disembunyikan saat target hilang.
- Status layar menampilkan proses pencarian dan target yang ditemukan.
- Audio singkat per target dan tautan ke unggahan terkait serta situs FIKTI.
- Penghitung target yang telah dipindai selama sesi halaman yang sedang dibuka.
- Pesan penanganan jika akses kamera ditolak atau kamera tidak tersedia.

**Catatan persistence:** data target dimuat dari JSON. Penghitung pindai saat ini
hanya disimpan di memori selama sesi halaman dan belum menggunakan `localStorage`.

## 4. Teknologi

| Komponen | Pilihan |
|---|---|
| Rendering 3D | Three.js 0.160.0 |
| Tracking gambar | MindAR 1.2.5 (image tracking, file `.mind`) |
| Hosting | GitHub Pages (HTTPS) |
| Data target | `data/targets.json` |
| Format aset | GLB (model), MP3 (audio), JPG (gambar target) |

Catatan versi: modul menyarankan Three.js 0.175.0, tetapi MindAR 1.2.5
membutuhkan `sRGBEncoding` yang dihapus mulai Three.js r162. Karena itu proyek
menggunakan Three.js 0.160.0 secara konsisten.

## 5. Pembagian peran

| Nama | Peran | Tanggung jawab utama |
|---|---|---|
| Tegar Raya Harahap | Project Manager dan Integrator | Koordinasi dan integrasi proyek |
| Syadila Ayu Luthfiyyah | Aset 3D dan Animasi | Menyiapkan aset model 3D dan animasi |
| Winda Wardani | Engineer Tracking | Menyiapkan gambar target dan tracking |
| Maulidya Amanda Pratiwi | Interaksi dan UI/UX | Interaksi sentuh, status, dan panel informasi |
| Fiqih Syuhada | Data, Persistence, QA, dan Dokumentasi | Data target, pengujian, dan dokumentasi |

## 6. Jadwal

| Pertemuan | Fokus | Luaran |
|---|---|---|
| 3 | Repository, project brief, mode sentuh | Project brief dan repository aktif |
| 4 | Tracking dan deployment HTTPS | Tracking build dan matriks perangkat |
| 5 | GLB beranimasi, HUD, alur status | Interaksi dan status AR |
| 6 | Data JSON dan persistence | Integrasi data dan pencatatan hasil pindai |
| 7 | Integrasi | Integration v1 |
| 8 | Demo UTS prototipe v0.5 | Prototipe dan dokumentasi |

## 7. Rencana menuju UAS

- Menambah atau mengganti gambar target dan kontennya melalui `targets.json`.
- Menyimpan daftar target yang telah dipindai ke `localStorage`.
- Menyempurnakan kestabilan tracking, ukuran aset, dan performa di ponsel.
- Mengembangkan kuis singkat per target atau mengevaluasi perluasan ke POI indoor
  sebagai pondasi Level B.

## 8. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Gambar target kurang kaya detail atau sulit dikenali | Periksa kualitas target saat kompilasi `.mind` dan uji pada jarak serta kondisi cahaya berbeda |
| Performa atau pemuatan awal lambat di ponsel | Optimalkan ukuran gambar target dan model, serta batasi jumlah target |
| Pantulan pada kertas atau layar mengganggu tracking | Uji di layar dan kertas cetak dengan pencahayaan yang memadai |
| Atribusi atau izin aset belum lengkap | Verifikasi sumber dan izin; lengkapi tabel lisensi sebelum distribusi |
| Daftar pindai belum tersimpan setelah halaman ditutup | Implementasikan dan uji persistence `localStorage` |

Hasil pengujian perangkat yang tercatat: laptop Windows 11/Chrome, Infinix GT 10
Pro/Android 14/Chrome, iPhone 17 Pro/iOS 26/Safari, Vivo Y33s/Android 11/Chrome,
Oppo A5/Android 15/Chrome, dan Samsung A13/Android 12/Chrome. Tracking,
animasi, ketukan, serta audio dicatat berfungsi pada perangkat-perangkat
tersebut; cubit belum diuji pada laptop tanpa layar sentuh. Rincian kondisi uji
ada di `docs/device-matrix.md`.

## 9. Privasi dan lisensi

- Pemrosesan kamera dilakukan di perangkat; video dan data lokasi tidak diunggah
  ke server.
- Data target dimuat dari `data/targets.json`. Penghitung pindai belum persisten
  dan saat ini hanya hidup selama sesi halaman.
- Model 3D dicatat berlisensi Creative Commons Attribution (CC BY) di
  `docs/asset-licenses.md`.
- Sumber atau izin gambar target dan audio masih perlu dikonfirmasi menurut
  tabel lisensi aset. Pastikan atribusi dan izin penggunaan dilengkapi sebelum
  distribusi publik.