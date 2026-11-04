import type { Post } from '@/lib/types'
import { cn } from '@/lib/utils'

/** The post's drawn icon; only icons (dark line art) are inverted on dark paper, never a cover photo. */
export function PostIcon({ post, className }: { post: Pick<Post, 'icon_url' | 'cover_image'>; className?: string }) {
    return (
        <img
            src={post.icon_url || post.cover_image || '/fallback-icon.svg'}
            alt=""
            className={cn('object-contain', post.icon_url && 'post-icon', className)}
        />
    )
}
