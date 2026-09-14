# Hasil verifikasi 1.1.0

- `npm test`: 14 pemeriksaan lulus (aturan bisnis, validasi LMS, dan struktur deployment).
- `npm run lint`: pemeriksaan tipe TypeScript lulus.
- `npm run build`: build produksi Next.js 15.5.25 lulus; 41 route aplikasi/API tercantum pada build.
- `npm audit --omit=dev`: 0 temuan pada lockfile yang dikemas. Dependency overrides dicatat di package.json; audit ini bukan jaminan bebas seluruh kerentanan.
- `tests/integration.mjs`: 31 pemeriksaan HTTP lulus pada aplikasi hasil build menggunakan PostgreSQL tertanam PGlite sebagai database sekali pakai. Meliputi registrasi/referral, profil, password dan sesi lama, upload/baca bukti, persetujuan berulang, membership/komisi, pencairan/tolak/ajukan ulang/lunas, token reset sekali pakai, penolakan origin lain, dan akses pratinjau vs konten berbayar.
- SQL upgrade diuji dari skema asli dengan contoh member dan order; data dan nilai transaksi tetap ada, kolom snapshot terisi.
- Review kode menutup temuan: bukti transfer via data URL, pratinjau yang sebelumnya tidak berfungsi, dan duplikasi pending order. Editor LMS menerima kembali ID materi dari server setelah menyimpan.

## Batas verifikasi

PGlite menjalankan mesin PostgreSQL tertanam dengan multiplexing; pengujian ini bukan pengujian beban/concurrency pada PostgreSQL 16 produksi. Docker/Coolify dan domain pengguna belum dijalankan dari lingkungan ini. SMTP, Starsender, dan transfer bank nyata tidak dijalankan. Tidak dilakukan pengujian visual lintas browser.

## Menjalankan ulang integrasi

Hanya gunakan database uji kosong. Buat skema, seed dengan ADMIN_EMAIL=admin@test.invalid dan ADMIN_PASSWORD=test-admin-password-123, lalu jalankan aplikasi pada alamat TEST_BASE_URL. Aplikasi dan skrip harus memakai DATABASE_URL yang sama. Kosongkan kredensial Starsender/SMTP agar pengujian tidak mengirim pesan keluar.

```bash
RUN_INTEGRATION_TESTS=1 TEST_BASE_URL=http://localhost:3000 node tests/integration.mjs
```

Skrip membuat data uji dan tidak membersihkan transaksi secara otomatis; hapus seluruh database uji setelah selesai. Jangan jalankan terhadap database pelanggan.
