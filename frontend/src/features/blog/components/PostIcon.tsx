import type { Post } from '@/lib/types'
import { cn } from '@/lib/utils'

/** The post's drawn icon. Icons are dark line art, so `post-icon` inverts them on dark paper. */
export function PostIcon({ post, className }: { post: Pick<Post, 'icon_url' | 'cover_image'>; className?: string }) {
    return (
        <img
            src={post.icon_url || post.cover_image || '/fallback-icon.svg'}
            alt=""
            className={cn('post-icon object-contain', className)}
        />
    )
}
