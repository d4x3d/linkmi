import { v } from 'convex/values';
import { mutation, query, action, internalQuery } from './_generated/server';
import { api, internal } from './_generated/api';

export const getDownloadInfo = internalQuery({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    let downloadUrl: string | null = null;
    if (product.type === 'file' && product.contentFileId) {
      downloadUrl = await ctx.storage.getUrl(product.contentFileId);
    } else if (product.type === 'link' && product.contentUrl) {
      downloadUrl = product.contentUrl;
    }

    return {
      name: product.name,
      downloadUrl,
      deliveryNote: product.deliveryNote,
    };
  },
});

export const list = query({
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

    const products = await ctx.db
      .query('products')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    // Resolve image URLs
    const productsWithUrls = await Promise.all(
      products
        .filter((p) => !p.isDeleted)
        .sort((a, b) => a.position - b.position)
        .map(async (p) => {
          const imageUrl = p.imageId ? await ctx.storage.getUrl(p.imageId) : null;
          return { ...p, imageUrl };
        }),
    );

    return productsWithUrls;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    // Product Type & Assets
    type: v.optional(v.string()), // "file", "link", "service"
    contentFileId: v.optional(v.id('_storage')),
    contentUrl: v.optional(v.string()),
    imageId: v.optional(v.id('_storage')),
    deliveryNote: v.optional(v.string()),
    // Legacy
    fileId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Get the current highest position
    const currentProducts = await ctx.db
      .query('products')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const maxPosition = currentProducts.reduce((max, prod) => Math.max(max, prod.position), -1);

    await ctx.db.insert('products', {
      userId: user._id,
      name: args.name,
      description: args.description,
      price: args.price,
      position: maxPosition + 1,
      // New Fields
      type: args.type || 'file', // Default to file if not specified
      contentFileId: args.contentFileId,
      contentUrl: args.contentUrl,
      imageId: args.imageId,
      deliveryNote: args.deliveryNote,
      fileId: args.fileId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('products'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    // Price cannot be changed
    discountPercentage: v.optional(v.number()),
    endDiscount: v.optional(v.boolean()),
    position: v.optional(v.number()),
    // Support updating assets
    type: v.optional(v.string()),
    contentFileId: v.optional(v.id('_storage')),
    contentUrl: v.optional(v.string()),
    imageId: v.optional(v.id('_storage')),
    deliveryNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== user._id) {
      throw new Error('Product not found or unauthorized');
    }

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.position !== undefined) updates.position = args.position;
    if (args.discountPercentage !== undefined) updates.discountPercentage = args.discountPercentage;

    // Asset Updates
    if (args.type !== undefined) updates.type = args.type;
    if (args.contentFileId !== undefined) updates.contentFileId = args.contentFileId;
    if (args.contentUrl !== undefined) updates.contentUrl = args.contentUrl;
    if (args.imageId !== undefined) updates.imageId = args.imageId;
    if (args.deliveryNote !== undefined) updates.deliveryNote = args.deliveryNote;

    if (args.endDiscount) {
      const newProduct: any = { ...product };
      // Ensure position exists (fix for migration issues)
      if (newProduct.position === undefined) newProduct.position = 0;

      // Remove old/new discount fields
      delete (newProduct as any).discountPrice;
      delete newProduct.discountPercentage;

      Object.assign(newProduct, updates);
      await ctx.db.replace(args.id, newProduct);
    } else {
      await ctx.db.patch(args.id, updates);
    }
  },
});

export const remove = mutation({
  args: {
    id: v.id('products'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== user._id) {
      throw new Error('Product not found or unauthorized');
    }

    // Note: We're not deleting the file from storage here, but we could/should in a real app
    // Soft delete
    await ctx.db.patch(args.id, { isDeleted: true });
  },
});

export const listPublic = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();

    const productsWithUrls = await Promise.all(
      products
        .filter((p) => !p.isDeleted)
        .sort((a, b) => a.position - b.position)
        .map(async (p) => {
          const imageUrl = p.imageId ? await ctx.storage.getUrl(p.imageId) : null;
          return { ...p, imageUrl };
        }),
    );

    return productsWithUrls;
  },
});

export const getPublic = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const buy = action({
  args: {
    productId: v.id('products'),
    email: v.string(),
  },
  handler: async (ctx, args): Promise<{ authorization_url: string; access_code: string; reference: string }> => {
    // 1. Get the product to confirm price
    const product = await ctx.runQuery(api.products.getPublic, { id: args.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Determine amount to charge
    let amountToCharge = product.price;
    if (product.discountPercentage && product.discountPercentage > 0) {
      amountToCharge = Math.round(product.price * (1 - product.discountPercentage / 100));
    }

    // 2. Call Paystack initialization action with metadata
    const result = await ctx.runAction(api.paystack.initializeTransaction, {
      email: args.email,
      amount: amountToCharge,
      metadata: JSON.stringify({
        productId: args.productId,
        productName: product.name,
        userId: product.userId,
      }),
    });

    return result;
  },
});
