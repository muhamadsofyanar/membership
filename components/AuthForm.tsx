"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const params = useSearchParams();
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError("");
    const data=Object.fromEntries(new FormData(e.currentTarget));
    const res=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const body=await res.json(); setLoading(false);
    if(!res.ok){setError(body.error||"Terjadi kesalahan.");return}
    router.push(body.redirect || "/dashboard"); router.refresh();
  }
  return <form onSubmit={submit}>{error&&<div className="alert alert-error">{error}</div>}
    {mode==="register"&&<><div className="field"><label>Nama lengkap</label><input name="name" required minLength={3} placeholder="Nama Anda"/></div><div className="field"><label>Nomor WhatsApp</label><input name="phone" required placeholder="62812..."/></div></>}
    <div className="field"><label>Email</label><input name="email" type="email" required placeholder="nama@email.com"/></div>
    <div className="field"><label>Password</label><input name="password" type="password" required minLength={8} placeholder="Minimal 8 karakter"/></div>
    {mode==="register"&&<input type="hidden" name="ref" value={params.get("ref")||""}/>} 
    {mode==="register"&&<input type="hidden" name="plan" value={params.get("plan")||""}/>} 
    <button className="btn btn-primary btn-block" disabled={loading}>{loading?"Memproses...":mode==="login"?"Masuk ke Dashboard":"Buat Akun Gratis"}</button>
  </form>
}
