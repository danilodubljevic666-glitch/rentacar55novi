import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.55rentacar.me"),
  title: {
    default: "Rent a Car 55 Nikšić — Iznajmljivanje Automobila | Crna Gora",
    template: "%s | Rent a Car 55 Nikšić",
  },
  description:
    "Rent a Car 55 Nikšić — jeftino iznajmljivanje automobila u Nikšiću, Crna Gora. Brza online rezervacija, 24/7 dostupnost, širok izbor vozila. Rent a car blizu vas!",
  keywords: [
    "rent a car nikšić",
    "rent a car 55",
    "rentacar55",
    "rent a car 55 nikšić",
    "rentacar nikšić",
    "rentacar niksic",
    "iznajmljivanje automobila nikšić",
    "iznajmljivanje vozila nikšić",
    "rent a car crna gora",
    "rent a car montenegro",
    "jeftino iznajmljivanje auta nikšić",
    "rent a car blizu mene",
    "auto najam nikšić",
    "55 rent a car",
    "rentacar55.me",
    "55rentacar",
    "najam auta nikšić",
    "car rental niksic",
    "car rental montenegro",
    "cheap car rental nikšić",
    "iznajmiti auto nikšić",
  ],
  authors: [{ name: "Rent a Car 55", url: "https://www.55rentacar.me" }],
  creator: "Rent a Car 55",
  publisher: "Rent a Car 55",
  category: "Iznajmljivanje vozila",
  alternates: {
    canonical: "https://www.55rentacar.me",
  },
  openGraph: {
    type: "website",
    locale: "sr_ME",
    alternateLocale: ["en_US"],
    url: "https://www.55rentacar.me",
    siteName: "Rent a Car 55 Nikšić",
    title: "Rent a Car 55 Nikšić — Iznajmljivanje Automobila",
    description:
      "Iznajmite auto u Nikšiću brzo i jednostavno. Veliki izbor vozila, povoljne cijene, dostupni 24/7. Rezervišite online odmah!",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "Rent a Car 55 Nikšić — Iznajmljivanje vozila",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent a Car 55 Nikšić — Iznajmljivanje Automobila",
    description:
      "Iznajmite auto u Nikšiću brzo i jednostavno. Veliki izbor vozila, povoljne cijene, dostupni 24/7.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  verification: {
    google: "",
  },
  other: {
    "geo.region": "ME-14",
    "geo.placename": "Nikšić",
    "geo.position": "42.7727;18.9504",
    ICBM: "42.7727, 18.9504",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: "Rent a Car 55",
  alternateName: ["RentaCar55", "Rent a Car Nikšić", "55 Rent a Car"],
  description:
    "Iznajmljivanje automobila u Nikšiću, Crna Gora. Veliki izbor vozila, povoljne cijene, brza rezervacija i 24/7 dostupnost.",
  url: "https://www.55rentacar.me",
  logo: "https://www.55rentacar.me/logo.jpg",
  image: "https://www.55rentacar.me/logo.jpg",
  telephone: "+38268555555",
  email: "info@55rentacar.me",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nikšić",
    addressRegion: "Nikšić",
    addressCountry: "ME",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.7727,
    longitude: 18.9504,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card",
  areaServed: [
    { "@type": "City", name: "Nikšić" },
    { "@type": "Country", name: "Crna Gora" },
  ],
  hasMap: "https://maps.google.com/?q=Rent+a+car+55+Nik%C5%A1i%C4%87",
  sameAs: [],
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "24.99",
    highPrice: "49.99",
    offerCount: "12",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="sr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-black text-slate-100">{children}</body>
    </html>
  );
}
