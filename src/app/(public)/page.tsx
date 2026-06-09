import { getFeaturedProducts } from "@/data/products"
import { getFeaturedTestimonials } from "@/data/testimonials"
import { generateMetadata } from "@/lib/seo"
import { Hero } from "@/components/home/Hero"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { WhyChooseUs } from "@/components/home/WhyChooseUs"
import { Materials } from "@/components/home/Materials"
import { Testimonials } from "@/components/home/Testimonials"
import { FAQ } from "@/components/home/FAQ"
import { InstagramTrust } from "@/components/home/InstagramTrust"
import { TrustSection } from "@/components/home/TrustSection"
import { ManufacturingCapabilities } from "@/components/home/ManufacturingCapabilities"
import { CTABanner } from "@/components/home/CTABanner"
import { faqItems } from "@/data/faq"

export const revalidate = 3600

export const metadata = generateMetadata({
  title: "Custom 3D Creations Studio — Personalized Gifts, Decor & Collectibles",
  description:
    "Custom 3D printing studio for personalized gifts, home decor, cosplay collectibles, and prototypes. Bring your ideas to life with premium 3D printed creations delivered across India.",
  path: "/",
})

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

export default async function Home() {
  const [featured, testimonials] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedTestimonials(),
  ])
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <FeaturedProducts featured={featured} />
      <WhyChooseUs />
      <Materials />
      <Testimonials testimonials={testimonials} />
      <TrustSection />
      <ManufacturingCapabilities />
      <FAQ />
      <InstagramTrust />
      <CTABanner />
    </>
  )
}
