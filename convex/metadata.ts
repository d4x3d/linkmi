'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';

type MetadataResult = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
};

export const fetchMetadata = action({
  args: { url: v.string() },
  returns: v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    siteName: v.optional(v.string()),
    type: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<MetadataResult> => {
    try {
      const og = require('open-graph');
      
      return new Promise<MetadataResult>((resolve) => {
        og(args.url, (err: any, meta: any) => {
          if (err) {
            console.error('Error fetching metadata:', err);
            resolve({});
            return;
          }

          resolve({
            title: meta.title,
            description: meta.description,
            image: typeof meta.image === 'string' ? meta.image : meta.image?.url,
            siteName: meta.site_name,
            type: meta.type,
          });
        });
      });
    } catch (error) {
      console.error('Error in fetchMetadata:', error);
      return {};
    }
  },
});
