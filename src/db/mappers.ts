import type { Product, ProductCategory } from "@/types"

export interface DBProduct {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  category: string
  categoryId: string | null
  priceRange: string
  material: string
  dimensions: string
  technologies: string
  featuredImage: string
  isFeatured: boolean
  isActive: boolean
  supportsBulkOrders: boolean
  customizable: boolean
  printTime: string
  finishType: string
  productionType: string | null
  minimumOrderQuantity: string
  createdAt: string
  updatedAt: string
}

export interface DBProductImage {
  id: string
  productId: string
  imageUrl: string
  sortOrder: number
  createdAt: string
}

export function dbProductToProduct(
  row: DBProduct,
  images: DBProductImage[]
): Product {
  return {
    id: row.id,
    title: row.name,
    slug: row.slug,
    category: row.category,
    categoryId: row.categoryId ?? undefined,
    description: row.description,
    shortDescription: row.shortDescription,
    featuredImage: row.featuredImage,
    galleryImages: images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => i.imageUrl),
    priceRange: row.priceRange || undefined,
    material: row.material || undefined,
    dimensions: row.dimensions || undefined,
    technologies: parseJsonArray(row.technologies),
    featured: row.isFeatured,
    printTime: row.printTime || undefined,
    finishType: row.finishType || undefined,
    productionType: (row.productionType as Product["productionType"]) ?? undefined,
    supportsBulkOrders: row.supportsBulkOrders || undefined,
    customizable: row.customizable || undefined,
    minimumOrderQuantity: row.minimumOrderQuantity || undefined,
    createdAt: row.createdAt,
  }
}

function parseJsonArray(val: string): string[] {
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function productToDbRow(
  product: Partial<Product> & { id: string; slug: string; title: string }
): Omit<DBProduct, "createdAt" | "updatedAt"> & { id: string } {
  return {
    id: product.id,
    name: product.title,
    slug: product.slug,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    category: product.category ?? "custom",
    categoryId: product.categoryId ?? null,
    priceRange: product.priceRange ?? "",
    material: product.material ?? "",
    dimensions: product.dimensions ?? "",
    technologies: JSON.stringify(product.technologies ?? []),
    featuredImage: product.featuredImage ?? "",
    isFeatured: product.featured ?? false,
    isActive: true,
    supportsBulkOrders: product.supportsBulkOrders ?? false,
    customizable: product.customizable ?? false,
    printTime: product.printTime ?? "",
    finishType: product.finishType ?? "",
    productionType: product.productionType ?? "single",
    minimumOrderQuantity: product.minimumOrderQuantity ?? "",
  }
}
