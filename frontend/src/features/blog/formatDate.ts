import { format } from 'date-fns'

/** "Sep 1, 2026". Labels that show it in capitals do so with CSS, so screen readers get the words. */
export const formatPostDate = (iso: string) => format(new Date(iso), 'MMM d, yyyy')
