"use client"

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, startTransition, useCallback, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Star, Package, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  getProductsAction,
  deleteProductAction,
  toggleFeaturedAction,
  reorderProductsAction,
} from "@/actions/products"
import type { Product } from "@/types"
import { PRODUCT_CATEGORIES } from "@/types"
import { getCategoriesAction } from "@/actions/categories"
import type { CategoryRow } from "@/db/queries/categories"
import { optimizeImage } from "@/lib/cloudinary-utils"
import { cn } from "@/lib/utils"

const ProductFormModal = dynamic(() => import("./ProductFormModal").then((m) => ({ default: m.ProductFormModal })), {
  ssr: false,
})

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function CategoryBadge({ category, categoryId, categoryMap: map, isInactive }: { category: string; categoryId?: string; categoryMap?: Record<string, string>; isInactive?: boolean }) {
  const label = (categoryId && map?.[categoryId]) ?? PRODUCT_CATEGORIES.find((c) => c.value === category)?.label ?? category
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
        {label}
      </span>
      {isInactive && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
          Inactive
        </span>
      )}
    </div>
  )
}

function SortableProductRow({ product, onToggleFeatured, onEdit, onDelete, isDeleting, categoryMap, activeCategoryIds }: {
  product: Product
  onToggleFeatured: (id: string, current: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  isDeleting: boolean
  categoryMap: Record<string, string>
  activeCategoryIds: Set<string>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-border/50 hover:bg-surface/30 transition-colors last:border-0",
        isDragging && "opacity-50 bg-surface shadow-lg z-50 relative"
      )}
    >
      <td className="px-2 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {product.featuredImage && (
            <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
              <img
                src={optimizeImage(product.featuredImage, 120)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-foreground font-medium">
              {product.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              /{product.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <CategoryBadge category={product.category} categoryId={product.categoryId} categoryMap={categoryMap} isInactive={!!product.categoryId && !activeCategoryIds.has(product.categoryId)} />
      </td>
      <td className="px-5 py-4 text-foreground">
        {product.priceRange || "\u2014"}
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onToggleFeatured(product.id, !!product.featured)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
            product.featured
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300"
          }`}
        >
          <Star className={`w-3 h-3 ${product.featured ? "fill-amber-400" : ""}`} />
          {product.featured ? "Featured" : "Set Featured"}
        </button>
      </td>
      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(product.createdAt)}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(product)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            disabled={isDeleting}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function SortableProductCard({ product, onToggleFeatured, onEdit, onDelete, isDeleting, categoryMap, activeCategoryIds }: {
  product: Product
  onToggleFeatured: (id: string, current: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  isDeleting: boolean
  categoryMap: Record<string, string>
  activeCategoryIds: Set<string>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl bg-surface border border-border p-4 transition-shadow",
        isDragging && "opacity-50 shadow-lg z-50 relative"
      )}
    >
      <div className="flex items-start gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 p-1 mt-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {product.featuredImage && (
          <div className="w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
            <img
              src={optimizeImage(product.featuredImage, 120)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {product.title}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            /{product.slug}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <CategoryBadge category={product.category} categoryId={product.categoryId} categoryMap={categoryMap} isInactive={!!product.categoryId && !activeCategoryIds.has(product.categoryId)} />
            {product.priceRange && (
              <span className="text-xs text-muted-foreground">
                {product.priceRange}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-border ml-8">
        <button
          onClick={() => onToggleFeatured(product.id, !!product.featured)}
          className={cn(
            "h-11 w-11 inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 border",
            product.featured
              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-zinc-800 border-border/50"
          )}
          title={product.featured ? "Remove featured" : "Set as featured"}
        >
          <Star className={cn("w-4 h-4", product.featured && "fill-amber-400")} />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 border border-border/50"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          disabled={isDeleting}
          className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200 border border-border/50 disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<string>>(new Set())
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadProducts = useCallback(async () => {
    startTransition(() => { setLoading(true); setError("") })
    const [prodResult, catResult] = await Promise.all([
      getProductsAction(),
      getCategoriesAction(),
    ])
    startTransition(() => {
      if (prodResult.success) {
        setProducts(prodResult.data)
      } else {
        setError(prodResult.error)
      }
      if (catResult.success) {
        const map: Record<string, string> = {}
        const active: string[] = []
        for (const c of catResult.data) {
          map[c.id] = c.name
          if (c.isActive) active.push(c.id)
        }
        setCategoryMap(map)
        setActiveCategoryIds(new Set(active))
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  useEffect(() => {
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current)
    }
  }, [])

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current)
    reloadTimer.current = setTimeout(() => { loadProducts() }, 1000)
  }, [loadProducts])

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const product = products.find((p) => p.id === id)
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !current } : p))
    )
    const result = await toggleFeaturedAction(id, !current, product?.slug)
    if (!result.success) {
      loadProducts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const product = products.find((p) => p.id === id)
    setDeleting(id)
    const result = await deleteProductAction(id, product?.slug)
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      scheduleReload()
    } else {
      alert(result.error ?? "Failed to delete")
    }
    setDeleting(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...products]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    setProducts(reordered)

    const result = await reorderProductsAction(
      reordered.map((p) => p.id)
    )
    if (!result.success) {
      loadProducts()
    }
    scheduleReload()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingProduct(null)
    loadProducts()
  }

  const featuredCount = useMemo(() => products.filter((p) => p.featured).length, [products])

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted mt-1">
              {products.length} total · {featuredCount} featured ·{" "}
              <span className="text-muted-foreground/60">Drag to reorder</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              className="h-11 px-4 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-[0.97] transition-all duration-150 border border-border select-none"
            >
              Refresh
            </button>
            <button
              onClick={handleCreate}
              className="h-11 px-4 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97] transition-all duration-150 inline-flex items-center gap-2 select-none"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-muted">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 h-10 px-4 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">
              No products yet.
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 h-10 px-4 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="w-10 px-2 py-4"></th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {products.map((product) => (
                      <SortableProductRow
                        key={product.id}
                        product={product}
                        onToggleFeatured={handleToggleFeatured}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deleting === product.id}
                        categoryMap={categoryMap}
                        activeCategoryIds={activeCategoryIds}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {products.map((product) => (
                  <SortableProductCard
                    key={product.id}
                    product={product}
                    onToggleFeatured={handleToggleFeatured}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deleting === product.id}
                    categoryMap={categoryMap}
                    activeCategoryIds={activeCategoryIds}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}