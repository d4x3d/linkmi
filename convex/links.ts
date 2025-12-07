import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
            .unique();

        if (!user) {
            return [];
        }

        const links = await ctx.db
            .query("links")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        return links.sort((a, b) => a.position - b.position);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        url: v.string(),
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

        // Get the current highest position to append to the end
        const currentLinks = await ctx.db
            .query("links")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const maxPosition = currentLinks.reduce((max, link) => Math.max(max, link.position), -1);

        await ctx.db.insert("links", {
            userId: user._id,
            title: args.title,
            url: args.url,
            position: maxPosition + 1,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("links"),
        title: v.optional(v.string()),
        url: v.optional(v.string()),
        position: v.optional(v.number()),
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

        const link = await ctx.db.get(args.id);
        if (!link || link.userId !== user._id) {
            throw new Error("Link not found or unauthorized");
        }

        await ctx.db.patch(args.id, {
            title: args.title,
            url: args.url,
            position: args.position,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("links"),
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

        const link = await ctx.db.get(args.id);
        if (!link || link.userId !== user._id) {
            throw new Error("Link not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const listPublic = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const links = await ctx.db
            .query("links")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        return links.sort((a, b) => a.position - b.position);
    },
});
