import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    return user;
  },
});

export const createUser = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();

    if (user) {
      throw new Error('Username already taken');
    }

    // ... existing code ...
    await ctx.db.insert('users', {
      subject: identity.subject,
      slug,
      pageType: 'links',
    });
  },
});

export const updateTheme = mutation({
  args: {
    colorScheme: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    pageType: v.optional(v.union(v.literal("links"), v.literal("store"), v.literal("hybrid"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...args,
    });
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return user;
  },
});
