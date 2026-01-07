import { z } from 'zod';

export const api = {
  // Webhook endpoint for Telegram
  webhook: {
    method: 'POST' as const,
    path: '/api/webhook',
    input: z.any(), // Telegram updates are complex objects
    responses: {
      200: z.object({ ok: z.boolean() }),
    },
  },
  // Endpoint to get bot stats for the landing page
  stats: {
    method: 'GET' as const,
    path: '/api/stats',
    responses: {
      200: z.object({
        activeUsers: z.number(),
        status: z.string(),
      }),
    },
  },
  // Endpoint to trigger the scheduler manually (simulation)
  triggerScheduler: {
    method: 'POST' as const,
    path: '/api/scheduler/trigger',
    responses: {
      200: z.object({ success: z.boolean(), message: z.string() }),
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
