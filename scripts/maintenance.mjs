import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();
try {
 await db.$executeRaw`UPDATE "Order" o SET "durationDaysSnapshot"=COALESCE(o."durationDaysSnapshot",p."durationDays"), "affiliatePercentSnapshot"=COALESCE(o."affiliatePercentSnapshot",p."affiliatePercent") FROM "Plan" p WHERE o."planId"=p.id AND (o."durationDaysSnapshot" IS NULL OR o."affiliatePercentSnapshot" IS NULL)`;
 await db.passwordReset.deleteMany({where:{expiresAt:{lt:new Date()}}});
 await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});
 console.log("Maintenance completed.");
}finally{await db.$disconnect();}
