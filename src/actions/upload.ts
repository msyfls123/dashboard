import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { env } from 'cloudflare:workers'

export const upload = {
  create: defineAction({
    input: z.object({
      key: z.string(),
      contentType: z.string(),
    }),
    handler: async (input) => {
      const multipartUpload = await env.bucket.createMultipartUpload(input.key, {
        httpMetadata: {
          contentType: input.contentType,
        }
      });
      return {
        key: multipartUpload.key,
        uploadId: multipartUpload.uploadId
      }
    }
  }),
  part: defineAction({
    accept: 'form',
    input: z.object({
      key: z.string(),
      uploadId: z.string(),
      file: z.instanceof(File),
      partNumber: z.number()
    }),
    handler: async ({ key, uploadId, file, partNumber }) => {
      const multipartUpload = env.bucket.resumeMultipartUpload(key, uploadId)
      const result = await multipartUpload.uploadPart(Number(partNumber), file)
      return {
        partNumber: result.partNumber,
        etag: result.etag
      }
    },
  }),
  complete: defineAction({
    input: z.object({
      key: z.string(),
      uploadId: z.string(),
      parts: z.array(z.object({
        partNumber: z.number(),
        etag: z.string()
      }))
    }),
    handler: async (input) => {
      const { key, uploadId, parts } = input
      const multipartUpload = env.bucket.resumeMultipartUpload(key, uploadId)
      const object = await multipartUpload.complete(parts);
      return {
        key: object.key,
				etag: object.httpEtag,
      }
    }
  }),
  abort: defineAction({
    input: z.object({
      key: z.string(),
      uploadId: z.string(),
    }),
    handler: async (input) => {
      const { key, uploadId } = input
       const multipartUpload = env.bucket.resumeMultipartUpload(key, uploadId)
       await multipartUpload.abort()
    }
  })
}
