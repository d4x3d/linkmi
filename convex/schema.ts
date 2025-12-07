import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
    pageType: v.union(v.literal('links'), v.literal('store'), v.literal('hybrid')),

    // --- Theme and Customization Fields ---
    // e.g., "light", "dark", "custom"
    colorScheme: v.optional(v.string()),
    // hex codes
    primaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    // e.g., "Inter", "Roboto"
    fontFamily: v.optional(v.string()),

    // New Advanced Appearance Fields
    profileImageId: v.optional(v.id('_storage')),
    backgroundImageId: v.optional(v.id('_storage')),
    // "solid", "gradient", "image"
    backgroundStyle: v.optional(v.string()),
    // For gradient backgrounds - the second color
    gradientEndColor: v.optional(v.string()),
    // Gradient direction: "to-b", "to-br", "to-r", etc.
    gradientDirection: v.optional(v.string()),
    // Text colors
    textColor: v.optional(v.string()),
    mutedTextColor: v.optional(v.string()),
    // Mesh Gradient Settings
    meshColors: v.optional(v.array(v.string())),
    meshSpeed: v.optional(v.number()),
    // Button styling
    buttonStyle: v.optional(v.string()), // "rounded", "pill", "square"
    buttonColor: v.optional(v.string()),
    // Card styling
    cardStyle: v.optional(v.string()), // "solid", "glass", "outline", "shadow"
    // JSON object for effects: { titleEffect: "glitch", cardStyle: "glass", buttonStyle: "rounded" }
    themeConfig: v.optional(v.any()), // storing flexible config

    // Social Links Array (simplified storage for now)
    socials: v.optional(
      v.array(
        v.object({
          platform: v.string(), // "twitter", "instagram"
          url: v.string(),
          isVisible: v.boolean(),
        }),
      ),
    ),

    // Layout Preference: "grid", "list", "magazine"
    layoutStyle: v.optional(v.string()),
  })
    .index('by_subject', ['subject'])
    .index('by_slug', ['slug']),

  // Links for the bio page
  links: defineTable({
    userId: v.id('users'),
    title: v.string(),
    url: v.string(),
    // Optional icon or thumbnail
    imageId: v.optional(v.id('_storage')),
    // For reordering
    position: v.number(),
    isActive: v.optional(v.boolean()),
  }).index('by_userId', ['userId']),

  // Digital products for the store
  products: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    // Price in Kobo (NGN's smallest unit)
    price: v.number(),
    // Discount Percentage (0-100)
    discountPercentage: v.optional(v.number()),
    // Soft delete flag
    isDeleted: v.optional(v.boolean()),

    // Product Assets
    // Cover image for the store
    imageId: v.optional(v.id('_storage')),

    // Product Deliverable
    // "file", "link", "video", "custom"
    type: v.optional(v.string()),
    // If type is "file", this stores the file
    contentFileId: v.optional(v.id('_storage')),
    // If type is "link" or "video", this stores the URL
    contentUrl: v.optional(v.string()),
    // For email/delivery page
    deliveryNote: v.optional(v.string()),

    // Legacy fileId (can replace or keep)
    fileId: v.optional(v.id('_storage')),
    // For reordering
    position: v.number(),
  }).index('by_userId', ['userId']),

  // To track successful purchases
  purchases: defineTable({
    userId: v.id('users'),
    productId: v.id('products'),
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
    .index('by_userId', ['userId'])
    .index('by_productId', ['productId'])
    .index('by_reference', ['paystackReference']),

  // Bank accounts for withdrawals
  bankAccounts: defineTable({
    userId: v.id('users'),
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(),
    recipientCode: v.string(),
    currency: v.string(),
  }).index('by_userId', ['userId']),

  // Withdrawal requests
  withdrawals: defineTable({
    userId: v.id('users'),
    amount: v.number(),
    status: v.string(), // pending, success, failed
    recipientCode: v.string(),
    reference: v.string(),
    transferCode: v.optional(v.string()), // From Paystack
    failureReason: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_status', ['status']),

  // Analytics for tracking views
  analytics: defineTable({
    userId: v.id('users'),
    type: v.string(), // "page_view"
    meta: v.optional(v.any()), // Allow storing extra info securely
  }).index('by_userId', ['userId']),
});
