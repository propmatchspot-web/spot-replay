/**
 * DATE UTILITIES - PERMANENT TIMEZONE-SAFE DATE HANDLING
 * 
 * ⚠️ IMPORTANT: DO NOT MODIFY THIS FILE UNLESS YOU UNDERSTAND TIMEZONE ISSUES ⚠️
 * 
 * THE PROBLEM:
 * When JavaScript parses a date string like "2025-12-01" using `new Date("2025-12-01")`,
 * it interprets this as midnight UTC (00:00 UTC), NOT midnight local time.
 * 
 * In Pakistan (UTC+5), this means:
 *   new Date("2025-12-01") → "2025-11-30T19:00:00" in local time (WRONG!)
 * 
 * This causes selected dates to appear 3-5 hours behind when displayed or converted.
 * 
 * THE SOLUTION:
 * Parse the date string manually and create a Date object in LOCAL time,
 * then convert to ISO string properly.
 * 
 * USAGE:
 *   import { localDateToUTC, formatDateForInput } from '@/utils/date-utils'
 *   
 *   // When sending date to server:
 *   const isoString = localDateToUTC('2025-12-01') // '2025-12-01T00:00:00.000Z'
 *   
 *   // When displaying/formatting for input:
 *   formatDateForInput(isoString) // '2025-12-01'
 */

/**
 * Converts a local date string (YYYY-MM-DD) to a UTC ISO string
 * that represents midnight UTC on that specific date.
 * 
 * This ensures "2025-12-01" becomes "2025-12-01T00:00:00.000Z" EXACTLY,
 * regardless of the user's timezone.
 * 
 * @param dateString - Local date string in YYYY-MM-DD format (from HTML date input)
 * @returns ISO string representing midnight UTC on that date
 */
export function localDateToUTC(dateString: string): string {
    if (!dateString) return ''

    // Parse the date parts directly from the string
    const [year, month, day] = dateString.split('-').map(Number)

    // Create a UTC date at midnight for the specified date
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))

    return utcDate.toISOString()
}

/**
 * Converts a local date string (YYYY-MM-DD) to a Unix timestamp (seconds)
 * representing midnight UTC on that specific date.
 * 
 * @param dateString - Local date string in YYYY-MM-DD format
 * @returns Unix timestamp in seconds
 */
export function localDateToUnixSeconds(dateString: string): number {
    if (!dateString) return 0

    const [year, month, day] = dateString.split('-').map(Number)
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))

    return Math.floor(utcDate.getTime() / 1000)
}

/**
 * Converts an ISO string or Date object back to a YYYY-MM-DD string
 * for use in HTML date inputs.
 * 
 * @param dateInput - ISO string or Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(dateInput: string | Date): string {
    if (!dateInput) return ''

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

    // Extract UTC date components to avoid timezone shifting
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Parses an ISO string and returns the date in YYYY-MM-DD format
 * based on UTC time (not local time).
 * 
 * @param isoString - ISO date string
 * @returns Date string in YYYY-MM-DD format
 */
export function isoToDateString(isoString: string): string {
    if (!isoString) return ''
    return isoString.split('T')[0]
}

/**
 * Creates a Date object that represents midnight LOCAL TIME on the given date.
 * This is different from `new Date("YYYY-MM-DD")` which creates UTC midnight.
 * 
 * @param dateString - Local date string in YYYY-MM-DD format
 * @returns Date object representing midnight local time
 */
export function parseLocalDate(dateString: string): Date {
    if (!dateString) return new Date()

    const [year, month, day] = dateString.split('-').map(Number)

    // Create date in local time
    return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Safely compares two date strings regardless of timezone.
 * Both dates are normalized to YYYY-MM-DD format before comparison.
 * 
 * @param date1 - First date (ISO string or YYYY-MM-DD)
 * @param date2 - Second date (ISO string or YYYY-MM-DD)
 * @returns true if dates represent the same calendar day
 */
export function isSameDateUTC(date1: string, date2: string): boolean {
    const d1 = date1.split('T')[0]
    const d2 = date2.split('T')[0]
    return d1 === d2
}
