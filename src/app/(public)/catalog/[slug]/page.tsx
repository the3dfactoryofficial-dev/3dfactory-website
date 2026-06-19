import { notFound } from "next/navigation"
import { getProductBySlug, getProductsByCategory, getProductVideos } from "@/data/products"
import { siteUrl } from "@/lib/url"
import { breadcrumbJsonLd } from "@/lib/jsonld"
import { ProductPageGallery } from "@/components/catalog/ProductPageGallery"
import { ProductCard } from "@/components/catalog/ProductCard"
import { ProductPageCTA } from "@/components/catalog/ProductPageCTA"
import { BackButton } from "@/components/ui/BackButton"
import type { Metadata } from "next"

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const title = product.title
  const description =
    product.shortDescription ||
    `Premium custom 3D printed ${product.category.replace("-", " ")} crafted with ${product.material || "high-quality materials"}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteUrl(`/catalog/${slug}`),
      siteName: "3D Factory",
      type: "website",
      images: product.featuredImage ? [{ url: product.featuredImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.featuredImage ? [product.featuredImage] : undefined,
    },
    alternates: {
      canonical: siteUrl(`/catalog/${slug}`),
    },
    keywords: [
      `3D printed ${product.category.replace("-", " ")}`,
      product.material,
      ...(product.technologies ?? []),
      "3D printing India",
      "custom 3D creations",
    ]
      .filter(Boolean)
      .join(", "),
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const allInCategory = await getProductsByCategory(product.category)
  const related = allInCategory.filter((p) => p.slug !== slug).slice(0, 4)
  const allImages = [product.featuredImage, ...(product.galleryImages ?? [])].filter(Boolean)
  const productVids = await getProductVideos(product.id)

  const productionLabel = (
    {
      prototype: "Prototype / One-Off",
      single: "Single Unit Production",
      batch: "Batch Production Available",
      custom: "Custom Order",
    } as const
  )[product.productionType ?? "single"]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.shortDescription,
    image: allImages,
    category: product.category.replace("-", " "),
    material: product.material,
    brand: { "@type": "Brand", name: "3D Factory" },
    offers: product.priceRange
      ? {
          "@type": "Offer",
          price: product.priceRange.replace(/[^0-9.]/g, ""),
          priceCurrency: "INR",
          availability: "https://schema.org/MadeToOrder",
        }
      : undefined,
  }

  const breadCrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Catalog", path: "/catalog" },
    { name: product.title, path: `/catalog/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadCrumbs) }}
      />

      <article className="pb-28 md:pb-0">
        <section className="pt-[7.5rem] md:pt-24">
          <div className="container-main">
            <BackButton fallbackHref="/catalog" sticky className="mb-4 md:mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <ProductPageGallery images={allImages} title={product.title} />

              <div className="flex flex-col justify-center py-8 lg:py-16">
                <span className="inline-flex self-start items-center px-3 py-1 text-[11px] font-medium tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                  {product.category.replace("-", " ")}
                </span>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {product.title}
                </h1>

                <p className="mt-4 text-base text-muted leading-relaxed max-w-lg">
                  {product.shortDescription}
                </p>

                {product.priceRange && (
                  <p className="mt-4 text-lg font-semibold text-foreground">
                    From{" "}
                    <span className="text-primary">{product.priceRange}</span>
                  </p>
                )}

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {product.material && (
                    <div className="rounded-xl bg-surface border border-border p-4">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                        Material
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {product.material}
                      </p>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="rounded-xl bg-surface border border-border p-4">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                        Dimensions
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {product.dimensions}
                      </p>
                    </div>
                  )}
                  {product.printTime && (
                    <div className="rounded-xl bg-surface border border-border p-4">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                        Print Time
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {product.printTime}
                      </p>
                    </div>
                  )}
                  {product.finishType && (
                    <div className="rounded-xl bg-surface border border-border p-4">
                      <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                        Finish
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {product.finishType}
                      </p>
                    </div>
                  )}
                </div>

                {product.technologies && product.technologies.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-2">
                      Technologies Used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-zinc-800 text-muted-foreground border border-border/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-zinc-800 text-muted-foreground border border-border/50">
                    {productionLabel}
                  </span>
                  {product.supportsBulkOrders && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Bulk Orders Accepted
                    </span>
                  )}
                  {product.customizable && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Customizable
                    </span>
                  )}
                </div>

                {product.minimumOrderQuantity && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Minimum order: {product.minimumOrderQuantity}
                  </p>
                )}

                <div className="mt-8">
                  <ProductPageCTA
                    productId={product.id}
                    productName={product.title}
                    productSlug={slug}
                    categoryLabel={product.category.replace("-", " ")}
                    featuredImage={product.featuredImage}
                    priceRange={product.priceRange}
                  />
                  <a
                    href={`/catalog?category=${product.category}`}
                    className="mt-3 inline-flex items-center justify-center gap-2 h-13 px-8 text-base font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-[0.97] border border-border transition-all duration-200"
                  >
                    View Similar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {product.description && (
          <section className="py-16 md:py-20">
            <div className="container-main">
              <div className="max-w-3xl">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  About This Piece
                </h2>
                <p className="text-base text-muted leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-20 bg-zinc-900/30 border-y border-border">
          <div className="container-main">
            <h2 className="text-xl font-semibold text-foreground mb-8">
              Craft Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.material && (
                <div className="rounded-2xl bg-surface border border-border p-5">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                    Material
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {product.material}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/60">
                    Selected for durability and finish quality
                  </p>
                </div>
              )}
              {product.finishType && (
                <div className="rounded-2xl bg-surface border border-border p-5">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                    Finish
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {product.finishType}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/60">
                    Post-processing for a premium look and feel
                  </p>
                </div>
              )}
              {product.technologies && product.technologies.length > 0 && (
                <div className="rounded-2xl bg-surface border border-border p-5">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                    Technology
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {product.technologies[0]}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/60">
                    Precision 3D printing with premium materials
                  </p>
                </div>
              )}
              <div className="rounded-2xl bg-surface border border-border p-5">
                <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
                  Craft Type
                </p>
                <p className="text-sm font-medium text-foreground">
                  {productionLabel}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  {product.supportsBulkOrders
                    ? "Available for custom orders at scale"
                    : "Made on request, just for you"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {productVids.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="container-main">
              <h2 className="text-xl font-semibold text-foreground mb-8">
                Watch Product Preview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {productVids.map((v) => (
                  <div
                    key={v.id}
                    className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-border"
                  >
                    <video
                      src={v.videoUrl}
                      poster={v.thumbnailUrl || undefined}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="pb-20 md:pb-28 pt-16">
            <div className="container-main">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Related Products
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    More from {product.category.replace("-", " ")}
                  </p>
                </div>
                <a
                  href={`/catalog?category=${product.category}`}
                  className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  View All →
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}


      </article>
    </>
  )
}
