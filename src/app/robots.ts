import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/login", "/api/"],
      },
    ],
    sitemap: "https://www.55rentacar.me/sitemap.xml",
    host: "https://www.55rentacar.me",
  };
}
