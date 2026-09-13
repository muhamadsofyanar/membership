# RizqHub Membership + LMS + Affiliate

MVP SaaS siap deploy dengan Next.js, PostgreSQL, Prisma, Docker, pembayaran manual, membership, LMS, affiliate, dan dashboard admin.

## Upload ke GitHub

1. Ekstrak ZIP ini.
2. Upload seluruh isi folder ke repository GitHub.
3. Jangan upload file `.env` berisi rahasia.

## Deploy di Coolify

1. Buat **New Resource > Docker Compose** dari repository GitHub.
2. Tambahkan environment berikut:
   - `POSTGRES_PASSWORD`: password database yang kuat
   - `AUTH_SECRET`: string acak minimal 32 karakter
   - `NEXT_PUBLIC_APP_URL`: `https://rizqhub.id`
   - `ADMIN_EMAIL`: email admin
   - `ADMIN_PASSWORD`: password admin awal
3. Deploy.
4. Setelah deploy pertama, buka terminal container aplikasi dan jalankan `npx prisma db seed` satu kali.
5. Arahkan domain `rizqhub.id` ke aplikasi port 3000 melalui menu Domains di Coolify.

## Alur pembayaran manual

Member memilih paket, mengunggah bukti transfer, lalu admin memeriksa menu **Pembayaran**. Ketika disetujui, membership dan akses LMS otomatis aktif. Jika member berasal dari referral, komisi affiliate otomatis tercatat.

## Integrasi Starsender

Isi `STARSENDER_API_URL`, `STARSENDER_API_KEY`, dan `STARSENDER_DEVICE_ID`. Payload standar berada di `lib/notify.ts` dan dapat disesuaikan dengan format akun Starsender Anda.

## Catatan keamanan

Ganti rekening contoh melalui Admin > Pengaturan. Ganti password admin setelah login pertama. Sistem payment gateway belum dipasang sesuai tahap MVP manual.
