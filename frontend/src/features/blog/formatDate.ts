import { format } from 'date-fns'
import type { Post } from '@/lib/types'

/** "Sep 1, 2026". Labels that show it in capitals do so with CSS, so screen readers get the words. */
export const formatPostDate = (iso: string) => format(new Date(iso), 'MMM d, yyyy')

/** The date a post shows: when it was published, or for a draft, when it was started. */
export const postDate = (post: Pick<Post, 'published_at' | 'created_at'>) => post.published_at ?? post.created_at
