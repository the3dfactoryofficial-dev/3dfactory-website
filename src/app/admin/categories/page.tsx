"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Pencil, Trash2, GripVertical, Tag, Eye, EyeOff } from "lucide-react"
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

function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= breakpoint)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])
  return isDesktop
}
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
  reorderCategoriesAction,
} from "@/actions/categories"
import type { CategoryRow } from "@/db/queries/categories"
import { cn } from "@/lib/utils"

function SortableItem({ cat, index, total, onToggle, onDelete, onEdit, isDeleting }: {
  cat: CategoryRow
  index: number
  total: number
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onEdit: (cat: CategoryRow) => void
  isDeleting: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id })

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
        <p className="text-foreground font-medium">{cat.name}</p>
      </td>
      <td className="px-5 py-4">
        <code className="text-xs text-muted-foreground">/{cat.slug}</code>
      </td>
      <td className="px-5 py-4">
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[250px]">
          {cat.description || "\u2014"}
        </p>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onToggle(cat.id, cat.isActive)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors",
            cat.isActive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300"
          )}
        >
          {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {cat.isActive ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(cat)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(cat.id)}
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

function SortableCard({ cat, index, total, onToggle, onDelete, onEdit, isDeleting }: {
  cat: CategoryRow
  index: number
  total: number
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onEdit: (cat: CategoryRow) => void
  isDeleting: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id })

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
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 p-1"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
            <code className="text-xs text-muted-foreground">/{cat.slug}</code>
          </div>
        </div>
        <button
          onClick={() => onToggle(cat.id, cat.isActive)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors shrink-0",
            cat.isActive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-zinc-800 text-zinc-500 border-zinc-700"
          )}
        >
          {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {cat.isActive ? "Active" : "Inactive"}
        </button>
      </div>
      {cat.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 ml-8">{cat.description}</p>
      )}
      <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-border ml-8">
        <button onClick={() => onEdit(cat)} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 border border-border/50">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(cat.id)} disabled={isDeleting} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200 border border-border/50 disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDesktop = useIsDesktop()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = useCallback(async () => {
    setError("")
    const result = await getCategoriesAction()
    if (result.success) {
      setCategories(result.data)
      setLoading(false)
    } else {
      setError(result.error)
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current)
    }
  }, [])

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current)
    reloadTimer.current = setTimeout(() => { load() }, 1000)
  }, [load])

  const handleToggleActive = async (id: string, current: boolean) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
    )
    const result = await toggleCategoryActiveAction(id, current)
    if (!result.success) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: current } : c))
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products using it will have their category_id set to null.")) return
    setDeleting(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    const result = await deleteCategoryAction(id)
    if (!result.success) {
      await load()
    }
    setDeleting(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...categories]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    setCategories(reordered)

    const result = await reorderCategoriesAction(
      reordered.map((c) => c.id)
    )
    if (!result.success) {
      await load()
    }
    scheduleReload()
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    const form = e.currentTarget
    const fd = new FormData(form)
    if (editing) fd.set("id", editing.id)
    const result = editing
      ? await updateCategoryAction(fd)
      : await createCategoryAction(fd)
    if (!result.success) {
      setError(result.error ?? "Failed to save")
      setSaving(false)
      return
    }
    setShowForm(false)
    setEditing(null)
    await load()
    setSaving(false)
  }

  const handleAutoSlug = (name: string) => {
    const slugInput = document.getElementById("cat-slug") as HTMLInputElement
    if (slugInput && !slugInput.dataset.manuallyEdited) {
      slugInput.value = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Categories</h1>
            <p className="text-sm text-muted mt-1">
              {categories.length} total ·{" "}
              {categories.filter((c) => c.isActive).length} active ·{" "}
              <span className="text-muted-foreground/60">Drag to reorder</span>
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(!showForm) }}
            className="h-11 px-4 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97] transition-all duration-200 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleFormSubmit}
            className="mb-8 rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">
              {editing ? "Edit Category" : "New Category"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label htmlFor="cat-name" className="block text-xs font-medium text-muted-foreground mb-1.5">Name *</label>
                <input
                  id="cat-name"
                  name="name"
                  required
                  defaultValue={editing?.name ?? ""}
                  onChange={(e) => handleAutoSlug(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="Cosplay & Props"
                />
              </div>
              <div>
                <label htmlFor="cat-slug" className="block text-xs font-medium text-muted-foreground mb-1.5">Slug *</label>
                <input
                  id="cat-slug"
                  name="slug"
                  required
                  defaultValue={editing?.slug ?? ""}
                  onFocus={(e) => { e.currentTarget.dataset.manuallyEdited = "true" }}
                  className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="cosplay-props"
                />
              </div>
              <div>
                <label htmlFor="cat-description" className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <input
                  id="cat-description"
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="Category description"
                />
              </div>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="h-11 px-5 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-[0.97] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97] transition-all duration-200 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-muted">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={load} className="mt-4 h-10 px-4 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 transition-colors">Try Again</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">No categories yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {isDesktop ? (
                <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface border-b border-border">
                        <th className="w-10 px-2 py-4"></th>
                        <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                        <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                        <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-right px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                      <tbody>
                        {categories.map((cat, index) => (
                          <SortableItem
                            key={cat.id}
                            cat={cat}
                            index={index}
                            total={categories.length}
                            onToggle={handleToggleActive}
                            onDelete={handleDelete}
                            onEdit={(c) => { setEditing(c); setShowForm(true) }}
                            isDeleting={deleting === cat.id}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              ) : (
                <div className="md:hidden space-y-3">
                  <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {categories.map((cat, index) => (
                      <SortableCard
                        key={cat.id}
                        cat={cat}
                        index={index}
                        total={categories.length}
                        onToggle={handleToggleActive}
                        onDelete={handleDelete}
                        onEdit={(c) => { setEditing(c); setShowForm(true) }}
                        isDeleting={deleting === cat.id}
                      />
                    ))}
                  </SortableContext>
                </div>
              )}
            </DndContext>
          </>
        )}
      </div>
    </div>
  )
}