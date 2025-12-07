import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';

// --- Queries ---

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) return 0;

    // 1. Calculate Total Earnings
    // Note: robust apps should aggregate this incrementally.
    const purchases = await ctx.db
      .query('purchases')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const totalEarnings = purchases.filter((p) => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

    // 2. Calculate Total Withdrawals
    const withdrawals = await ctx.db
      .query('withdrawals')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const totalWithdrawn = withdrawals
      .filter((w) => w.status === 'success' || w.status === 'pending' || w.status === 'otp')
      .reduce((sum, w) => sum + w.amount, 0);

    return totalEarnings - totalWithdrawn;
  },
});

export const getBankAccount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query('bankAccounts')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
  },
});

export const listBanks = query({
  args: {},
  handler: async () => {
    // We call the action via the query? No, queries can't call actions.
    // Ideally this should be an action or called from client directly via action.
    // But client "useQuery" expects a query.
    // Workaround: We'll exposure the action directly to client, or use an internal query if data was cached.
    // Since it's an external API call, it MUST be an action.
    // So we'll export the action wrapper or just let client call api.paystack.listBanks
    return []; // Placeholder if used as query, but client should use action.
  },
});

// --- Mutations ---

export const saveBankAccount = mutation({
  args: {
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(),
    bankName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    // 1. Create Recipient on Paystack
    await ctx.scheduler.runAfter(0, api.paystack.createTransferRecipient, {
      name: args.accountName,
      accountNumber: args.accountNumber,
      bankCode: args.bankCode,
    });

    // Note: runAfter returns a Job ID, not the result.
    // We can't wait for result in a mutation.
    // We must call the action from the Client, get the code, then call this mutation.
    // OR: We define an action `setupBankAccount` that calls Paystack then calls this mutation.
    // I will go with the `setupBankAccount` action approach in a moment.
    // For now, let's assume this mutation receives the recipientCode.
    throw new Error('Use setupBankAccount action instead');
  },
});

export const saveBankAccountInternal = mutation({
  args: {
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.string(),
    bankName: v.string(),
    recipientCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    // Check if exists
    const existing = await ctx.db
      .query('bankAccounts')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accountNumber: args.accountNumber,
        accountName: args.accountName,
        bankCode: args.bankCode,
        bankName: args.bankName,
        recipientCode: args.recipientCode,
      });
    } else {
      await ctx.db.insert('bankAccounts', {
        userId: user._id,
        accountNumber: args.accountNumber,
        accountName: args.accountName,
        bankCode: args.bankCode,
        bankName: args.bankName,
        recipientCode: args.recipientCode,
        currency: 'NGN',
      });
    }
  },
});

export const recordWithdrawal = mutation({
  args: {
    amount: v.number(),
    recipientCode: v.string(),
    reference: v.string(),
    transferCode: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    await ctx.db.insert('withdrawals', {
      userId: user._id,
      amount: args.amount,
      recipientCode: args.recipientCode,
      reference: args.reference,
      transferCode: args.transferCode,
      status: args.status,
    });
  },
});
