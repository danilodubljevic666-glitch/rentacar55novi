"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-dismissed")) return;

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isInStandalone =
      "standalone" in window.navigator &&
      (window.navigator as unknown as { standalone?: boolean }).standalone;

    if (isIOSDevice && !isInStandalone) {
      setIsIOS(true);
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900 border-t border-zinc-700 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Rent a Car 55"
          className="w-12 h-12 rounded-xl flex-shrink-0 object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">Rent a Car 55</p>
          {isIOS ? (
            <p className="text-zinc-400 text-xs mt-0.5">
              Dodaj na početni ekran: pritisni{" "}
              <span className="text-white font-medium">Share ↑</span> →{" "}
              <span className="text-white font-medium">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-zinc-400 text-xs mt-0.5">
              Instaliraj aplikaciju za brži pristup rezervacijama
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Instaliraj
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-white text-lg leading-none px-1 py-1 transition-colors"
            aria-label="Zatvori"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
