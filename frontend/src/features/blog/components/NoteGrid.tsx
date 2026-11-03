import type { Post } from '@/lib/types'
import { NoteCard } from './NoteCard'

/** Newspaper columns: 3 on wide content, 2 on narrow desktop, 1 on phones. */
export function NoteGrid({ posts }: { posts: Post[] }) {
    return (
        <div className="@container">
            <div className="columns-1 gap-5 @md:columns-2 @[56rem]:columns-3">
                {posts.map(post => <NoteCard key={post.slug} post={post} />)}
            </div>
        </div>
    )
}
