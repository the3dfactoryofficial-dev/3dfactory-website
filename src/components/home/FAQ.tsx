"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { faqItems } from "@/data/faq"
import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { cn } from "@/lib/utils"

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <Section id="faq" dark>
      <Heading
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know before placing your order. If you have more questions, just reach out on WhatsApp."
      />

      <div className="mt-12 md:mt-16 max-w-2xl mx-auto space-y-3">
        {faqItems.map((item) => {
          const isOpen = openId === item.id

          return (
            <div
              key={item.id}
              className={cn(
              "rounded-2xl border transition-all duration-200",
              isOpen
                  ? "border-zinc-600 bg-surface"
                : "border-border bg-card hover:bg-card-hover hover:border-zinc-600 active:bg-card-hover"
              )}
            >
              <button
                onClick={() => toggle(item.id)}
                className="flex items-center justify-between w-full px-6 py-5 text-left cursor-pointer select-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium text-foreground pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-sm text-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
