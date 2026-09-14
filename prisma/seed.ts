import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12 || Buffer.byteLength(process.env.ADMIN_PASSWORD) > 72) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12 characters minimum, 72 bytes maximum).");
  const password = process.env.ADMIN_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Admin Rizqhub", email, passwordHash, role: Role.ADMIN, referralCode: "ADMIN01" },
  });

  const plans = [
    { name: "Starter", slug: "starter", description: "Mulai membangun income digital dengan materi inti.", price: 149000, durationDays: 30, affiliatePercent: 20, isPopular: false, features: ["Akses materi dasar", "Komunitas member", "Link affiliate", "Komisi 20%"] },
    { name: "Growth", slug: "growth", description: "Paket terlengkap untuk bertumbuh lebih cepat.", price: 399000, durationDays: 90, affiliatePercent: 30, isPopular: true, features: ["Semua fitur Starter", "Materi premium", "Template siap pakai", "Komisi 30%", "Prioritas dukungan"] },
    { name: "Lifetime", slug: "lifetime", description: "Akses panjang tanpa perlu memperpanjang tiap bulan.", price: 999000, durationDays: 3650, affiliatePercent: 35, isPopular: false, features: ["Semua fitur Growth", "Akses 10 tahun", "Update materi", "Komisi 35%", "Sesi khusus member"] },
  ];

  for (const plan of plans) await prisma.plan.upsert({ where: { slug: plan.slug }, update: {}, create: plan });

  const growth = await prisma.plan.findUniqueOrThrow({ where: { slug: "growth" } });
  const lifetime = await prisma.plan.findUniqueOrThrow({ where: { slug: "lifetime" } });
  const starter = await prisma.plan.findUniqueOrThrow({ where: { slug: "starter" } });
  const course = await prisma.course.upsert({
    where: { slug: "fondasi-bisnis-digital" },
    update: {},
    create: {
      title: "Fondasi Bisnis Digital",
      slug: "fondasi-bisnis-digital",
      description: "Pelajari fondasi membangun produk, audiens, dan sistem penjualan digital yang sehat.",
      isPublished: true,
      plans: { connect: [{ id: starter.id }, { id: growth.id }, { id: lifetime.id }] },
    },
  });
  const moduleCount = await prisma.module.count({ where: { courseId: course.id } });
  if (!moduleCount) {
    await prisma.module.create({
      data: {
        courseId: course.id, title: "Mulai dari Fondasi", position: 1,
        lessons: { create: [
          { title: "Selamat Datang di RizqHub", content: "Di materi ini Anda akan memahami alur belajar dan target yang perlu dicapai. Fokus pada satu langkah kecil, praktikkan, lalu lanjut ke materi berikutnya.", durationMinutes: 4, position: 1, isPreview: true },
          { title: "Menentukan Masalah dan Audiens", content: "Produk yang kuat dimulai dari masalah nyata. Tulis satu kelompok audiens, tiga masalah yang sering mereka hadapi, dan hasil yang ingin mereka capai.", durationMinutes: 12, position: 2 },
          { title: "Menyusun Penawaran", content: "Gabungkan hasil, mekanisme, bukti, dan pengurangan risiko menjadi penawaran yang mudah dipahami. Hindari menjanjikan hasil yang tidak realistis.", durationMinutes: 15, position: 3 },
        ] },
      },
    });
  }

  const settings = {
    site_name: "RizqHub",
    bank_name: "Bank Syariah Indonesia",
    bank_account: "0000000000",
    bank_holder: "RIZQHUB INDONESIA",
    whatsapp_admin: "6281234567890",
  };
  for (const [key, value] of Object.entries(settings)) await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
}

main().catch(error => { console.error(error.message); process.exitCode=1; }).finally(() => prisma.$disconnect());
