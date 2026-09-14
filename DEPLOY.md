# Instalasi, upgrade, dan operasional

## Instalasi baru melalui Coolify

1. Upload isi folder proyek ke repositori; jangan ikutkan `.env`, node_modules atau `.next`.
2. Buat resource Docker Compose dari `docker-compose.yml`.
3. Isi POSTGRES_PASSWORD, AUTH_SECRET (acak minimal 32 karakter), ADMIN_EMAIL, ADMIN_PASSWORD (minimal 12 karakter), NEXT_PUBLIC_APP_URL. Password database yang masuk URL harus di-URL-encode jika menggunakan karakter khusus; paling mudah pakai string acak alfanumerik panjang.
4. Isi SMTP jika reset password via email akan digunakan; isi Starsender jika diperlukan.
5. Deploy, sambungkan domain ke port 3000, dan aktifkan HTTPS. NEXT_PUBLIC_APP_URL harus sama persis dengan origin utama (misalnya https://rizqhub.id), tanpa path.
6. Dari terminal container aplikasi, jalankan `node --import tsx prisma/seed.ts` sekali. Seed tidak mengganti password, harga paket, pengaturan atau akses kursus yang sudah ada. Ganti rekening contoh melalui Admin > Pengaturan.
7. Periksa `/api/health`, login, pembayaran uji, akses materi dan pencairan uji sebelum digunakan pelanggan.

## Upgrade dari ZIP membership-main sebelumnya

1. Backup database sebelum mengganti sumber. Gunakan salinan staging terlebih dahulu bila database berisi transaksi nyata.
2. Ganti kode dengan isi paket ini dan pertahankan environment serta volume database lama.
3. Rebuild/deploy. Startup menjalankan `prisma db push` tanpa `--accept-data-loss`, lalu maintenance yang mengisi snapshot pesanan lama dan membersihkan token/rate limit kedaluwarsa. Struktur baru bersifat penambahan; tidak ada penghapusan tabel.
4. Untuk migrasi SQL terkontrol, tersedia `prisma/upgrade/1.1.0.sql`: jalankan satu kali pada skema versi lama sebelum menyalakan aplikasi baru. Jangan jalankan SQL ini lagi bila `db push` sudah menambahkan kolom/tabel. Pilih salah satu rute migrasi.
5. Pengguna perlu login ulang karena format sesi sekarang memiliki versi. Tidak perlu seed ulang untuk upgrade. Bila menjalankan seed, data lama tidak ditimpa.
6. Periksa pengaturan rekening, relasi paket-kursus, bukti pembayaran, dan reset email.

Catatan: snapshot pesanan sebelum upgrade mengikuti konfigurasi paket saat upgrade, karena sumber lama tidak menyimpan durasi/persentase pada pesanan.

## Backup database (Docker Compose)

Dari direktori Compose:

```bash
docker compose exec -T postgres pg_dump -U postgres -d rizqhub -Fc > backup-rizqhub.dump
```

Simpan backup di lokasi terpisah. Uji pemulihan ke database kosong/staging:

```bash
docker compose exec -T postgres pg_restore -U postgres -d rizqhub_restore --no-owner < backup-rizqhub.dump
```

Buat database `rizqhub_restore` terlebih dahulu. Jangan menjalankan restore ke database aktif tanpa rencana pemulihan. Rollback aplikasi memakai versi kode sebelumnya; jangan menghapus kolom/tabel baru atau menjalankan `docker compose down -v`. Jika harus mengembalikan backup lama, transaksi setelah waktu backup tidak akan ikut kembali.

## Operasional

- Pencairan: setujui pengajuan, lakukan transfer bank, lalu tandai PAID dengan referensi transfer. Aplikasi hanya mencatat transfer, bukan mengirim uang.
- Jalankan `node scripts/maintenance.mjs` berkala (misalnya setiap hari) untuk membersihkan token/rate limit kedaluwarsa. Tidak ada jadwal eksternal yang dibuat otomatis.
- Log kegagalan notifikasi tidak mengandung password/token. Cek kredensial/provider jika email atau WhatsApp tidak diterima.
- SMTP dan Starsender perlu diuji dengan akun sendiri; tidak ada kredensial layanan tersebut di ZIP.
