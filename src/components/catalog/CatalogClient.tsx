"use client"

import { useMemo, useCallback, useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { Package, MessageCircle } from "lucide-react"
import { ProductCard } from "@/components/catalog/ProductCard"
import { CategoryFilter } from "@/components/catalog/CategoryFilter"
import { getActiveCategoriesAction } from "@/actions/categories"
import type { Product } from "@/types"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { trackWhatsAppClick } from "@/lib/analytics"

export const CatalogClient = memo(function CatalogClient({
  products,
  initialCategory = null,
}: {
  products: Product[]
  initialCategory?: string | null
}) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory)
  const [slugMap, setSlugMap] = useState<Record<string, string>>({})

  useEffect(() => {
    getActiveCategoriesAction().then((result) => {
      if (result.success) {
        const map: Record<string, string> = {}
        for (const c of result.data) {
          map[c.slug] = c.name
        }
        setSlugMap(map)
      }
    })
  }, [])

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search)
      setActiveCategory(params.get("category"))
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products

  const handleCategoryChange = useCallback(
    (category: string | null) => {
      setActiveCategory(category)
      const params = new URLSearchParams(window.location.search)
      if (category && category !== "all") {
        params.set("category", category)
      } else {
        params.delete("category")
      }
      const query = params.toString()
      router.replace(query ? `/catalog?${query}` : "/catalog")
    },
    [router]
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const [slug] of Object.entries(slugMap)) {
      counts[slug] = products.filter((p) => p.category === slug).length
    }
    counts.all = products.length
    return counts
  }, [products, slugMap])

  return (
    <>
      <section className="pt-28 pb-12 md:pt-36 md:pb-20">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Our Collection
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted max-w-lg mx-auto leading-relaxed">
              Every piece is produced in-house — from spiritual decor and
              cosplay collectibles to precision engineering prototypes.
            </p>

            <div className="mt-6">
              <CategoryFilter
                active={activeCategory}
                onChange={handleCategoryChange}
                counts={categoryCounts}
                slugMap={slugMap}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-main">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} categoryLabel={slugMap[product.category] ?? product.category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="mt-4 text-base text-muted-foreground">
                No products found in this category yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Check back soon — we&apos;re always adding new designs.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container-main">
          <div className="max-w-xl mx-auto text-center rounded-2xl bg-surface border border-border p-10 md:p-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Have Something Specific in Mind?
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              Don&apos;t see what you&apos;re looking for? We love custom
              projects. Share your idea and we&apos;ll create a quote just for
              you.
            </p>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hi! I'd like to discuss a custom 3D printing project.")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("catalog_cta")}
              className={cn(
                "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-lg mt-6",
                "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97]",
                "transition-all duration-200 select-none"
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Get a Custom Quote</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}, (prevProps, nextProps) => prevProps.products === nextProps.products)
