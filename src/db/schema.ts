import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
  updatedAt: text("updated_at")
    .notNull()
    .default("(datetime('now'))"),
  lastLoginAt: text("last_login_at"),
})

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  product: text("product").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(1),
  preferredSize: text("preferred_size").notNull().default(""),
  customizable: integer("customizable", { mode: "boolean" })
    .notNull()
    .default(false),
  message: text("message").notNull().default(""),
  sourcePage: text("source_page").notNull(),
  source: text("source").notNull().default("unknown"),
  attachments: text("attachments").notNull().default("[]"),
  status: text("status", {
    enum: ["new", "contacted", "quoted", "completed"],
  })
    .notNull()
    .default("new"),
  userId: text("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
})

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  category: text("category").notNull(),
  priceRange: text("price_range").notNull().default(""),
  material: text("material").notNull().default(""),
  dimensions: text("dimensions").notNull().default(""),
  technologies: text("technologies").notNull().default("[]"),
  featuredImage: text("featured_image").notNull().default(""),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .notNull()
    .default(false),
  isActive: integer("is_active", { mode: "boolean" })
    .notNull()
    .default(false),
  supportsBulkOrders: integer("supports_bulk_orders", { mode: "boolean" })
    .notNull()
    .default(false),
  customizable: integer("customizable", { mode: "boolean" })
    .notNull()
    .default(false),
  printTime: text("print_time").notNull().default(""),
  finishType: text("finish_type").notNull().default(""),
  productionType: text("production_type", {
    enum: ["prototype", "single", "batch", "custom"],
  }).default("single"),
  minimumOrderQuantity: text("minimum_order_quantity").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
  sortOrder: integer("sort_order").notNull().default(999),
  updatedAt: text("updated_at")
    .notNull()
    .default("(datetime('now'))"),
})

export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
})

export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  company: text("company").notNull().default(""),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  imageUrl: text("image_url").notNull().default(""),
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
  updatedAt: text("updated_at")
    .notNull()
    .default("(datetime('now'))"),
})

export const productVideos = sqliteTable("product_videos", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
})

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
})

export const productRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  videos: many(productVideos),
  categoryRel: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const productVideoRelations = relations(productVideos, ({ one }) => ({
  product: one(products, {
    fields: [productVideos.productId],
    references: [products.id],
  }),
}))

export const testimonialRelations = relations(testimonials, ({ one }) => ({
  product: one(products, {
    fields: [testimonials.productId],
    references: [products.id],
  }),
}))

export const userRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
}))

export const inquiryRelations = relations(inquiries, ({ one }) => ({
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
}))
