import { query } from './_generated/server';
import { v } from 'convex/values';

export const getPage = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    if (!user) return null;

    // Fetch Data
    const products = await ctx.db
      .query('products')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const links = await ctx.db
      .query('links')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    // Resolve URLs
    const profileImageUrl = user.profileImageId ? await ctx.storage.getUrl(user.profileImageId) : null;

    const backgroundImageUrl = user.backgroundImageId ? await ctx.storage.getUrl(user.backgroundImageId) : null;

    // Resolve Product Images
    const productsWithUrls = await Promise.all(
      products
        .filter((p) => !p.isDeleted)
        .sort((a, b) => a.position - b.position)
        .map(async (p) => {
          const imageUrl = p.imageId ? await ctx.storage.getUrl(p.imageId) : null;
          return { ...p, imageUrl };
        }),
    );

    // Resolve Link Images
    const linksWithUrls = await Promise.all(
      links
        .sort((a, b) => a.position - b.position)
        .map(async (l) => {
          const imageUrl = l.imageId ? await ctx.storage.getUrl(l.imageId) : null;
          return { ...l, imageUrl };
        }),
    );

    return {
      user: {
        ...user,
        profileImageUrl,
        backgroundImageUrl,
      },
      products: productsWithUrls,
      links: linksWithUrls,
    };
  },
});
