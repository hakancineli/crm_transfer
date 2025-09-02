import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/reservations/",
        "/reports/",
        "/admin-login",
        "/customer-panel",
      ],
    },
    sitemap: "https://www.protransfer.com.tr/sitemap.xml",
  };
}


