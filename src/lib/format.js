export function toTitleCase(value) {
  if (!value) return ''
  return value
    .toString()
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}
