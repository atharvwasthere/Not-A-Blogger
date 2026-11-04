import type { Post } from '@/lib/types'
import { postUrl } from '@/lib/site'
import { formatPostDate, postDate } from '../formatDate'
import { BasedOn } from './BasedOn'
import { CopyLinkButton } from './CopyLinkButton'

const Dot = () => <span aria-hidden className="inline-block h-[3px] w-[3px] rounded-full bg-faint" />

export function ArticleHeader({ post }: { post: Post }) {
    return (
        <header>
            <div className="mb-[18px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-soft">
                    <time dateTime={postDate(post)}>{formatPostDate(postDate(post))}</time>
                    <Dot />
                    <span>{post.reading_time || 1} min read</span>
                </p>
                <CopyLinkButton url={postUrl(post.slug)} title={post.title} />
            </div>
            <h1 className="mb-[22px] text-balance text-[clamp(36px,6cqi,56px)] font-normal leading-[1.08] text-ink">
                {post.title}
            </h1>
            {post.based_on && <BasedOn source={post.based_on} />}
        </header>
    )
}
