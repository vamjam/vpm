export const isNullOrEmpty = (
  value?: string | null
): value is null | undefined | '' => {
  if (value == null || value?.trim() === '') {
    return true
  }

  return false
}
