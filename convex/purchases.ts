import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create a purchase record after successful payment
export const create = mutation({
  args: {
    userId: v.id('users'),
    productId: v.id('products'),
    customerEmail: v.string(),
    paystackReference: v.string(),
    amount: v.number(),
    status: v.string(),
    productName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if purchase already exists (prevent duplicates)
    const existing = await ctx.db
      .query('purchases')
      .withIndex('by_reference', (q) => q.eq('paystackReference', args.paystackReference))
      .unique();

    if (existing) {
      return existing._id;
    }

    const purchaseId = await ctx.db.insert('purchases', {
      userId: args.userId,
      productId: args.productId,
      customerEmail: args.customerEmail,
      paystackReference: args.paystackReference,
      amount: args.amount,
      status: args.status,
      productName: args.productName,
    });

    return purchaseId;
  },
});

// Get all purchases for a user (for transaction history)
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const purchases = await ctx.db
      .query('purchases')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return purchases;
  },
});

// Verify a purchase by reference
export const getByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query('purchases')
      .withIndex('by_reference', (q) => q.eq('paystackReference', args.reference))
      .unique();

    return purchase;
  },
});
