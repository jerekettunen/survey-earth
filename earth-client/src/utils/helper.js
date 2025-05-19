export const formatDate = (dateValue) => {
  if (!dateValue) return 'Not set'

  try {
    // Handle ISO date strings (which is what we now send from backend)
    const date = new Date(dateValue)

    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    // Format with browser's locale
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    console.error('Date formatting error:', e)
    return 'Invalid date'
  }
}
