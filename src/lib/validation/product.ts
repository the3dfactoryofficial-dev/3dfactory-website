import { z } from "zod"

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().max(5000).default(""),
  shortDescription: z.string().max(300).default(""),
  category: z.string().min(1, "Category is required"),
  categoryId: z.string().optional(),
  priceRange: z.string().max(100).default(""),
  material: z.string().max(200).default(""),
  dimensions: z.string().max(200).default(""),
  technologies: z.array(z.string()).default([]),
  featuredImage: z.string().max(500).default(""),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(false),
  supportsBulkOrders: z.boolean().default(false),
  customizable: z.boolean().default(false),
  printTime: z.string().max(100).default(""),
  finishType: z.string().max(100).default(""),
  productionType: z
    .enum(["prototype", "single", "batch", "custom"])
    .default("single"),
  minimumOrderQuantity: z.string().max(100).default(""),
  galleryImages: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(999),
})

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1),
})

export const ToggleFeaturedSchema = z.object({
  id: z.string().min(1),
  isFeatured: z.boolean(),
})

export type CreateProductData = z.infer<typeof CreateProductSchema>
export type UpdateProductData = z.infer<typeof UpdateProductSchema>
