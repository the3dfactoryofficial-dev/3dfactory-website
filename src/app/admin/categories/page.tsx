"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Tag, Eye, EyeOff } from "lucide-react"
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
  moveCategoryAction,
} from "@/actions/categories"
import type { CategoryRow } from "@/db/queries/categories"
import { cn } from "@/lib/utils"

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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [moving, setMoving] = useState<string | null>(null)

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

  const handleMove = async (id: string, direction: "up" | "down") => {
    const currentList = [...categories]
    const idx = currentList.findIndex((c) => c.id === id)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= currentList.length) return

    setMoving(id)
    const optimistic = [...currentList]
    ;[optimistic[idx], optimistic[swapIdx]] = [optimistic[swapIdx], optimistic[idx]]
    setCategories(optimistic)

    const result = await moveCategoryAction(id, direction)
    if (!result.success) {
      setCategories(currentList)
    } else {
      await load()
    }
    setMoving(null)
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
              {categories.filter((c) => c.isActive).length} active
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
            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                    <th className="text-right px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors last:border-0">
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
                          onClick={() => handleToggleActive(cat.id, cat.isActive)}
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
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {cat.sortOrder}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleMove(cat.id, "up")}
                            disabled={index === 0 || moving !== null}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(cat.id, "down")}
                            disabled={index === categories.length - 1 || moving !== null}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditing(cat); setShowForm(true) }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deleting === cat.id}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {categories.map((cat, index) => (
                <div key={cat.id} className="rounded-2xl bg-surface border border-border p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
                      <code className="text-xs text-muted-foreground">/{cat.slug}</code>
                    </div>
                    <button
                      onClick={() => handleToggleActive(cat.id, cat.isActive)}
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
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Order: {cat.sortOrder}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleMove(cat.id, "up")} disabled={index === 0 || moving !== null} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 border border-border/50 disabled:opacity-30 disabled:pointer-events-none" title="Move up"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => handleMove(cat.id, "down")} disabled={index === categories.length - 1 || moving !== null} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 border border-border/50 disabled:opacity-30 disabled:pointer-events-none" title="Move down"><ArrowDown className="w-4 h-4" /></button>
                      <button onClick={() => { setEditing(cat); setShowForm(true) }} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 border border-border/50"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200 border border-border/50 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}