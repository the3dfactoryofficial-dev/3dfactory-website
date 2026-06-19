export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function generateWhatsAppProductMessage(params: {
  productName: string
  priceRange?: string
  categoryName?: string
  productImage?: string
  productUrl: string
}): string {
  const lines = [
    `Hi 3D Factory,`,
    ``,
    `I would like to order this product:`,
    ``,
    `🛍 Product: ${params.productName}`,
  ]

  if (params.priceRange) {
    lines.push(`💰 Price: ${params.priceRange}`)
  }

  if (params.categoryName) {
    lines.push(`📂 Category: ${params.categoryName}`)
  }

  lines.push(``)

  if (params.productImage) {
    lines.push(`🖼 Product Image:`)
    lines.push(`${params.productImage}`)
    lines.push(``)
  }

  lines.push(`🔗 Product Link:`)
  lines.push(`${params.productUrl}`)
  lines.push(``)
  lines.push(`Please share customization options, delivery timeline, and payment details.`)

  return lines.join("\n")
}

export function getWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function formatWhatsAppUrl(phone: string, productName: string): string {
  const text = encodeURIComponent(
    `Hi! I'm interested in "${productName}". Could you share more details?`
  )
  return `https://wa.me/${phone}?text=${text}`
}
