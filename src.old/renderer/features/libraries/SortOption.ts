export const SortOptions = [
  'Date (Newest First)',
  'Date (Oldest First)',
  'Size',
  'Name (A-Z)',
  'Name (Z-A)',
] as const

type SortOption = (typeof SortOptions)[number]

export default SortOption
