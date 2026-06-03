"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, type Reservation, type ReservationStatus } from "../../lib/supabase";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđeno",
  completed: "Završeno",
  cancelled: "Otkazano",
};

const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-zinc-700/40 text-zinc-400 border-zinc-700",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("sr-Latn-ME", { day: "2-digit", month: "short", year: "numeric" });
}

function daysBetween(from: string, to: string) {
  return Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
}

function isActive(r: Reservation) {
  const today = new Date().toISOString().split("T")[0];
  return r.from_date <= today && r.to_date >= today && r.status === "confirmed";
}

function isUpcoming(r: Reservation) {
  const today = new Date().toISOString().split("T")[0];
  return r.from_date > today && (r.status === "pending" || r.status === "confirmed");
}

type FilterKey = "all" | ReservationStatus | "active";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Sve" },
  { key: "active", label: "Aktivne" },
  { key: "pending", label: "Na čekanju" },
  { key: "confirmed", label: "Potvrđeno" },
  { key: "completed", label: "Završeno" },
  { key: "cancelled", label: "Otkazano" },
];

export default function AdminPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login?k=rentacar55");
        return;
      }
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });
      setReservations(data ?? []);
      setLoading(false);
    }
    init();
  }, [router]);

  const updateStatus = async (id: string, status: ReservationStatus) => {
    setUpdating(id);
    await supabase.from("reservations").update({ status }).eq("id", id);
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setUpdating(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login?k=rentacar55");
  };

  const filtered = reservations.filter((r) => {
    if (filter === "all") return true;
    if (filter === "active") return isActive(r);
    return r.status === filter;
  });

  const counts = {
    all: reservations.length,
    active: reservations.filter(isActive).length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-800 border-t-amber-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-zinc-900">
              <Image src="/logo.jpg" alt="Rent a Car 55" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Rent a Car 55</p>
              <p className="text-xs text-zinc-600">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="rounded-xl border border-zinc-800 px-4 py-2 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white">
              Sajt →
            </a>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              Odjava
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Ukupno", val: counts.all, color: "text-white" },
            { label: "Na čekanju", val: counts.pending, color: "text-amber-400" },
            { label: "Aktivne danas", val: counts.active, color: "text-emerald-400" },
            { label: "Završeno", val: counts.completed, color: "text-zinc-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800 sm:p-5">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="mt-1 text-xs text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-amber-500 text-black"
                  : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-60">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* Reservations */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-600">
            Nema rezervacija u ovoj kategoriji.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((r) => {
              const days = daysBetween(r.from_date, r.to_date);
              const active = isActive(r);
              const upcoming = isUpcoming(r);

              return (
                <article key={r.id} className={`rounded-2xl bg-zinc-950 ring-1 transition ${active ? "ring-emerald-500/40" : "ring-zinc-800"}`}>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: car + customer */}
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">{r.car_name}</p>
                          {active && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                              Aktivna
                            </span>
                          )}
                          {upcoming && !active && (
                            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">Predstojeća</span>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-white">{r.full_name}</p>
                        <p className="text-sm text-zinc-500">
                          <a href={`mailto:${r.email}`} className="hover:text-amber-400 transition">{r.email}</a>
                          {" · "}
                          <a href={`tel:${r.phone}`} className="hover:text-amber-400 transition">{r.phone}</a>
                        </p>
                      </div>

                      {/* Right: status + time */}
                      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                        <p className="text-xs text-zinc-600">
                          Rezervisano: {formatDate(r.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Dates + message */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-black p-4">
                        <p className="mb-1 text-xs text-zinc-600">Preuzimanje</p>
                        <p className="font-semibold text-white">{formatDate(r.from_date)}</p>
                      </div>
                      <div className="rounded-xl bg-black p-4">
                        <p className="mb-1 text-xs text-zinc-600">Vraćanje</p>
                        <p className="font-semibold text-white">{formatDate(r.to_date)}</p>
                        <p className="mt-0.5 text-xs text-zinc-600">{days} {days === 1 ? "dan" : "dana"}</p>
                      </div>
                      <div className="rounded-xl bg-black p-4">
                        <p className="mb-1 text-xs text-zinc-600">Poruka</p>
                        <p className="text-sm text-zinc-400">{r.message || "—"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {r.status !== "completed" && r.status !== "cancelled" && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-900 pt-4">
                        {r.status === "pending" && (
                          <button
                            onClick={() => updateStatus(r.id, "confirmed")}
                            disabled={updating === r.id}
                            className="rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            Potvrdi rezervaciju
                          </button>
                        )}
                        {r.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(r.id, "completed")}
                            disabled={updating === r.id}
                            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50"
                          >
                            Označi kao završeno
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(r.id, "cancelled")}
                          disabled={updating === r.id}
                          className="rounded-xl bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Otkaži
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
