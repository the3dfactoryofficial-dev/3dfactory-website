"use client"

import { useState, useEffect, useRef, startTransition, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Star, Quote, Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import {
  getTestimonialsAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  toggleFeaturedTestimonialAction,
} from "@/actions/testimonials"
import type { Testimonial } from "@/lib/storage/testimonial-types"
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

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={cn(
            "transition-transform duration-150",
            onChange ? "cursor-pointer hover:scale-110 active:scale-90" : "cursor-default"
          )}
        >
          <Star
            className={cn(
              "w-4 h-4",
              s <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-600"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    startTransition(() => { setLoading(true); setError("") })
    const result = await getTestimonialsAction()
    startTransition(() => {
      if (result.success) setTestimonials(result.data)
      else setError(result.error)
      setLoading(false)
    })
  }

  const refresh = useCallback(() => {
    router.refresh()
    load()
  }, [router])

  useEffect(() => { load() }, [])

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, featured: !current } : t))
    )
    const result = await toggleFeaturedTestimonialAction(id, !current)
    if (!result.success) load()
    refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return
    setDeleting(id)
    await deleteTestimonialAction(id)
    setTestimonials((prev) => prev.filter((t) => t.id !== id))
    setDeleting(null)
    refresh()
  }

  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!allowed.includes(file.type)) {
      setImageError("Invalid image type. Allowed: JPEG, PNG, WebP, AVIF")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image too large (max 5MB)")
      return
    }

    setImageUploading(true)
    setImageError("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "testimonials")
    formData.append("mediaType", "image")

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Upload failed")
      }
      const result = await res.json()
      setImageUrl(result.publicUrl)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setImageUploading(false)
    }
  }

  const featuredCount = useMemo(() => testimonials.filter((t) => t.featured).length, [testimonials])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    const form = e.currentTarget
    const fd = new FormData(form)
    if (editing) fd.set("id", editing.id)
    fd.set("imageUrl", imageUrl)
    const result = editing
      ? await updateTestimonialAction(fd)
      : await createTestimonialAction(fd)
    if (!result.success) {
      setError(result.error ?? "Failed to save")
      setSaving(false)
      return
    }
    setShowForm(false)
    setEditing(null)
    setImageUrl("")
    refresh()
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Testimonials</h1>
            <p className="text-sm text-muted mt-1">
              {testimonials.length} total ·{" "}
              {featuredCount} featured
            </p>
          </div>
          <button
onClick={() => {
            setEditing(null)
            setImageUrl("")
            setImageError("")
            setShowForm(!showForm)
          }}
            className="h-11 px-4 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97] transition-all duration-200 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleFormSubmit}
            className="mb-8 rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground">
              {editing ? "Edit Testimonial" : "New Testimonial"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="Customer name *"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <input
                name="role"
                defaultValue={editing?.role ?? ""}
                placeholder="Role (e.g. Founder)"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <input
                name="company"
                defaultValue={editing?.company ?? ""}
                placeholder="Company (e.g. Acme Corp)"
                className="w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <textarea
              name="content"
              required
              rows={3}
              defaultValue={editing?.content ?? ""}
              placeholder="Testimonial content *"
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-y"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Rating
                </label>
                <StarRating
                  rating={editing?.rating ?? 5}
                  onChange={(r) => {
                    const input = document.getElementById("rating-input") as HTMLInputElement
                    if (input) input.value = String(r)
                  }}
                />
                <input id="rating-input" name="rating" type="hidden" defaultValue={editing?.rating ?? 5} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Photo
                </label>
                {imageUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={imageUrl} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full h-20 rounded-xl border-2 border-dashed border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 cursor-pointer transition-all duration-200">
                    {imageUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-xs">Upload Photo</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                )}
                {imageError && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {imageError}
                  </div>
                )}
                <input type="hidden" name="imageUrl" value={imageUrl} />
              </div>
              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-2.5 h-11 px-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:bg-zinc-900 transition-colors w-full">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editing?.featured ?? false}
                    className="w-4 h-4 rounded border-border bg-zinc-800 accent-primary"
                  />
                  <span className="text-sm text-foreground">Featured</span>
                </label>
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
                onClick={() => { setShowForm(false); setEditing(null); setImageUrl(""); setImageError("") }}
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
            <p className="mt-4 text-sm text-muted">Loading testimonials...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={load} className="mt-4 h-10 px-4 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 transition-colors">Try Again</button>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">No testimonials yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Featured</th>
                    <th className="text-left px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors last:border-0">
                      <td className="px-5 py-4">
                        <p className="text-foreground font-medium">{t.name}</p>
                        {(t.role || t.company) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[t.role, t.company].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[250px]">
                          &ldquo;{t.content}&rdquo;
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StarRating rating={t.rating} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleFeatured(t.id, t.featured)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors",
                            t.featured
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300"
                          )}
                        >
                          <Star className={cn("w-3 h-3", t.featured && "fill-amber-400")} />
                          {t.featured ? "Featured" : "Set Featured"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
onClick={() => { setEditing(t); setImageUrl(t.imageUrl); setImageError(""); setShowForm(true) }}
                             className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deleting === t.id}
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
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-2xl bg-surface border border-border p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                      {(t.role || t.company) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {[t.role, t.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <StarRating rating={t.rating} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
                    <button
                      onClick={() => handleToggleFeatured(t.id, t.featured)}
                      className={cn(
                        "h-11 w-11 inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 border",
                        t.featured
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-800 border-border/50"
                      )}
                      title={t.featured ? "Remove featured" : "Set as featured"}
                    >
                      <Star className={cn("w-4 h-4", t.featured && "fill-amber-400")} />
                    </button>
                    <button onClick={() => { setEditing(t); setImageUrl(t.imageUrl); setImageError(""); setShowForm(true) }} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 border border-border/50"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200 border border-border/50 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
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
