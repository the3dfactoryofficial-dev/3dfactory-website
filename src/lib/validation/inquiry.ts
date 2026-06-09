import { z } from "zod"

export const CreateInquirySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(200, "Email must be under 200 characters"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must be under 15 digits")
    .regex(/^\+?[\d\-() ]+$/, "Invalid phone number format"),
  product: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be under 200 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be under 100 characters"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Minimum quantity is 1")
    .max(10000, "Maximum quantity is 10,000"),
  preferredSize: z
    .string()
    .max(200, "Preferred size must be under 200 characters")
    .optional()
    .default(""),
  customizable: z.boolean(),
  message: z
    .string()
    .max(2000, "Message must be under 2000 characters")
    .optional()
    .default(""),
  sourcePage: z
    .string()
    .min(1, "Source page is required")
    .max(200, "Source page must be under 200 characters"),
  source: z
    .string()
    .min(1, "Source is required")
    .max(50, "Source must be under 50 characters")
    .optional()
    .default("unknown"),
  attachments: z.array(z.string().url("Invalid attachment URL").refine(
    (v) => v.startsWith("https://"),
    { message: "Attachment URL must use HTTPS" }
  )).optional().default([]),
})

export const UpdateInquiryStatusSchema = z.object({
  id: z.string().min(1, "Inquiry ID is required"),
  status: z.enum(["new", "contacted", "quoted", "completed"]),
})

export type CreateInquiryData = z.infer<typeof CreateInquirySchema>
export type UpdateStatusData = z.infer<typeof UpdateInquiryStatusSchema>
