# Poster dan Brosur Hidup (AR Gambar Target)

Prototipe AR v0.5 berbasis web. Arahkan kamera HP ke poster atau brosur,
lalu objek 3D beranimasi dan panel informasi muncul.

**Mata kuliah:** Prak. Augmented dan Virtual Reality (ITIA730591), Teknologi Informasi, FIKTI UMSU
**Topik:** 2. Poster dan Brosur Hidup (MindAR image tracking)
**Menuju UAS:** Level A (jalur gambar target)

## Tautan
- Aplikasi (HTTPS): https://tegarksp.github.io/poster-hidup-ar/
- Repository: https://github.com/tegarksp/poster-hidup-ar
- Kode QR: ![QR](docs/qr.png)

## Anggota dan peran
| Nama | Peran |
| Tegar Raya Harahap | Project Manager dan Integrator  |
| Syadila Ayu Luthfiyyah | Aset 3D dan Animasi  |
| Winda Wardani | Engineer Tracking  |
| Maulidya Amanda Pratiwi | Interaksi dan UI/UX |
| Fiqih Syuhada | Data dan Persistence dan QA dan Dokumentasi |

## Teknologi
- Three.js 0.160.0
- MindAR 1.2.5 (image tracking)
- GitHub Pages (HTTPS)

Catatan versi: modul menyarankan Three.js 0.175.0, tetapi MindAR 1.2.5 membutuhkan
`sRGBEncoding` yang dihapus di Three.js r162, sehingga dipakai versi 0.160.0.
Satu versi yang sama dipakai di seluruh repository.

## Fitur
- [x] Minimal 2 gambar target, tiap target memunculkan objek 3D (GLB) beranimasi
- [x] Panel informasi (isi dari `data/targets.json`) muncul saat target ditemukan dan hilang saat target hilang
- [x] Ketuk objek untuk memutar animasi aksi, cubit dua jari untuk memperbesar dan memperkecil
- [x] Status layar: mencari target -> target ditemukan
- [x] Pesan jelas jika izin kamera ditolak
- [x] Data target di file JSON (bukan di kode), target yang sudah dipindai disimpan di localStorage
- [x] Fitur pilihan: audio per target, tombol tautan ke situs

(Centang hanya yang benar-benar berfungsi di HP Anda.)

## Cara menjalankan
1. Buka https://tegarksp.github.io/poster-hidup-ar/ di Chrome (Android) atau Safari (iPhone).
2. Ketuk **Mulai AR** dan izinkan akses kamera.
3. Arahkan kamera ke poster atau brosur target (gambar ada di `assets/targets/`).
4. Setelah model muncul, ketuk model untuk animasi aksi, cubit dengan dua jari untuk mengubah ukuran.

Menjalankan lokal: buka folder repository di VS Code, lalu **Open with Live Server**
(localhost dianggap aman oleh browser, sehingga kamera berfungsi).

## Struktur folder
index.html, css/, js/main.js, data/targets.json, assets/ (models, targets, audio), docs/

## Batasan yang diketahui
- (ISI sesuai hasil uji, contoh: target di layar mengkilap sulit dikenali)
- (ISI: hasil di iPhone, lihat docs/device-matrix.md)
- Pemuatan pertama di HP bisa lambat karena file target (.mind) dan model cukup besar
- Target yang dipindai harus gambar yang sama dengan sumber kompilasi .mind

## Privasi
Pemrosesan kamera dilakukan di perangkat. Tidak ada video atau data lokasi yang
diunggah ke server. Data yang disimpan hanya daftar target yang sudah dipindai
(localStorage di perangkat).

## Dokumentasi
- docs/device-matrix.md, docs/asset-licenses.md, docs/issue-log.md, docs/project-brief.md