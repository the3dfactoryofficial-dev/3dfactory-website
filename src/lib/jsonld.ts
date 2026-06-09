import { siteUrl } from "@/lib/url"

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "3D Factory",
    url: siteUrl(),
    logo: siteUrl("/images/branding/logo.png"),
    description: "Custom 3D printing studio for personalized gifts, home decor, cosplay collectibles, and prototypes. Bring your ideas to life with premium 3D printed creations delivered across India.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
      contactType: "customer service",
      availableLanguage: ["en", "hi"],
    },
    sameAs: [
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    ].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  }
}