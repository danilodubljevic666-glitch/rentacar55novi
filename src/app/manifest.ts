import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rent a Car 55 Nikšić",
    short_name: "RentaCar55",
    description: "Iznajmljivanje automobila u Nikšiću, Crna Gora",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#dc2626",
    icons: [
      {
        src: "/logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
