import { z } from "zod";
export const passwordSchema = z.string().min(8, "Password minimal 8 karakter.").refine(v => new TextEncoder().encode(v).length <= 72, "Password maksimal 72 byte.");
export function membershipWindow(now: Date, days: number, previousEnd?: Date | null) {
  if (!Number.isInteger(days) || days < 1 || days > 36500) throw new Error("Durasi tidak valid.");
  const startsAt = previousEnd && previousEnd > now ? previousEnd : now;
  return { startsAt, endsAt: new Date(startsAt.getTime() + days * 86400000) };
}
export function payoutTransition(from: string, to: string) {
  return (from === "PENDING" && ["APPROVED", "REJECTED"].includes(to)) || (from === "APPROVED" && ["PAID", "REJECTED"].includes(to));
}
export const activeMembership = (userId: string) => ({userId, status: "ACTIVE" as const, startsAt: {lte: new Date()}, endsAt: {gt: new Date()}});
