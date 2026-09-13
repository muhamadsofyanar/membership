import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderNotification } from "@/lib/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { status } = await req.json();
  if (!["PAID", "REJECTED"].includes(status)) return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  const order = await db.order.findUnique({ where: { id }, include: { user: true, plan: true } });
  if (!order || order.status !== "PENDING") return NextResponse.json({ error: "Transaksi tidak dapat diproses." }, { status: 409 });
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status, reviewedAt: new Date(), paidAt: status === "PAID" ? new Date() : null } });
    if (status !== "PAID") return;
    const previous = await tx.membership.findFirst({ where: { userId: order.userId, status: "ACTIVE", endsAt: { gt: new Date() } }, orderBy: { endsAt: "desc" } });
    const startsAt = previous?.endsAt || new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + order.plan.durationDays);
    await tx.membership.create({ data: { userId: order.userId, planId: order.planId, orderId: order.id, startsAt, endsAt } });
    if (order.user.referredById) await tx.commission.create({ data: { affiliateId: order.user.referredById, sourceUserId: order.userId, orderId: order.id, amount: Math.floor(order.amount * order.plan.affiliatePercent / 100), percent: order.plan.affiliatePercent, status: "APPROVED" } });
  });
  void sendOrderNotification({ to: order.user.phone || "", name: order.user.name, invoice: order.invoice, status });
  return NextResponse.json({ ok: true });
}
