export type ChargingSpotRecord = Record<string, string>

export const LAST_CHARGING_SPOTS_KEY = 'LAST_CHARGING_SPOTS'

export const sortDates = (dates: string[]) => {
  const sorted = dates.slice()
  sorted.sort((a,b) => {
      const [yearA, monthA, dayA] = a.split('-').map(v => parseInt(v, 10))
      const [yearB, monthB, dayB] = b.split('-').map(v => parseInt(v, 10))
      return (yearA - yearB) || (monthA - monthB) || (dayA - dayB)
  })
  return sorted
}

export const DEFAULT_PREFIX = '20240925'
export const MAX_KEY_LENGTH = 12
export const CHARGING_URL_PATTERN = 'http://wx.klchong.cn/html/qrcode.html?g={key}01'
