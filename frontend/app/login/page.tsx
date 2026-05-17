"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "../lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Login failed');
      }
      const data = await res.json();
      if (data?.token) {
        setToken(data.token);
        const role = data.role ?? 'SELLER';
        if (role === 'ADMIN') router.push('/admin');
        else router.push('/seller');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-600">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
          </label>
          <button className="w-full rounded-xl bg-slate-900 text-white px-4 py-2">Sign in</button>
          {error ? <p className="text-rose-700">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
