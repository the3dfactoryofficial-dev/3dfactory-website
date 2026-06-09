import { track } from "@vercel/analytics"

export function trackWhatsAppClick(source: string) {
  track("whatsapp_click", { source })
}

export function trackInquirySubmit(source: string) {
  track("inquiry_submit", { source })
}

export function trackProductView(slug: string, category: string) {
  track("product_view", { slug, category })
}