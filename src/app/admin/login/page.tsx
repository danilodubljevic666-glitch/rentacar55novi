"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Provjeri tajni ključ u URL-u
    if (params.get("k") !== "rentacar55") {
      router.replace("/");
      return;
    }
    // Ako je već prijavljen, idi na admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/admin");
      else setChecking(false);
    });
  }, [params, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Pogrešan email ili šifra. Pokušaj ponovo.");
      setLoading(false);
    } else {
      router.replace("/admin");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-zinc-900">
            <Image src="/logo.jpg" alt="Rent a Car 55" fill sizes="56px" className="object-cover" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Rent a Car 55</p>
            <p className="mt-1 text-xs text-zinc-600">Admin Panel</p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-950 p-6 ring-1 ring-zinc-800 sm:p-8">
          <h1 className="mb-6 text-xl font-bold text-white">Prijava</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                placeholder="admin@rentacar55.com"
                required
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Šifra</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? "Prijava..." : "Prijavi se"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          <a href="/" className="transition hover:text-zinc-500">← Nazad na sajt</a>
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
