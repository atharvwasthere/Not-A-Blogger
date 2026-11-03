import type { Post } from '@/lib/types'
import { useSiteSettings } from '@/features/settings/useSiteSettings'

/** The one place the cover rule lives: site-wide on, this post's switch on, and a print exists. */
export function usePrint(post: Pick<Post, 'print_url' | 'show_print'>): string | null {
    const { data: settings } = useSiteSettings()
    return settings?.covers_enabled && post.show_print && post.print_url ? post.print_url : null
}
