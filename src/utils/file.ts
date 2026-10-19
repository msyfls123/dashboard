const KB = 1024
const MB = 1024 * KB
const GB = 1024 * MB

export const displaySize = (size: number) => {
  if (size > GB) return `${(size / GB).toFixed(2)}GB`
  if (size > MB) return `${(size / MB).toFixed(2)}MB`
  return `${(size / KB).toFixed(2)}KB`
}
