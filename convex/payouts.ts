"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const setupBankAccount = action({
    args: {
        accountNumber: v.string(),
        accountName: v.string(),
        bankCode: v.string(),
        bankName: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Create Recipient
        const recipientCode = await ctx.runAction(api.paystack.createTransferRecipient, {
            name: args.accountName,
            accountNumber: args.accountNumber,
            bankCode: args.bankCode,
        });

        // 2. Save to DB
        await ctx.runMutation(api.finance.saveBankAccountInternal, {
            accountNumber: args.accountNumber,
            accountName: args.accountName,
            bankCode: args.bankCode,
            bankName: args.bankName,
            recipientCode: recipientCode,
        });
    },
});

export const requestWithdrawal = action({
    args: {
        amount: v.number(), // kobo
    },
    returns: v.any(),
    handler: async (ctx, args) => {
        // 1. Check Balance
        const balance: number = await ctx.runQuery(api.finance.getBalance);
        if (balance < args.amount) {
            throw new Error(`Insufficient funds. Available: ₦${(balance / 100).toFixed(2)}`);
        }

        // 2. Get Bank Details
        // Define the bank account type based on your schema
        const bankAccount: any = await ctx.runQuery(api.finance.getBankAccount);
        if (!bankAccount || !bankAccount.recipientCode) {
            throw new Error("No bank account linked.");
        }

        // 3. Initiate Transfer
        const transferResult: any = await ctx.runAction(api.paystack.initiateTransfer, {
            amount: args.amount,
            recipient: bankAccount.recipientCode,
            reason: "LinkMi Withdrawal",
        });

        // 4. Record Withdrawal
        await ctx.runMutation(api.finance.recordWithdrawal, {
            amount: args.amount,
            recipientCode: bankAccount.recipientCode,
            reference: transferResult.reference,
            transferCode: transferResult.transfer_code,
            status: transferResult.status,
        });

        return transferResult;
    },
});
