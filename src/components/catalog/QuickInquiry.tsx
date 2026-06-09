"use client"

import { useState, useRef, useEffect } from "react"
import { X, MessageCircle, Minus, Plus, Loader2, Paperclip } from "lucide-react"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { createInquiryAction } from "@/actions/inquiries"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"
import { lockBodyScroll, unlockBodyScroll } from "@/lib/ui/scroll-lock"

interface QuickInquiryProps {
  productName: string
  productCategory?: string
  sourcePage?: string
  source?: string
  onClose: () => void
}

export function QuickInquiry({
  productName,
  productCategory = "",
  sourcePage = "unknown",
  source = "unknown",
  onClose,
}: QuickInquiryProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState("")
  const [needsCustomization, setNeedsCustomization] = useState<string>("")
  const [customReq, setCustomReq] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const submittedRef = useRef(false)

  useEffect(() => {
    document.body.setAttribute("data-inquiry-modal-open", "true")
    lockBodyScroll()
    return () => {
      document.body.removeAttribute("data-inquiry-modal-open")
      unlockBodyScroll()
    }
  }, [])

  const handleSubmit = async () => {
    if (submittedRef.current) return
    submittedRef.current = true

    setSaving(true)
    setError("")

    const formData = new FormData()
    formData.set("name", name)
    formData.set("email", email)
    formData.set("phone", phone)
    formData.set("product", productName)
    formData.set("category", productCategory)
    formData.set("quantity", String(quantity))
    formData.set("preferredSize", size)
    formData.set("customizable", needsCustomization === "yes" ? "true" : "false")
    formData.set("message", customReq)
    formData.set("sourcePage", sourcePage)
    formData.set("source", source)
    formData.set("website", "") // honeypot — must be empty
    if (attachments.length > 0) {
      formData.set("attachments", JSON.stringify(attachments))
    }

    const result = await createInquiryAction(formData)

    if (!result.success) {
      setError(result.error ?? "Failed to save inquiry. Please try again.")
      setSaving(false)
      submittedRef.current = false
      return
    }

    const text = encodeURIComponent(
      [
        `Hi, I'm interested in the ${productName}.`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Quantity: ${quantity}`,
        size ? `Preferred Size: ${size}` : "",
        needsCustomization === "yes" ? "Need Customization: Yes" : "",
        customReq ? `\nCustom Requirements:\n${customReq}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )

    window.open(`https://wa.me/${SITE.whatsapp}?text=${text}`, "_blank")
    setSubmitted(true)
    setSaving(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const result = await uploadToCloudinary(file)
      setAttachments((prev) => [...prev, result.secureUrl])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const inputClass =
    "w-full h-11 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center bg-surface/60 backdrop-blur-sm p-4 pt-[10vh] overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 md:p-8 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-muted-foreground hover:text-foreground hover:bg-zinc-700 active:scale-90 transition-all duration-200"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-[#25D366]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Inquiry Saved
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              We&apos;ve received your inquiry. WhatsApp should open with your
              details prefilled — send the message and we&apos;ll get back to
              you shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex items-center gap-2 h-11 px-6 text-sm font-medium rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Inquire About This Product
            </h3>
            <p className="text-sm text-muted mb-6">
              {productName}
            </p>

            <div className="space-y-4">
              <div aria-hidden="true" className="absolute opacity-0 pointer-events-none top-0 left-0 h-0 w-0" style={{ position: "absolute", left: "-9999px" }}>
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              <div>
                <label htmlFor="inq-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="inq-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inq-email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="inq-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="inq-phone" className="block text-sm font-medium text-foreground mb-1.5">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="inq-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-90 transition-all duration-200 border border-border"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  <span className="w-12 text-center text-lg font-semibold text-foreground">
                    {quantity}
                  </span>
                    <button
                      onClick={() => setQuantity(Math.min(10000, quantity + 1))}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 text-foreground hover:bg-zinc-700 active:scale-90 transition-all duration-200 border border-border"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="inq-size"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Preferred Size (optional)
                </label>
                <input
                  id="inq-size"
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder='e.g. "Standard", "Large", or specific dimensions'
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Need Customization?
                </label>
                <div className="flex gap-3">
                  {["yes", "no"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setNeedsCustomization(opt)}
                      className={cn(
                        "flex-1 h-11 text-sm font-medium rounded-xl border transition-all duration-200",
                        needsCustomization === opt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-surface text-muted-foreground border-border hover:bg-zinc-800 hover:text-foreground",
                        "active:scale-[0.97]"
                      )}
                    >
                      {opt === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {needsCustomization === "yes" && (
                <div>
                  <label
                    htmlFor="inq-custom"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Describe Your Customization
                  </label>
                  <textarea
                    id="inq-custom"
                    rows={3}
                    value={customReq}
                    onChange={(e) => setCustomReq(e.target.value)}
                    placeholder="Size changes, color, material, engraving, modifications..."
                    className="w-full px-4 py-3 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-y min-h-[80px]"
                  />
                </div>
              )}

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Attachments (optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.step,.stl,.obj,.3mf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((url, i) => (
                      <div key={url} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-border text-xs text-muted-foreground">
                        <Paperclip className="w-3 h-3" />
                        <span className="max-w-[120px] truncate">{url.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(i)}
                          className="ml-1 text-muted-foreground hover:text-red-400 transition-colors"
                          aria-label="Remove attachment"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium rounded-xl bg-zinc-800 text-muted-foreground hover:text-foreground hover:bg-zinc-700 border border-border transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5" />
                  )}
                  <span>{uploading ? "Uploading..." : "Add File"}</span>
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                className={cn(
                  "inline-flex items-center justify-center gap-2.5 w-full h-13 text-base font-medium rounded-xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 transition-all duration-200",
                  saving
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#20BD5A] active:scale-[0.97] cursor-pointer"
                )}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                <span>{saving ? "Saving..." : "Request a Custom Quote"}</span>
              </button>

              <p className="text-[11px] text-center text-muted-foreground">
                Your inquiry is saved securely. We&apos;ll review it and get back
                to you promptly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
