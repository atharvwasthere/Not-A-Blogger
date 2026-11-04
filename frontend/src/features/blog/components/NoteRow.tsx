import { Link } from '@tanstack/react-router'
import type { Post } from '@/lib/types'
import { PostIcon } from './PostIcon'
import { PostMeta } from './PostMeta'
import { postDate } from '../formatDate'

export function NoteRow({ post }: { post: Post }) {
    return (
        <li>
            <Link to="/blog/$slug" params={{ slug: post.slug }} className="group grid grid-cols-[44px_minmax(0,1fr)] items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-rule bg-wash">
                    <PostIcon post={post} className="h-[26px] w-[26px]" />
                </span>
                <span>
                    <span className="block font-sans text-[15.5px] leading-[1.4] text-ink decoration-faint underline-offset-4 group-hover:underline">
                        {post.title}
                    </span>
                    <PostMeta date={postDate(post)} readingTime={post.reading_time} className="mt-[3px] block font-sans text-[13.5px] text-soft" />
                </span>
            </Link>
        </li>
    )
}
