import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/home",
        "/notifications",
        "/setting",
        "/profile",
        "/search",
      ],
    },
    sitemap: "https://mikan-sns.vercel.app/sitemap.xml",
  };
}
