import { defineAction } from 'astro:actions'

import { z } from 'astro/zod'
import { env } from 'cloudflare:workers'
import { LAST_CHARGING_SPOTS_KEY, sortDates } from '@/consts/parking'
import type { ChargingSpotRecord } from '../consts/parking';

export const parking = {
  getLastChargingSpots: defineAction({
    handler: async (): Promise<ChargingSpotRecord> => {
      const data = await env.CHARGING_SPOT_KV.get(LAST_CHARGING_SPOTS_KEY)
      if (!data) return {}
      try {
        const spots = JSON.parse(data) as ChargingSpotRecord
        return spots
      } catch (err) {
        return {}
      }
    }
  }),
  setLastChargingSpot: defineAction({
    input: z.object({
      key: z.string(),
      date: z.string(),
    }),
    handler: async (input) => {
      const data = await env.CHARGING_SPOT_KV.get(LAST_CHARGING_SPOTS_KEY)
      let newSpots = {
        [input.date]: input.key
      }
      if (data) {
        try {
          const spots = JSON.parse(data) as ChargingSpotRecord
          newSpots = {
            ...spots,
            ...newSpots,
          }
          const slicedDates = sortDates(Object.keys(newSpots)).slice(0, 3)
          newSpots = slicedDates.reduce((acc, date) => ({
            ...acc,
            [date]: newSpots[date]
          }), {})
        } catch (err) { }
      }
      await env.CHARGING_SPOT_KV.put(LAST_CHARGING_SPOTS_KEY, JSON.stringify(newSpots))
      await env.CHARGING_SPOT_KV.put(`charging-${input.date}`, input.key)
      return newSpots
    }
  })
}
