const invalidStrings = ['', 'undefined', 'null']

/**
 * Checks if a value is actually a string, and not
 * equal to "null", "undefined", or ""
 * @param val The value to check
 */
export default function isValidString(val?: string | null): val is string {
  return (
    val != null &&
    typeof val === 'string' &&
    !invalidStrings.includes(val.trim())
  )
}
