import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const recordView = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Find user by slug
    const user = await ctx.db
      .query('users')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    if (!user) return; // Ignore if user not found

    // 2. Record view
    // We could add rate limiting or unique check here (e.g. by IP if available in headers, but Convex doesn't expose IP easily in standard handler args yet without httpAction)
    // For now, simple counter increase.
    await ctx.db.insert('analytics', {
      userId: user._id,
      type: 'page_view',
      meta: { timestamp: Date.now() },
    });
  },
});

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) return null;

    // 1. Total Views
    const views = await ctx.db
      .query('analytics')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    // 2. Revenue & Sales
    const purchases = await ctx.db
      .query('purchases')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const successfulPurchases = purchases.filter((p) => p.status === 'success');
    const totalRevenue = successfulPurchases.reduce((sum, p) => sum + p.amount, 0);
    const totalSales = successfulPurchases.length;

    // 3. Active Products
    const products = await ctx.db
      .query('products')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();
    const activeProducts = products.length;

    // 4. Products Sold (Optional logic)
    // We could list top products here if needed.

    return {
      totalViews: views.length,
      totalRevenue: totalRevenue, // in kobo
      totalSales: totalSales,
      activeProducts: activeProducts,
    };
  },
});
