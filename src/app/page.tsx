"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { cars } from "../lib/cars";
import { supabase, type AvailabilityRow } from "../lib/supabase";

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 sm:mt-2.5";

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);

  useEffect(() => {
    supabase.rpc("get_availability").then(({ data }) => {
      if (data) setAvailability(data as AvailabilityRow[]);
    });
  }, []);

  const selectedCar = useMemo(
    () => cars.find((c) => c.id === carId) ?? cars[0],
    [carId],
  );

  const days = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }, [fromDate, toDate]);

  const isCarUnavailable = (id: string) => {
    if (!fromDate || !toDate) return false;
    return availability.some(
      (r) => r.car_id === id && r.from_date <= toDate && r.to_date >= fromDate,
    );
  };

  const unavailableUntil = (id: string): string | null => {
    const today = new Date().toISOString().split("T")[0];
    const hits = availability
      .filter((r) => r.car_id === id && r.to_date >= today)
      .sort((a, b) => a.from_date.localeCompare(b.from_date));
    return hits[0]?.to_date ?? null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName || !email || !phone || !fromDate || !toDate) {
      setStatus("Molimo popunite sva obavezna polja.");
      return;
    }
    if (isCarUnavailable(carId)) {
      setStatus("Izabrani auto je zauzet u odabranom periodu. Molimo izaberite drugi termin.");
      return;
    }
    setStatus("Šaljem...");
    const { error } = await supabase.from("reservations").insert({
      car_id: carId,
      car_name: selectedCar.name,
      full_name: fullName,
      email,
      phone,
      from_date: fromDate,
      to_date: toDate,
      message: message || null,
    });
    if (error) {
      console.error("Supabase insert error:", error);
      setStatus(`Greška: ${error.message}`);
      return;
    }
    // Refresh availability
    supabase.rpc("get_availability").then(({ data }) => {
      if (data) setAvailability(data as AvailabilityRow[]);
    });
    setStatus("Rezervacija je uspješno poslana! Kontaktiraćemo vas uskoro.");
    setFullName(""); setEmail(""); setPhone("");
    setFromDate(""); setToDate(""); setMessage("");
  };

  const navLinks = [
    { href: "#home", label: "Početna" },
    { href: "#cars", label: "Vozila" },
    { href: "#reservation", label: "Rezervacija" },
    { href: "#location", label: "Lokacija" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ── Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-zinc-900 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:h-12 sm:w-12 sm:rounded-2xl">
              <Image src="/logo.jpg" alt="Rent a car 55" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 sm:text-sm">Rent a car 55</p>
              <p className="text-xs text-zinc-500 sm:text-sm">Nikšić, Crna Gora</p>
            </div>
          </div>

          <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="transition hover:text-amber-400">{l.label}</a>
            ))}
          </div>

          <button
            aria-label="Meni"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg p-2 transition hover:bg-zinc-900 md:hidden"
          >
            <span className={`h-0.5 w-6 rounded-full bg-white transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 rounded-full bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 rounded-full bg-white transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-900 bg-black px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="text-base text-zinc-300 transition hover:text-amber-400">{l.label}</a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section
        id="home"
        className="relative left-1/2 right-1/2 w-screen h-screen -translate-x-1/2 overflow-hidden bg-[url('/pozadinaa.png')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        <div className="relative flex h-full flex-col px-5 pt-20 sm:px-8 sm:pt-24 lg:px-20">
          <div className="flex flex-1 flex-col justify-center gap-5 max-w-2xl sm:gap-7 lg:gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 backdrop-blur-sm sm:px-4 sm:py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 sm:h-2 sm:w-2" />
              <span className="text-xs font-medium uppercase tracking-widest text-amber-300 sm:text-sm">Nikšić · Crna Gora</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">Vozite u stilu.</h1>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-amber-400 sm:text-5xl lg:text-6xl xl:text-7xl">Rent a Car 55.</h1>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-zinc-300 sm:text-lg">
              Širok izbor vozila u Nikšiću po pristupačnim cijenama. Brza rezervacija, fleksibilno preuzimanje i podrška 24/7.
            </p>
            <div className="flex items-center gap-5 sm:gap-8">
              {[["15+", "Vozila"], ["24/7", "Podrška"], ["5★", "Ocjena"]].map(([val, lbl], i) => (
                <div key={i} className="flex items-center gap-5 sm:gap-8">
                  {i > 0 && <div className="h-8 w-px bg-zinc-700 sm:h-10" />}
                  <div>
                    <p className="text-2xl font-bold text-white sm:text-3xl">{val}</p>
                    <p className="mt-0.5 text-xs tracking-wide text-zinc-500 sm:mt-1 sm:text-sm">{lbl}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href="#reservation" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 sm:px-8 sm:py-4 sm:text-base">
                Rezerviši odmah
              </a>
              <a href="#cars" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm text-white backdrop-blur-sm transition hover:border-amber-400/50 hover:text-amber-300 sm:px-8 sm:py-4 sm:text-base">
                Pogledaj vozila →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 text-center sm:mb-16">
            <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-amber-400">
              Naše prednosti
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Zašto izabrati Rent a Car 55?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Nudimo vrhunsku uslugu iznajmljivanja vozila sa fokusom na kvalitet, sigurnost i zadovoljstvo korisnika.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            {[
              {
                title: "Osiguranje",
                desc: "Sva vozila su potpuno osigurana za vašu sigurnost i mir tokom vožnje.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
              },
              {
                title: "24/7 Dostupnost",
                desc: "Rezervišite vozilo bilo kada — dostupni smo non-stop za sve vaše potrebe.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
              },
              {
                title: "Podrška kupcima",
                desc: "Naš tim je uvijek spreman da vam pomogne i odgovori na sva vaša pitanja.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-amber-500/40 hover:bg-zinc-900 sm:rounded-3xl sm:p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition group-hover:bg-amber-500/20">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-7 text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cars ── */}
      <section id="cars" className="bg-zinc-950 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-amber-400">
                Naša vozila
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Izaberite svoje vozilo</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-500">
              Brzo, jednostavno, bez čekanja. Izaberite i rezervišite odmah.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {cars.map((car) => {
              const taken = unavailableUntil(car.id);
              const unavailable = fromDate && toDate ? isCarUnavailable(car.id) : false;
              return (
                  <article key={car.id} className={`group relative overflow-hidden rounded-2xl bg-black ring-1 transition duration-300 ${unavailable ? "ring-red-500/30" : "ring-zinc-800 hover:ring-amber-500/50"}`}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative h-52 overflow-hidden bg-zinc-950 sm:h-64">
                      <Image
                        src={car.image}
                        alt={car.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className={`object-cover transition duration-500 group-hover:scale-105 ${unavailable ? "opacity-50 grayscale" : ""}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Zauzeto overlay */}
                      {unavailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-bold text-white">
                            Zauzeto
                          </span>
                        </div>
                      )}

                      {!unavailable && (
                        <div className="absolute bottom-3 right-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">
                          {car.price.toFixed(0)}€/dan
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {[`${car.seats} mjesta`, car.transmission, car.fuel].map((tag) => (
                          <span key={tag} className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">{tag}</span>
                        ))}
                        {taken && !unavailable && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">
                            Zauzeto do {new Date(taken).toLocaleDateString("sr-Latn-ME", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white sm:text-xl">{car.name}</h3>
                      <p className="mt-2 text-xs leading-6 text-zinc-500 sm:text-sm">{car.description}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="text-xl font-bold text-amber-400">
                          {car.price.toFixed(2)}€<span className="text-sm font-normal text-zinc-600">/dan</span>
                        </p>
                        {unavailable ? (
                          <span className="rounded-full border border-red-500/30 px-4 py-2 text-xs text-red-400">
                            Nije dostupno
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCarId(car.id);
                              document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-black transition hover:bg-amber-400 sm:text-sm"
                          >
                            Rezerviši
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
            })}
          </div>
        </div>
      </section>

      {/* ── Reservation ── */}
      <section id="reservation" className="bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-amber-400">
              Rezervacija
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Rezervišite vozilo danas</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-500 sm:text-base">
              Popunite formu i mi ćemo vas kontaktirati sa potvrdom rezervacije.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8 xl:grid-cols-[1fr_400px]">
            {/* Form */}
            <form id="reservation-form" onSubmit={handleSubmit} className="rounded-2xl bg-zinc-950 p-5 ring-1 ring-zinc-800 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Ime i prezime</span>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Marko Vilotijević" required />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="info@rentacar55.com" required />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Telefon</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="068 555 555" required />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Vozilo</span>
                  <select value={carId} onChange={(e) => setCarId(e.target.value)} className={inputClass}>
                    {cars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Datum od</span>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} required />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Datum do</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} required />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Poruka / zahtjev</span>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputClass} placeholder="Dodatni zahtjevi, lokacija preuzimanja..." />
                </label>
              </div>

              {status && (
                <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${status.startsWith("Molimo") || status.startsWith("Greška") || status.startsWith("Izabrani") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {status}
                </p>
              )}
            </form>

            {/* Summary card */}
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl bg-zinc-950 p-5 ring-1 ring-zinc-800 sm:p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-500">Izabrano vozilo</p>
                <div className="relative mb-4 h-40 overflow-hidden rounded-xl bg-zinc-900">
                  <Image src={selectedCar.image} alt={selectedCar.name} fill sizes="400px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <h3 className="text-lg font-bold text-white">{selectedCar.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[`${selectedCar.seats} mjesta`, selectedCar.transmission, selectedCar.fuel].map((t) => (
                    <span key={t} className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">{t}</span>
                  ))}
                </div>

                <div className="my-5 border-t border-zinc-800" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Cijena/dan</span>
                    <span className="text-white">{selectedCar.price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Broj dana</span>
                    <span className="text-white">{days > 0 ? days : "—"}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-3 font-semibold">
                    <span className="text-zinc-300">Ukupno</span>
                    <span className="text-amber-400 text-base">
                      {days > 0 ? `${(selectedCar.price * days).toFixed(2)}€` : "—"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="reservation-form"
                  className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"
                >
                  {status === "Šaljem..." ? "Šaljem..." : "Pošalji rezervaciju"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section id="location" className="bg-zinc-950 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-amber-400">
                Lokacija
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Posjetite nas u Nikšiću</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-500 sm:text-base">
                Rent a Car 55 posluje u samom srcu Nikšića. Vozila preuzimate pri dolasku, a naš tim je spreman da vam pomogne u svakom trenutku.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:shrink-0">
              {[
                { label: "Adresa", val: "Nikšić, Crna Gora", sub: "Preuzimanje pri dolasku" },
                { label: "Radno vrijeme", val: "24/7 — Non-stop", sub: "Uvijek dostupni" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-black p-5 ring-1 ring-zinc-800 sm:p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500">{item.label}</p>
                  <p className="font-semibold text-white">{item.val}</p>
                  <p className="mt-1 text-xs text-zinc-600">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-zinc-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d480.8605594036701!2d18.950371098295435!3d42.7727010197182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x134da9000b72246b%3A0x70669db08fb9ee95!2sRent%20a%20car%2055!5e1!3m2!1ssr!2s!4v1780482887385!5m2!1ssr!2s"
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Rent a Car 55 lokacija"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-900 bg-black">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-zinc-900">
                  <Image src="/logo.jpg" alt="Rent a car 55" fill sizes="48px" className="object-cover" />
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">Rent a Car 55</p>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500">
                Iznajmljivanje vozila u Nikšiću. Pouzdani smo partner za sve vaše putne potrebe u Crnoj Gori.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-600">Dostupni 24/7</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-amber-500">Navigacija</p>
              <ul className="space-y-3 text-sm text-zinc-500">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="transition hover:text-amber-400">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-amber-500">Kontakt</p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li>Nikšić, Crna Gora</li>
                <li><a href="tel:068555555" className="text-white transition hover:text-amber-400">068 555 555</a></li>
                <li>info@rentacar55.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 sm:flex-row">
            <p className="text-xs text-zinc-700">© 2025 Rent a Car 55. Sva prava zadržana.</p>
            <p className="text-xs text-zinc-700">Nikšić, Crna Gora</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
