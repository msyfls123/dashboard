import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from "cloudflare:workers";

export const bucket = {
  list: defineAction({
    input: z.object({
      limit: z.number().optional(),
      cursor: z.string().optional(),
    }),
    handler: async (input) => {
      const data = await env.bucket.list({
        limit: input.limit ?? 20,
        cursor: input.cursor
      })
      return {
        objects: data.objects.map(item => ({
          key: item.key,
          size: item.size,
          uploaded: item.uploaded
        })),
        cursor: data.truncated ? data.cursor : undefined
      }
    }
  })
}
