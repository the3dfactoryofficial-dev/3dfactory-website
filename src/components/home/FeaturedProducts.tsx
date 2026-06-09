import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { FeaturedGallery } from "@/components/home/FeaturedGallery"
import type { Product } from "@/types"

export function FeaturedProducts({ featured }: { featured: Product[] }) {
  return (
    <Section id="featured-products" dark>
      <Heading
        eyebrow="Featured"
        title="Featured Creations"
        subtitle="A curated selection of our recent builds — from spiritual decor and cosplay collectibles to precision engineering prototypes and custom production runs."
      />

      <div className="mt-12 md:mt-16 relative">
        <FeaturedGallery products={featured} />
      </div>
    </Section>
  )
}
