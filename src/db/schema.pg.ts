import { pgTable, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "string" }),
})

export const inquiries = pgTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  product: text("product").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(1),
  preferredSize: text("preferred_size").notNull().default(""),
  customizable: boolean("customizable").notNull().default(false),
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
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
})

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  category: text("category", {
    enum: ["spiritual-decor", "cosplay", "prototypes", "custom"],
  }).notNull(),
  priceRange: text("price_range").notNull().default(""),
  material: text("material").notNull().default(""),
  dimensions: text("dimensions").notNull().default(""),
  technologies: text("technologies").notNull().default("[]"),
  featuredImage: text("featured_image").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(false),
  supportsBulkOrders: boolean("supports_bulk_orders").notNull().default(false),
  customizable: boolean("customizable").notNull().default(false),
  printTime: text("print_time").notNull().default(""),
  finishType: text("finish_type").notNull().default(""),
  productionType: text("production_type", {
    enum: ["prototype", "single", "batch", "custom"],
  }).default("single"),
  minimumOrderQuantity: text("minimum_order_quantity").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  sortOrder: integer("sort_order").notNull().default(999),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
}, (table) => ({
  isActiveIdx: index("idx_products_is_active").on(table.isActive),
  isFeaturedIdx: index("idx_products_is_featured").on(table.isFeatured),
  categoryIdx: index("idx_products_category").on(table.category),
}))

export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
}, (table) => ({
  productIdIdx: index("idx_product_images_product_id").on(table.productId),
}))

export const testimonials = pgTable("testimonials", {
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
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
}, (table) => ({
  featuredIdx: index("idx_testimonials_featured").on(table.featured),
  productIdIdx: index("idx_testimonials_product_id").on(table.productId),
}))

export const productVideos = pgTable("product_videos", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
})

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
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
