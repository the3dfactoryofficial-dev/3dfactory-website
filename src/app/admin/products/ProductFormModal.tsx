"use client"

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, useCallback, startTransition } from "react"
import { X, Upload, Loader2, ChevronDown, ChevronRight, ImageIcon, Video, Settings, DollarSign, CheckCircle2, AlertCircle, FileImage, CloudUpload } from "lucide-react"
import {
  createProductAction,
  updateProductAction,
  getProductVideosAction,
} from "@/actions/products"
import { uploadToStorageWithProgress, type AbortableStorageUpload as AbortableUpload } from "@/lib/storage-upload"
import { optimizeImage, getBlurBackgroundStyle } from "@/lib/cloudinary-utils"
import { getCategoriesAction } from "@/actions/categories"
import type { CategoryRow } from "@/db/queries/categories"
import type { Product } from "@/types"
import { lockBodyScroll, unlockBodyScroll } from "@/lib/ui/scroll-lock"
import { cn } from "@/lib/utils"

interface ProductFormModalProps {
  product: Product | null
  onClose: () => void
}

type UploadState = "idle" | "preparing" | "uploading" | "success" | "error"

interface UploadInfo {
  state: UploadState
  progress: number
  error?: string
}

  const inputClass =
    "w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"

const selectClass =
    "w-full h-11 px-3.5 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"

const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5"

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const MAX_VIDEO_MB = 100

function validateVideoFileSize(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid video type. Allowed: MP4, WebM, MOV` }
  }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    return { valid: false, error: `Video too large (max ${MAX_VIDEO_MB}MB)` }
  }
  return { valid: true }
}

function SectionHeader({
  icon: Icon,
  title,
  open,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2.5 w-full py-3 px-4 -mx-4 sm:-mx-6 text-sm font-semibold text-foreground hover:bg-zinc-800/50 transition-colors rounded-none"
    >
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="flex-1 text-left">{title}</span>
      {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
      <div
        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function UploadDropZone({
  onFiles,
  disabled,
  label,
  multiple,
  uploading,
}: {
  onFiles: (files: FileList) => void
  disabled: boolean
  label: string
  multiple: boolean
  uploading: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files)
    }
  }, [onFiles])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-2 w-full h-24 sm:h-28 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
        dragging
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50",
        (disabled || uploading) && "opacity-50 pointer-events-none"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = "" }}
      />
      {uploading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Upload className="w-5 h-5" />
      )}
      <span className="text-sm">{uploading ? "Uploading..." : label}</span>
      {!uploading && <span className="text-[11px] text-muted-foreground/50">or drag and drop</span>}
    </div>
  )
}

function ImagePreview({
  src,
  onRemove,
  size = "sm",
}: {
  src: string
  onRemove?: () => void
  size?: "sm" | "md"
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={cn("relative group", size === "sm" ? "w-full" : "inline-block")}>
      <div
        className={cn(
          "rounded-xl bg-zinc-800 overflow-hidden border border-border",
          size === "sm" ? "aspect-square" : "w-24 h-24 sm:w-28 sm:h-28"
        )}
        style={getBlurBackgroundStyle(src)}
      >
        <img
          src={optimizeImage(src, size === "sm" ? 300 : 300)}
          alt=""
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 md:w-6 md:h-6 rounded-full bg-red-500/80 text-white hover:bg-red-500 active:scale-90 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 opacity-100"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<CategoryRow[]>([])

  const [featuredImage, setFeaturedImage] = useState(product?.featuredImage ?? "")
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.galleryImages ?? [])
  const [videos, setVideos] = useState<string[]>([])
  const [videosLoaded, setVideosLoaded] = useState(!product)
  const [featuredUpload, setFeaturedUpload] = useState<UploadInfo>({ state: "idle", progress: 0 })
  const [galleryUploads, setGalleryUploads] = useState<Record<number, UploadInfo>>({})
  const [videoUploads, setVideoUploads] = useState<Record<number, UploadInfo>>({})
  const [pendingGalleryCount, setPendingGalleryCount] = useState(0)
  const galleryUploadCounter = useRef(0)
  const pendingFeaturedFile = useRef<File | null>(null)
  const mountedRef = useRef(true)
  const activeUploads = useRef<Map<string, AbortableUpload>>(new Map())

  const [sections, setSections] = useState({
    basic: true,
    media: true,
    videos: false,
    pricing: false,
    publishing: false,
  })

  useEffect(() => {
    lockBodyScroll()
    const uploads = activeUploads.current
    getCategoriesAction().then((result) => {
      if (result.success) setCategories(result.data)
    })
    if (product) {
      getProductVideosAction(product.id).then((result) => {
        if (!mountedRef.current) return
        if (result.success) {
          setVideos(result.data.map((v) => v.videoUrl))
        }
        setVideosLoaded(true)
      })
    }
    return () => {
      mountedRef.current = false
      uploads.forEach((u) => u.abort())
      uploads.clear()
      unlockBodyScroll()
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const form = e.currentTarget
    const formData = new FormData(form)

    formData.set("featuredImage", featuredImage)
    const galleryStr = JSON.stringify(galleryImages)
    formData.set("galleryImages", galleryStr)

    const videoStr = JSON.stringify(videos.filter(Boolean))
    formData.set("videos", videoStr)

    if (isEdit) {
      formData.set("id", product!.id)
    }

    const result = isEdit
      ? await updateProductAction(formData)
      : await createProductAction(formData)

    if (!result.success) {
      setError(result.error ?? "Failed to save product")
      setSaving(false)
      return
    }

    onClose()
  }

  const handleNameChange = (name: string) => {
    const slugInput = document.getElementById("slug") as HTMLInputElement
    if (slugInput && !slugInput.dataset.manuallyEdited) {
      slugInput.value = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }
  }

  const handleSlugEdit = () => {
    const slugInput = document.getElementById("slug") as HTMLInputElement
    if (slugInput) slugInput.dataset.manuallyEdited = "true"
  }

  const getSlug = () => {
    const slugInput = document.getElementById("slug") as HTMLInputElement
    return slugInput?.value || undefined
  }

  const uploadFile = (file: File, target: "featured" | "gallery", index?: number) => {
    const slug = getSlug()
    const key = target === "featured" ? "featured" : `gallery-${index}`
    const folder = target === "featured" ? "products" : "products/gallery"

    if (target === "featured") {
      setFeaturedUpload({ state: "preparing", progress: 0 })
    } else if (index !== undefined) {
      setGalleryUploads((prev) => ({ ...prev, [index]: { state: "preparing", progress: 0 } }))
    }

    const { promise, abort } = uploadToStorageWithProgress(
      file,
      { folder, mediaType: "image" },
      (pct) => {
        if (!mountedRef.current) return
        if (target === "featured") {
          setFeaturedUpload({ state: "uploading", progress: pct })
        } else if (index !== undefined) {
          setGalleryUploads((prev) => ({ ...prev, [index]: { state: "uploading", progress: pct } }))
        }
      }
    )

    activeUploads.current.set(key, { promise, abort })

    promise
      .then((result) => {
        if (!mountedRef.current) return
        activeUploads.current.delete(key)

        if (target === "featured") {
          setFeaturedImage(result.publicUrl)
          setFeaturedUpload({ state: "success", progress: 100 })
          setTimeout(() => {
            if (mountedRef.current) setFeaturedUpload({ state: "idle", progress: 0 })
          }, 2000)
        } else {
          setGalleryImages((prev) => [...prev, result.publicUrl])
          setPendingGalleryCount((prev) => Math.max(0, prev - 1))
          if (index !== undefined) {
            setGalleryUploads((prev) => ({ ...prev, [index]: { state: "success", progress: 100 } }))
            setTimeout(() => {
              if (!mountedRef.current) return
              setGalleryUploads((prev) => {
                const next = { ...prev }
                delete next[index]
                return next
              })
            }, 2000)
          }
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return
        activeUploads.current.delete(key)
        setPendingGalleryCount((prev) => Math.max(0, prev - 1))
        const msg = err instanceof Error ? err.message : "Upload failed"
        if (target === "featured") {
          setFeaturedUpload({ state: "error", progress: 0, error: msg })
        } else if (index !== undefined) {
          setGalleryUploads((prev) => ({ ...prev, [index]: { state: "error", progress: 0, error: msg } }))
        }
      })
  }

  const handleFeaturedFiles = (files: FileList) => {
    const file = files[0]
    if (file) {
      pendingFeaturedFile.current = file
      uploadFile(file, "featured")
    }
  }

  const handleGalleryFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const slot = galleryUploadCounter.current++
      setPendingGalleryCount((prev) => prev + 1)
      uploadFile(files[i], "gallery", slot)
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeFeatured = () => {
    setFeaturedImage("")
    setFeaturedUpload({ state: "idle", progress: 0 })
  }

  const handleVideoUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const validation = validateVideoFileSize(file)
    if (!validation.valid) {
      setVideoUploads((prev) => ({ ...prev, [index]: { state: "error", progress: 0, error: validation.error } }))
      return
    }

    setVideoUploads((prev) => ({ ...prev, [index]: { state: "uploading", progress: 10 } }))

    const key = `video-${index}`
    const { promise, abort } = uploadToStorageWithProgress(
      file,
      { folder: "videos", mediaType: "video" },
      (pct) => {
        if (!mountedRef.current) return
        setVideoUploads((prev) => ({ ...prev, [index]: { state: "uploading", progress: pct } }))
      }
    )

    activeUploads.current.set(key, { promise, abort })

    promise
      .then((result) => {
        if (!mountedRef.current) return
        activeUploads.current.delete(key)
        setVideos((prev) => {
          const next = [...prev]
          next[index] = result.publicUrl
          return next
        })
        setVideoUploads((prev) => ({ ...prev, [index]: { state: "success", progress: 100 } }))
        setTimeout(() => {
          if (!mountedRef.current) return
          setVideoUploads((prev) => {
            const next = { ...prev }
            delete next[index]
            return next
          })
        }, 2000)
      })
      .catch((err) => {
        if (!mountedRef.current) return
        activeUploads.current.delete(key)
        const msg = err instanceof Error ? err.message : "Upload failed"
        setVideoUploads((prev) => ({ ...prev, [index]: { state: "error", progress: 0, error: msg } }))
      })
  }

  const isUploading =
    featuredUpload.state === "preparing" || featuredUpload.state === "uploading" ||
    Object.values(galleryUploads).some((u) => u.state === "preparing" || u.state === "uploading")

  const videosPending = isEdit && !videosLoaded

  const canSave = !saving && !isUploading && !videosPending

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-surface/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl sm:my-8 rounded-none sm:rounded-2xl bg-card border-0 sm:border border-border shadow-2xl min-h-[100dvh] sm:min-h-0 max-h-[100dvh] sm:max-h-[85dvh] flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {isEdit ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {isEdit ? `Editing "${product!.title}"` : "Create a new product listing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-11 w-11 sm:h-9 sm:w-9 inline-flex items-center justify-center rounded-xl sm:rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800 active:scale-90 transition-all duration-200 shrink-0 ml-3"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 space-y-1 pb-0">
            {/* Section: Basic Info */}
            <SectionHeader icon={FileImage} title="Basic Info" open={sections.basic} onToggle={() => toggleSection("basic")} />
            {sections.basic && (
              <div className="space-y-4 px-4 sm:px-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="name" className={labelClass}>Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      defaultValue={product?.title ?? ""}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={inputClass}
                      placeholder="Golden Hanuman Statue"
                    />
                  </div>
                  <div>
                    <label htmlFor="slug" className={labelClass}>Slug *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 pointer-events-none">/</span>
                      <input
                        id="slug"
                        name="slug"
                        type="text"
                        required
                        defaultValue={product?.slug ?? ""}
                        onFocus={handleSlugEdit}
                        className="w-full h-11 pl-7 pr-3.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                        placeholder="golden-hanuman-statue"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="shortDescription" className={labelClass}>Short Description</label>
                  <input
                    id="shortDescription"
                    name="shortDescription"
                    type="text"
                    defaultValue={product?.shortDescription ?? ""}
                    className={inputClass}
                    placeholder="Premium metallic-finish meditation statue"
                  />
                </div>
                <div>
                  <label htmlFor="description" className={labelClass}>Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={product?.description ?? ""}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-y"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>
            )}

            <hr className="border-border/50 mx-4 sm:mx-6" />

            {/* Section: Images */}
            <SectionHeader icon={ImageIcon} title="Images" open={sections.media} onToggle={() => toggleSection("media")} />
            {sections.media && (
              <div className="space-y-5 px-4 sm:px-6 pb-4">
                <div>
                  <label className={labelClass}>Featured Image</label>
                  {featuredImage ? (
                    <div className="flex items-start gap-4">
                      <ImagePreview src={featuredImage} onRemove={removeFeatured} size="md" />
                      {featuredUpload.state === "success" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Uploaded
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadDropZone
                        onFiles={handleFeaturedFiles}
                        disabled={isUploading}
                        label="Upload Featured Image"
                        multiple={false}
                        uploading={featuredUpload.state === "preparing" || featuredUpload.state === "uploading"}
                      />
                      {featuredUpload.state === "uploading" && <ProgressBar value={featuredUpload.progress} />}
                      {featuredUpload.state === "error" && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                          <span className="flex items-center gap-1.5 text-xs text-red-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {featuredUpload.error || "Upload failed"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const file = pendingFeaturedFile.current
                              if (file) uploadFile(file, "featured")
                            }}
                            className="text-xs font-medium text-red-400 hover:text-red-300 underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Gallery Images</label>
                  <UploadDropZone
                    onFiles={handleGalleryFiles}
                    disabled={isUploading}
                    label="Upload Gallery Images"
                    multiple={true}
                    uploading={pendingGalleryCount > 0 && Object.values(galleryUploads).some((u) => u.state === "preparing" || u.state === "uploading")}
                  />
                  {Object.entries(galleryUploads).map(([key, info]) => (
                    <div key={key} className="mt-2">
                      {info.state === "uploading" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Uploading gallery image...
                          <ProgressBar value={info.progress} />
                        </div>
                      )}
                      {info.state === "success" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Uploaded
                        </div>
                      )}
                      {info.state === "error" && (
                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {info.error || "Upload failed"}
                        </div>
                      )}
                    </div>
                  ))}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mt-3">
                      {galleryImages.map((url, i) => (
                        <ImagePreview key={`${url}-${i}`} src={url} onRemove={() => removeGalleryImage(i)} size="sm" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <hr className="border-border/50 mx-4 sm:mx-6" />

            {/* Section: Videos */}
            <SectionHeader icon={Video} title="Videos" open={sections.videos} onToggle={() => toggleSection("videos")} />
            {sections.videos && (
              <div className="space-y-2 px-4 sm:px-6 pb-4">
                {videos.map((url, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {url ? (
                        <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg bg-zinc-800 border border-zinc-700">
                          <Video className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs text-foreground truncate flex-1">{url.split("/").pop()}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                      ) : (
                        <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-dashed border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 cursor-pointer transition-all duration-200">
                          <CloudUpload className="w-4 h-4" />
                          <span className="text-xs font-medium">Choose MP4</span>
                          <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoUpload(i)} />
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => setVideos((prev) => prev.filter((_, j) => j !== i))}
                        className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-zinc-800 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {videoUploads[i]?.state === "uploading" && <ProgressBar value={videoUploads[i].progress} />}
                    {videoUploads[i]?.state === "error" && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {videoUploads[i].error || "Upload failed"}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setVideos((prev) => [...prev, ""])}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border-2 border-dashed border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Add Video
                </button>
                <p className="text-[11px] text-muted-foreground/50">MP4, WebM, or MOV · Max 100MB</p>
              </div>
            )}

            <hr className="border-border/50 mx-4 sm:mx-6" />

            {/* Section: Pricing & Production */}
            <SectionHeader icon={DollarSign} title="Pricing & Production" open={sections.pricing} onToggle={() => toggleSection("pricing")} />
            {sections.pricing && (
              <div className="space-y-4 px-4 sm:px-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="categoryId" className={labelClass}>Category *</label>
                    <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? categories.find((c) => c.slug === product?.category)?.id ?? ""} className={selectClass}>
                      {categories.length === 0 && <option value="">Loading...</option>}
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priceRange" className={labelClass}>Price Range</label>
                    <input id="priceRange" name="priceRange" type="text" defaultValue={product?.priceRange ?? ""} className={inputClass} placeholder='₹799 or "Custom Quote"' />
                  </div>
                  <div>
                    <label htmlFor="material" className={labelClass}>Material</label>
                    <input id="material" name="material" type="text" defaultValue={product?.material ?? ""} className={inputClass} placeholder="PLA+, Metallic Finish" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="dimensions" className={labelClass}>Dimensions</label>
                    <input id="dimensions" name="dimensions" type="text" defaultValue={product?.dimensions ?? ""} className={inputClass} placeholder="18cm × 12cm × 25cm" />
                  </div>
                  <div>
                    <label htmlFor="printTime" className={labelClass}>Print Time</label>
                    <input id="printTime" name="printTime" type="text" defaultValue={product?.printTime ?? ""} className={inputClass} placeholder="~12 hours" />
                  </div>
                  <div>
                    <label htmlFor="finishType" className={labelClass}>Finish Type</label>
                    <input id="finishType" name="finishType" type="text" defaultValue={product?.finishType ?? ""} className={inputClass} placeholder="Metallic Coating" />
                  </div>
                  <div>
                    <label htmlFor="technologies" className={labelClass}>Technologies</label>
                    <input id="technologies" name="technologies" type="text" defaultValue={product?.technologies?.join(", ") ?? ""} className={inputClass} placeholder="FDM Printing, Surface Finishing" />
                    <p className="text-[11px] text-muted-foreground/50 mt-1">Comma-separated</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="productionType" className={labelClass}>Production Type</label>
                    <select id="productionType" name="productionType" defaultValue={product?.productionType ?? "single"} className={selectClass}>
                      <option value="single">Single Unit</option>
                      <option value="prototype">Prototype</option>
                      <option value="batch">Batch Production</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="minimumOrderQuantity" className={labelClass}>Min Order Quantity</label>
                    <input id="minimumOrderQuantity" name="minimumOrderQuantity" type="text" defaultValue={product?.minimumOrderQuantity ?? ""} className={inputClass} placeholder="10 units" />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-border/50 mx-4 sm:mx-6" />

            {/* Section: Publishing */}
            <SectionHeader icon={Settings} title="Publishing" open={sections.publishing} onToggle={() => toggleSection("publishing")} />
            {sections.publishing && (
              <div className="space-y-4 px-4 sm:px-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <label className="flex items-center gap-3 h-11 px-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:bg-zinc-900 transition-colors active:scale-[0.99]">
                    <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? false} className="w-4 h-4 rounded border-border bg-zinc-800 accent-primary" />
                    <span className="text-sm text-foreground">Published</span>
                  </label>
                  <label className="flex items-center gap-3 h-11 px-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:bg-zinc-900 transition-colors active:scale-[0.99]">
                    <input type="checkbox" name="isFeatured" defaultChecked={product?.featured ?? false} className="w-4 h-4 rounded border-border bg-zinc-800 accent-primary" />
                    <span className="text-sm text-foreground">Featured</span>
                  </label>
                  <label className="flex items-center gap-3 h-11 px-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:bg-zinc-900 transition-colors active:scale-[0.99]">
                    <input type="checkbox" name="supportsBulkOrders" defaultChecked={product?.supportsBulkOrders ?? false} className="w-4 h-4 rounded border-border bg-zinc-800 accent-primary" />
                    <span className="text-sm text-foreground">Bulk Orders</span>
                  </label>
                  <label className="flex items-center gap-3 h-11 px-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:bg-zinc-900 transition-colors active:scale-[0.99]">
                    <input type="checkbox" name="customizable" defaultChecked={product?.customizable ?? false} className="w-4 h-4 rounded border-border bg-zinc-800 accent-primary" />
                    <span className="text-sm text-foreground">Customizable</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 sm:mx-6 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-card border-t border-border flex items-center justify-end gap-3 px-4 sm:px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-11 sm:h-10 px-5 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-[0.97] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="h-11 sm:h-10 px-5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.97] transition-all duration-200 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {(saving || isUploading || videosPending) && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {videosPending ? "Loading..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
