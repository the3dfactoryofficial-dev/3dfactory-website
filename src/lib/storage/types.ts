export type InquiryStatus = "new" | "contacted" | "quoted" | "completed"

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  product: string
  category: string
  quantity: number
  preferredSize: string
  customizable: boolean
  message: string
  sourcePage: string
  source: string
  attachments?: string[]
  status: InquiryStatus
  userId?: string | null
  createdAt: string
}

export interface CreateInquiryInput {
  name: string
  email: string
  phone: string
  product: string
  category: string
  quantity: number
  preferredSize?: string
  customizable: boolean
  message?: string
  sourcePage: string
  source?: string
  attachments?: string[]
}

export interface UpdateStatusInput {
  id: string
  status: InquiryStatus
}

export interface InquiryResult<T> {
  success: boolean
  data?: T
  error?: string
}

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  completed: "Completed",
}

export const INQUIRY_STATUS_COLORS: Record<InquiryStatus, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  contacted: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  quoted: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/10 text-green-400 border-green-500/30",
}
