export interface Product {
  id: string
  title: string
  slug: string
  category: ProductCategory
  categoryId?: string
  description: string
  shortDescription: string
  featuredImage: string
  galleryImages?: string[]
  priceRange?: string
  material?: string
  dimensions?: string
  technologies?: string[]
  featured?: boolean
  isActive?: boolean
  sortOrder?: number
  createdAt: string
  printTime?: string
  finishType?: string
  productionType?: "prototype" | "single" | "batch" | "custom"
  supportsBulkOrders?: boolean
  customizable?: boolean
  minimumOrderQuantity?: string
}

export type ProductCategory = string

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "spiritual-decor", label: "Spiritual Decor" },
  { value: "cosplay", label: "Cosplay & Props" },
  { value: "prototypes", label: "Prototypes & Engineering" },
  { value: "custom", label: "Custom Orders" },
]
