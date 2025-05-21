/**
 * Validates if the given input can be parsed into a valid date
 * @param {string|Date} dateInput - The date input to validate
 * @returns {boolean} True if valid date, false otherwise
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false

  try {
    const date = new Date(dateInput)
    return !isNaN(date.getTime())
  } catch (e) {
    return false
  }
}

/**
 * Safely parses a date string into a Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date} Parsed Date object or new Date() if invalid
 */
export const parseDate = (dateString) => {
  // Handle different date formats
  if (!dateString) return new Date()

  try {
    // First try direct conversion
    const parsed = new Date(dateString)

    // Check if it's a valid date
    if (isNaN(parsed.getTime())) {
      // If date is in format "YYYYMMDD" (like from Sentinel ID)
      if (/^\d{8}$/.test(dateString)) {
        const year = dateString.substring(0, 4)
        const month = dateString.substring(4, 6)
        const day = dateString.substring(6, 8)
        return new Date(`${year}-${month}-${day}`)
      }

      // If parsing still fails, return current date
      return new Date()
    }

    return parsed
  } catch (error) {
    console.error('Date parsing error:', error)
    return new Date()
  }
}

/**
 * Formats a date value for display
 * @param {string|Date} dateValue - The date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, options = {}) => {
  if (!dateValue) return 'Not set'
  if (!isValidDate(dateValue)) return 'Invalid date'

  try {
    // Parse the date
    const date = parseDate(dateValue)

    // Format with browser's locale
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    })
  } catch (e) {
    console.error('Date formatting error:', e)
    return 'Invalid date'
  }
}

/**
 * Format a date with a specific format pattern
 * For use with date-fns format function
 * @param {string|Date} dateValue - The date to format
 * @param {Function} formatFn - The format function (like date-fns format)
 * @param {string} formatPattern - Format pattern to use
 * @param {string} fallback - Fallback string if date is invalid
 */
export const formatDateWithPattern = (
  dateValue,
  formatFn,
  formatPattern = 'PPP',
  fallback = 'Unknown date'
) => {
  if (!dateValue || !isValidDate(dateValue)) return fallback

  try {
    const date = parseDate(dateValue)
    return formatFn(date, formatPattern)
  } catch (e) {
    console.error('Date pattern formatting error:', e)
    return fallback
  }
}
