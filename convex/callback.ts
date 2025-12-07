"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Handle Paystack callback after successful payment
 * This verifies the transaction and creates a purchase record
 */
export const handleCallback = action({
    args: {
        reference: v.string(),
    },
    returns: v.object({
        success: v.boolean(),
        reference: v.string(),
        email: v.string(),
        amount: v.number(),
        status: v.string(),
    }),
    handler: async (ctx, args) => {
        try {
            // 1. Verify the transaction with Paystack
            const transactionData: any = await ctx.runAction(api.paystack.verifyTransaction, {
                reference: args.reference,
            });

            console.log("Transaction data received:", JSON.stringify(transactionData, null, 2));

            // 2. Check if transaction was successful
            if (transactionData.status !== "success") {
                throw new Error(`Transaction was not successful. Status: ${transactionData.status}`);
            }

            // 3. Extract metadata
            // Metadata might already be an object or a JSON string
            console.log("Metadata type:", typeof transactionData.metadata);
            console.log("Metadata value:", transactionData.metadata);

            const metadata = typeof transactionData.metadata === 'string'
                ? JSON.parse(transactionData.metadata)
                : (transactionData.metadata || {});

            console.log("Parsed metadata:", metadata);

            const productId = metadata.productId;
            const productName = metadata.productName;
            const userId = metadata.userId;

            if (!productId || !userId) {
                console.error("Missing product info. Metadata:", metadata);
                throw new Error("Missing product information in transaction");
            }

            // 4. Get customer email from transaction
            const customerEmail: string = transactionData.customer.email;
            const amount: number = transactionData.amount;

            // 5. Create purchase record
            await ctx.runMutation(api.purchases.create, {
                userId: userId,
                productId: productId,
                customerEmail: customerEmail,
                paystackReference: args.reference,
                amount: amount,
                status: transactionData.status,
                productName: productName,
            });

            console.log("Purchase created successfully");

            return {
                success: true,
                reference: args.reference,
                email: customerEmail,
                amount: amount,
                status: transactionData.status,
            };
        } catch (error) {
            console.error("Callback handler error:", error);
            throw error;
        }
    },
});
