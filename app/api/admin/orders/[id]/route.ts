import {z} from "zod";import {db} from "@/lib/db";import {handle,apiUser,ApiError} from "@/lib/api";import {membershipWindow} from "@/lib/business";import {sendOrderNotification} from "@/lib/notify";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){return handle(async()=>{
 await apiUser(true);const {id}=await params;const {status}=z.object({status:z.enum(["PAID","REJECTED"])}).parse(await req.json());
 const order=await db.$transaction(async tx=>{
  const order=await tx.order.findUnique({where:{id},include:{user:true,plan:true}});
  if(!order||order.status!=="PENDING")throw new ApiError("Transaksi tidak dapat diproses.",409);
  const now=new Date();const changed=await tx.order.updateMany({where:{id,status:"PENDING"},data:{status,reviewedAt:now,paidAt:status==="PAID"?now:null}});
  if(!changed.count)throw new ApiError("Transaksi sudah diproses.",409);
  if(status==="PAID"){
   const previous=await tx.membership.findFirst({where:{userId:order.userId,planId:order.planId,status:"ACTIVE",endsAt:{gt:now}},orderBy:{endsAt:"desc"}});
   await tx.membership.create({data:{userId:order.userId,planId:order.planId,orderId:id,...membershipWindow(now,order.durationDaysSnapshot??order.plan.durationDays,previous?.endsAt)}});
   const percent=order.affiliatePercentSnapshot??order.plan.affiliatePercent;
   if(order.user.referredById&&order.user.referredById!==order.userId)await tx.commission.create({data:{affiliateId:order.user.referredById,sourceUserId:order.userId,orderId:id,amount:Math.floor(order.amount*percent/100),percent,status:"APPROVED"}});
  }
  return order;
 },{isolationLevel:"Serializable"});
 await sendOrderNotification({to:order.user.phone||"",name:order.user.name,invoice:order.invoice,status});return {ok:true};
});}
