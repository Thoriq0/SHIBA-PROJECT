# SHIBA (Sistem Harian Informasi Bencana Alam)

SHIBA adalah proyek yang dirancang untuk memberikan informasi terkini tentang gempa bumi kepada pengguna. Proyek ini menggunakan data dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) serta menyediakan fitur untuk melihat histori gempa terakhir melalui API yang disediakan menggunakan Firebase.

## Fitur Utama:
- **Informasi Gempa Terkini**: Menampilkan data gempa bumi terbaru yang diperoleh dari BMKG API.
- **Histori Gempa**: Pengguna dapat melihat histori gempa terakhir melalui API Firebase yang tersedia.
- **Berita Terkini**: Menampilkan berita terbaru terkait bencana alam menggunakan RapidAPI.
- **Progressive Web App (PWA)**: Menambahkan kemampuan aplikasi untuk diinstal pada perangkat pengguna dan dapat bekerja secara offline.
- **Aksesibilitas**: Memastikan aplikasi dapat diakses oleh semua pengguna termasuk mereka yang memiliki disabilitas.

## Cara Menjalankan Proyek:
1. **Instalasi Dependencies**: Pastikan Anda memiliki Node.js (versi 21.7.3) dan npm (versi 10.5.0) terinstal di komputer Anda. Kemudian, jalankan perintah `npm install` untuk menginstal semua dependencies yang diperlukan.
2. **Menjalankan Proyek**: Jalankan perintah `npm start-dev` untuk memulai server pengembangan. Halaman web akan otomatis dimuat di peramban Anda.

## Struktur Folder:
- **public/**: Asset data, icon, dan gambar.
- **src/**: Mengandung file sumber utama proyek.
  - **dist/**: Berisi file HTML hasil build.
  - **scripts/**: File JavaScript untuk logika aplikasi.
  - **styles/**: File CSS untuk gaya tampilan.

## Teknologi yang Digunakan:
- **JavaScript**: Bahasa pemrograman utama untuk logika aplikasi.
- **Firebase**: Digunakan untuk menyimpan dan menyediakan histori gempa terakhir melalui API.
- **BMKG API**: Digunakan untuk mendapatkan data gempa terkini.
- **RapidAPI**: Digunakan untuk mendapatkan berita terbaru terkait bencana alam.
- **Webpack**: Digunakan untuk mengelola modul dan menghasilkan bundel JavaScript.
- **Tailwind CSS**: Framework CSS untuk desain responsif dan kustomisasi cepat.
- **Leaflet JS**: Digunakan untuk menampilkan Maps pada tampilan.

## Kontribusi:
Kami selalu terbuka untuk kontribusi dari komunitas. Jika Anda ingin berkontribusi pada proyek ini, silakan buka pull request atau buka masalah (issue) baru di repositori proyek kami di GitHub.

## Tim Pengembang:
- **Abdur Ra'uf Al Farras**: Front End Dev.
- **Adam Yusron**: UI/UX & Front End Dev.
- **Ahmad Thoriq**: Backend Dev.

## Lisensi:
- **Data BMKG**
- **Data RapidAPI**

## Kontak:
Untuk pertanyaan atau dukungan, silakan hubungi tim kami:
- thoriq.ahmad1301@gmail.com
- adamyr159@gmail.com
- alfarras74@gmail.com
