import { Link } from '@tanstack/react-router'
import type { Post } from '@/lib/types'
import { topicLabel, topicTint } from '@/theme/topics'
import { formatPostDate } from '../formatDate'

/** One post in the newspaper grid, on the page's topic tint, or else its first topic's. */
export function NoteCard({ post, topic }: { post: Post; topic?: string }) {
    return (
        <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            style={{ background: topicTint(topic ?? post.tags[0]) }}
            className="mb-5 block break-inside-avoid rounded-[4px] px-[18px] pb-[22px] pt-4 transition-[filter] duration-200 hover:brightness-[.97] dark:hover:brightness-[1.15]"
        >
            <span className="font-mono text-[12.5px] uppercase tracking-[0.04em] text-ink">{formatPostDate(post.created_at)}</span>
            <h3 className="mb-2 mt-[18px] text-balance text-[27px] font-normal leading-[1.15] text-ink">{post.title}</h3>
            {post.tags.length > 0 && (
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-body">{post.tags.map(topicLabel).join(' · ')}</span>
            )}
            {post.excerpt && <p className="mt-[18px] font-serif text-[17px] leading-normal text-ink">{post.excerpt}</p>}
        </Link>
    )
}
