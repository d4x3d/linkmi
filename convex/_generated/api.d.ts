/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as PurchaseEmail from "../PurchaseEmail.js";
import type * as analytics from "../analytics.js";
import type * as callback from "../callback.js";
import type * as email from "../email.js";
import type * as files from "../files.js";
import type * as finance from "../finance.js";
import type * as links from "../links.js";
import type * as payouts from "../payouts.js";
import type * as paystack from "../paystack.js";
import type * as products from "../products.js";
import type * as public_ from "../public.js";
import type * as purchases from "../purchases.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  PurchaseEmail: typeof PurchaseEmail;
  analytics: typeof analytics;
  callback: typeof callback;
  email: typeof email;
  files: typeof files;
  finance: typeof finance;
  links: typeof links;
  payouts: typeof payouts;
  paystack: typeof paystack;
  products: typeof products;
  public: typeof public_;
  purchases: typeof purchases;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  posthog: {
    lib: {
      trackEvent: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          event: string;
          host?: string;
          properties?: any;
          userId: string;
        },
        null
      >;
    };
  };
};
