import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { organizationJsonLd } from "@/lib/jsonld"
import "./globals.css"

const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ??
  "https://res.cloudinary.com/dxfendyyq/image/upload/q_auto,f_auto/v1/3dfactory/products/ozyr7yuseyrvqhynaqm"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "3D Factory | Custom 3D Creations Studio",
    template: "%s | 3D Factory",
  },
  description:
    "Custom 3D printing studio for personalized gifts, home decor, cosplay collectibles, prototypes and more. Bring your ideas to life — order via WhatsApp.",
  keywords: [
    "custom 3D printing India",
    "3D printed gifts",
    "personalized decor",
    "3D printed collectibles",
    "cosplay props",
    "custom creations",
    "3D printing studio India",
    "unique gift ideas",
    "custom 3D models",
  ],
  openGraph: {
    siteName: "3D Factory",
    type: "website",
    locale: "en_IN",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Factory | Custom 3D Creations Studio",
    description:
      "Custom 3D printing studio for personalized gifts, home decor, cosplay collectibles, prototypes and more. Bring your ideas to life.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
}
