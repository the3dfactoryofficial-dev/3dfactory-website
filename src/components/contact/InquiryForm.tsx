"use client"

import { useState, type FormEvent } from "react"
import { MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { trackWhatsAppClick } from "@/lib/analytics"

const projectTypes = [
  "Custom Design",
  "Prototype",
  "Bulk Order",
  "Home Decor",
  "Cosplay / Prop",
  "Jewelry",
  "Other",
]

export function InquiryForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [projectType, setProjectType] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const text = encodeURIComponent(
      [
        `Hi! I'd like to discuss a project.`,
        name ? `\n\nName: ${name}` : "",
        email ? `\nEmail: ${email}` : "",
        projectType ? `\nProject Type: ${projectType}` : "",
        message ? `\n\nMessage:\n${message}` : "",
      ]
        .filter(Boolean)
        .join("")
    )

    window.open(`https://wa.me/${SITE.whatsapp}?text=${text}`, "_blank")
    trackWhatsAppClick("contact_form")
  }

  return (
    <section className="pb-16 md:pb-20">
      <div className="container-main">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Tell Us About Your Project
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              Fill in the details below and we&apos;ll continue the conversation
              on WhatsApp. Share dimensions, references, or ideas for faster
              quotes.
            </p>
          </div>

          <Card className="p-6 md:p-8" hover={false}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full h-11 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="projectType"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Project Type
                </label>
                <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 appearance-none"
                >
                  <option value="">Select a category</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project — dimensions, quantity, references, material preferences, or any other details..."
                  className="w-full px-4 py-3 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-y min-h-[100px]"
                />
              </div>

              <button
                type="submit"
                className={cn(
"inline-flex items-center justify-center gap-2.5 w-full h-13 text-base font-medium rounded-lg",
                   "bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.97]",
                   "transition-all duration-200 cursor-pointer"
                )}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send via WhatsApp</span>
              </button>
            </form>
          </Card>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            Your details are sent directly via WhatsApp. We&apos;ll review and get
            back to you as soon as possible.
          </p>
        </div>
      </div>
    </section>
  )
}
