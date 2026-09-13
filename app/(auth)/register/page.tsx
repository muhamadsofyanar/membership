import Link from "next/link"; import { AuthForm } from "@/components/AuthForm";
export default function Register(){return <main className="auth-shell"><div className="auth-card"><h1>Mulai bersama RizqHub</h1><p>Buat akun gratis. Pilih membership setelah masuk.</p><AuthForm mode="register"/><div className="form-note">Sudah punya akun? <Link href="/login">Masuk di sini</Link></div></div></main>}
