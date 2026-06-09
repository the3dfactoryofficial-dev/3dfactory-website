import type { Metadata } from "next"
import { siteUrl } from "@/lib/url"

interface SEOProps {
  title: string
  description: string
  path?: string
  image?: string
}

const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ??
  "https://res.cloudinary.com/dxfendyyq/image/upload/q_auto,f_auto/v1/3dfactory/products/ozyr7yuseyrvqhynaqm"

export function generateMetadata({
  title,
  description,
  path,
  image,
}: SEOProps): Metadata {
  const url = siteUrl(path)
  const ogImage = image ?? DEFAULT_OG_IMAGE

  return {
    title,
    description,
    openGraph: {
      title: `${title} | 3D Factory`,
      description,
      url,
      siteName: "3D Factory",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | 3D Factory`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  }
}
