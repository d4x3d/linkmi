# Link-in-Bio Application Development Plan

This document outlines the plan for creating a highly customizable "link-in-bio" application with e-commerce capabilities.

## 1. Project Overview

The goal is to build a platform where users can create a single public page to feature their social media links, content, and digital products. The platform will be highly customizable, allowing users to control the appearance and content of their page. It will support three main use cases: a standard link-in-bio page, a standalone digital storefront, or a hybrid of both.

**Core Features:**
-   **User Authentication:** Secure sign-up and login (already implemented with WorkOS).
-   **Dashboard:** A user-specific area to manage content and customization.
-   **Public Page:** A publicly accessible page at `/<slug>` for each user.
-   **Link Management:** Add, edit, delete, and reorder links.
-   **Appearance Customization:** Control theme (colors, fonts), layout, and element positions.
-   **E-commerce:**
    -   Create and manage digital products (files, videos, etc.).
    -   Set prices and sell items through a paywall.
    -   Securely deliver digital goods after purchase.

## 2. Technology Stack

We will build upon the existing project structure, leveraging modern and robust technologies to ensure a high-quality, scalable application.

-   **Framework:** **Next.js (React)** - The project is already set up with Next.js, which is perfect for its server-side rendering (for fast initial page loads and SEO) and client-side interactivity.
-   **Database & Backend:** **Convex** - The project includes a `convex` directory, indicating its use. Convex will serve as our backend, providing a realtime database, serverless functions (mutations/queries), file storage, and authentication integration. This is ideal for a dynamic, interactive application.
-   **Styling:** **Tailwind CSS** with **shadcn/ui** - The presence of `tailwind.config.js`, `postcss.config.mjs`, and `components/ui` suggests this combination. We will continue to use it for building a modern, responsive, and maintainable user interface.
-   **Payments:** **Paystack** - As requested, we will use Paystack, a leading payment gateway in Nigeria. We will integrate it using the `@paystack/paystack-sdk` library for handling transactions for digital products.
-   **Authentication:** **WorkOS** - As specified, WorkOS is already integrated for handling user authentication, which we will continue to use via the existing Convex `auth.config.ts`.

## 3. Data Models (Convex Schema)

We will define the following data models in `convex/schema.ts`. This structure will store all user-generated content and configurations.

```typescript
// in convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store user-specific info
  users: defineTable({
    // From authentication provider (e.g., WorkOS)
    subject: v.string(), 
    // Unique public page slug (e.g., /best-creator)
    slug: v.string(),
    // User's display name or title
    title: v.optional(v.string()),
    // A short bio or description
    bio: v.optional(v.string()),
    // The type of page the user wants: "links", "store", or "hybrid"
    pageType: v.union(
        v.literal("links"),
        v.literal("store"),
        v.literal("hybrid")
    ),
  }).index("by_subject", ["subject"]).index("by_slug", ["slug"]),

  // Theme customization for each user
  themes: defineTable({
    userId: v.id("users"),
    // e.g., "light", "dark", "custom"
    colorScheme: v.string(), 
    // hex codes
    primaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    // e.g., "Inter", "Roboto"
    fontFamily: v.optional(v.string()), 
  }).index("by_userId", ["userId"]),

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
    // Price in cents
    price: v.number(),
    // To store the file in Convex File Storage
    fileId: v.id("_storage"),
    // For reordering
    position: v.number(),
  }).index("by_userId", ["userId"]),

  // To track successful purchases
  purchases: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    // Unique customer ID from Stripe
    stripeCustomerId: v.string(),
    // Unique payment ID from Stripe
    stripePaymentId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_productId", ["productId"]),
});
```

## 4. Development Plan: Piece by Piece

We will build the application in logical phases, ensuring each part is functional before moving to the next.

### Phase 1: Dashboard & Page Setup

1.  **Create Dashboard Layout:**
    -   Set up a new route group `/dashboard/(main)`.
    -   Create a main dashboard layout (`/dashboard/layout.tsx`) with navigation (Links, Appearance, Store).
    -   The main page (`/dashboard/page.tsx`) will greet the user and show stats.
2.  **First-Time User Experience:**
    -   After a user signs up, check if they have a `user` record in Convex.
    -   If not, redirect them to a one-time setup page (`/welcome`) where they can choose their unique `slug`.
3.  **Create Public User Page:**
    -   Create a dynamic route `app/[slug]/page.tsx`.
    -   This page will fetch user data from Convex based on the `slug`.
    -   It will initially display a simple title and bio.

### Phase 2: Link Management

1.  **"Links" Tab UI:**
    -   Create the UI in `/dashboard/links` for managing links.
    -   Users should be able to:
        -   Add a new link (title and URL).
        -   Edit an existing link.
        -   Delete a link.
        -   Drag-and-drop to reorder links.
2.  **Convex Functions:**
    -   Implement Convex queries (`listLinks`) and mutations (`addLink`, `updateLink`, `deleteLink`, `reorderLinks`).
3.  **Display on Public Page:**
    -   Update the `/[slug]` page to fetch and display the user's links.

### Phase 3: Appearance Customization

1.  **"Appearance" Tab UI:**
    -   Create the UI in `/dashboard/appearance`.
    -   Provide controls for:
        -   Choosing a color scheme (e.g., presets for light/dark, or a color picker for custom colors).
        -   Selecting a font from a predefined list of Google Fonts.
        -   Editing the page `title` and `bio`.
2.  **Convex Functions:**
    -   Implement a Convex mutation (`updateTheme`) to save customization settings.
3.  **Apply Theme:**
    -   The `/[slug]` page will fetch the user's theme and apply it using CSS variables or inline styles.

### Phase 4: E-commerce Functionality

1.  **"Store" Tab UI:**
    -   Build the UI in `/dashboard/store` for product management.
    -   Users can:
        -   Add a new product (name, description, price, file upload).
        -   Edit an existing product.
        -   Delete a product.
2.  **File Uploads:**
    -   Use Convex's file storage to handle uploads of digital products.
3.  **Paystack Integration:**
    -   Set up Paystack account and get API keys.
    -   Create a Convex HTTP Action to act as an endpoint for creating a Paystack transaction.
4.  **Public Store UI:**
    -   On the `/[slug]` page, display products if the `pageType` is "store" or "hybrid".
    -   Each product will have a "Buy" button that redirects to the Paystack Checkout page.
5.  **Webhook for Purchases:**
    -   Create a Convex HTTP Action to serve as a Paystack webhook endpoint.
    -   When a purchase is successful, Paystack will call this webhook.
    -   The function will verify the request, create a `purchases` record in Convex, and trigger an email to the customer with a secure download link.

### Phase 5: Final Polish

1.  **Responsiveness:** Ensure the entire application, from the dashboard to the public pages, is fully responsive and works on all devices.
2.  **User Experience:** Refine animations, loading states, and user feedback to create a polished experience.
3.  **Settings:** Add a `/dashboard/settings` page where users can manage their slug or delete their account.
4.  **Deployment:** The application can be easily deployed to a platform like Vercel, which has first-class support for Next.js. We will add environment variables for Stripe and Convex keys.
