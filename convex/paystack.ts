"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

const paystackApiBaseUrl = "https://api.paystack.co";

/**
 * Initializes a Paystack transaction.
 * This is an internal action, callable from other mutations.
 */
export const initializeTransaction = action({
    args: {
        email: v.string(),
        amount: v.number(), // Amount in Kobo
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ authorization_url: string; access_code: string; reference: string }> => {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        const paystackCallbackUrl = process.env.PAYSTACK_CALLBACK_URL;

        if (!paystackSecretKey) {
            throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables.");
        }
        if (!paystackCallbackUrl) {
            throw new Error("PAYSTACK_CALLBACK_URL is not set in environment variables.");
        }

        const response = await fetch(`${paystackApiBaseUrl}/transaction/initialize`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: args.email,
                amount: args.amount,
                callback_url: paystackCallbackUrl,
                metadata: args.metadata,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            console.error("Paystack API Error:", data);
            throw new Error(`Paystack transaction initialization failed: ${data.message}`);
        }

        return {
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        };
    },
});

/**
 * Verifies a Paystack transaction using its reference.
 * This is an action, callable from other actions.
 */
export const verifyTransaction = action({
    args: {
        reference: v.string(),
    },
    returns: v.any(),
    handler: async (ctx, args): Promise<any> => { // Returns the full data object from Paystack
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables.");
        }

        const response = await fetch(`${paystackApiBaseUrl}/transaction/verify/${args.reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            console.error("Paystack API Error:", data);
            throw new Error(`Paystack transaction verification failed: ${data.message}`);
        }

        return data.data;
    },
});

export const listBanks = action({
    args: {},
    returns: v.any(),
    handler: async () => {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY missing");

        const response = await fetch(`${paystackApiBaseUrl}/bank?currency=NGN`, {
            headers: { Authorization: `Bearer ${paystackSecretKey}` },
        });
        const data = await response.json();
        return data.data;
    },
});

export const resolveAccount = action({
    args: { accountNumber: v.string(), bankCode: v.string() },
    returns: v.any(),
    handler: async (ctx, args) => {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY missing");

        const response = await fetch(
            `${paystackApiBaseUrl}/bank/resolve?account_number=${args.accountNumber}&bank_code=${args.bankCode}`,
            {
                headers: { Authorization: `Bearer ${paystackSecretKey}` },
            }
        );
        const data = await response.json();
        if (!data.status) throw new Error(data.message || "Account resolution failed");
        return data.data;
    },
});

export const createTransferRecipient = action({
    args: {
        name: v.string(),
        accountNumber: v.string(),
        bankCode: v.string(),
    },
    returns: v.string(), // Returns recipient code
    handler: async (ctx, args) => {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY missing");

        const response = await fetch(`${paystackApiBaseUrl}/transferrecipient`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "nuban",
                name: args.name,
                account_number: args.accountNumber,
                bank_code: args.bankCode,
                currency: "NGN",
            }),
        });
        const data = await response.json();
        if (!data.status) throw new Error(data.message || "Recipient creation failed");
        return data.data.recipient_code;
    },
});

export const initiateTransfer = action({
    args: {
        amount: v.number(), // in kobo
        recipient: v.string(),
        reason: v.optional(v.string()),
    },
    returns: v.any(),
    handler: async (ctx, args) => {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) throw new Error("PAYSTACK_SECRET_KEY missing");

        const response = await fetch(`${paystackApiBaseUrl}/transfer`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source: "balance",
                amount: args.amount,
                recipient: args.recipient,
                reason: args.reason || "Withdrawal",
            }),
        });
        const data = await response.json();
        if (!data.status) {
            console.error("Transfer Error", data);
            throw new Error(data.message || "Transfer initiation failed");
        }
        return data.data;
    },
});