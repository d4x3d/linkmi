import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Combined user and theme configuration table
  users: defineTable({
    // From authentication provider (e.g., WorkOS)
    subject: v.string(),
    // Unique public page slug (e.g., /best-creator)
    slug: v.string(),
    // User's display name or title for the page
    title: v.optional(v.string()),
    // A short bio or description
    bio: v.optional(v.string()),
    // The type of page the user wants: "links", "store", or "hybrid"
    pageType: v.union(
      v.literal("links"),
      v.literal("store"),
      v.literal("hybrid")
    ),

    // --- Theme and Customization Fields ---
    // e.g., "light", "dark", "custom"
    colorScheme: v.optional(v.string()),
    // hex codes
    primaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    // e.g., "Inter", "Roboto"
    fontFamily: v.optional(v.string()),

  }).index("by_subject", ["subject"]).index("by_slug", ["slug"]),

  // Links for the bio page
  links: defineTable({
    userId: v.id("users"),
    title: v.string(),
    url: v.string(),
    // For reordering
    position: v.number(),
  }).index("by_userId", ["userId"]),

  // Digital products for the store
  products: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    // Price in Kobo (NGN's smallest unit)
    price: v.number(),
    // Discount Percentage (0-100)
    discountPercentage: v.optional(v.number()),
    // Soft delete flag
    isDeleted: v.optional(v.boolean()),
    // To store the file in Convex File Storage (optional for now)
    fileId: v.optional(v.id("_storage")),
    // For reordering
    position: v.number(),
  }).index("by_userId", ["userId"]),

  // To track successful purchases
  purchases: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    // Email of the customer from the Paystack form
    customerEmail: v.string(),
    // Unique payment reference from Paystack
    paystackReference: v.string(),
    // Amount paid in kobo
    amount: v.number(),
    // Transaction status
    status: v.string(),
    // Product name at time of purchase
    productName: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_productId", ["productId"])
    .index("by_reference", ["paystackReference"]),

  // Bank accounts for withdrawals
  bankAccounts: defineTable({
    userId: v.id("users"),
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(),
    recipientCode: v.string(),
    currency: v.string(),
  }).index("by_userId", ["userId"]),

  // Withdrawal requests
  withdrawals: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    status: v.string(), // pending, success, failed
    recipientCode: v.string(),
    reference: v.string(),
    transferCode: v.optional(v.string()), // From Paystack
    failureReason: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Analytics for tracking views
  analytics: defineTable({
    userId: v.id("users"),
    type: v.string(), // "page_view"
    meta: v.optional(v.any()), // Allow storing extra info securely
  }).index("by_userId", ["userId"]),
});