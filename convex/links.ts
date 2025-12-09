import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) return [];

    const links = await ctx.db
      .query('links')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    // Resolve image URLs and sort
    const linksWithUrls = await Promise.all(
      links
        .sort((a, b) => a.position - b.position)
        .map(async (l) => {
          const imageUrl = l.imageId ? await ctx.storage.getUrl(l.imageId) : null;
          return { ...l, imageUrl };
        }),
    );

    return linksWithUrls;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    imageId: v.optional(v.id('_storage')),
    isActive: v.optional(v.boolean()),
    useMetadata: v.optional(v.boolean()),
    description: v.optional(v.string()),
    metadataImage: v.optional(v.string()),
    isAdult: v.optional(v.boolean()),
    isRepo: v.optional(v.boolean()),
    livePreviewUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    const currentLinks = await ctx.db
      .query('links')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const maxPosition = currentLinks.reduce((max, link) => Math.max(max, link.position || 0), -1);

    await ctx.db.insert('links', {
      userId: user._id,
      title: args.title,
      url: args.url,
      position: maxPosition + 1,
      imageId: args.imageId,
      isActive: args.isActive !== undefined ? args.isActive : true,
      useMetadata: args.useMetadata !== undefined ? args.useMetadata : true,
      description: args.description,
      metadataImage: args.metadataImage,
      isAdult: args.isAdult || false,
      isRepo: args.isRepo || false,
      livePreviewUrl: args.livePreviewUrl,
      repoUrl: args.repoUrl,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('links'),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    position: v.optional(v.number()),
    imageId: v.optional(v.id('_storage')),
    isActive: v.optional(v.boolean()),
    useMetadata: v.optional(v.boolean()),
    description: v.optional(v.string()),
    metadataImage: v.optional(v.string()),
    isAdult: v.optional(v.boolean()),
    isRepo: v.optional(v.boolean()),
    livePreviewUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== user._id) {
      throw new Error('Link not found or unauthorized');
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.url !== undefined) updates.url = args.url;
    if (args.position !== undefined) updates.position = args.position;
    if (args.imageId !== undefined) updates.imageId = args.imageId;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.useMetadata !== undefined) updates.useMetadata = args.useMetadata;
    if (args.description !== undefined) updates.description = args.description;
    if (args.metadataImage !== undefined) updates.metadataImage = args.metadataImage;
    if (args.isAdult !== undefined) updates.isAdult = args.isAdult;
    if (args.isRepo !== undefined) updates.isRepo = args.isRepo;
    if (args.livePreviewUrl !== undefined) updates.livePreviewUrl = args.livePreviewUrl;
    if (args.repoUrl !== undefined) updates.repoUrl = args.repoUrl;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id('links') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== user._id) throw new Error('Link not found');
    await ctx.db.delete(args.id);
  },
});

export const listPublic = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query('links')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();
    // Filter out inactive on client or server? Typically server.
    // But schema says isActive is optional.
    return links
      .filter((l) => l.isActive !== false) // default true
      .sort((a, b) => a.position - b.position);
  },
});
