import { differenceInCalendarDays, format } from 'date-fns'
import type { Post } from '@/lib/types'
import { postUrl } from '@/lib/site'
import { formatPostDate } from '../formatDate'
import { BasedOn } from './BasedOn'
import { CopyLinkButton } from './CopyLinkButton'

const Dot = () => <span aria-hidden className="inline-block h-[3px] w-[3px] rounded-full bg-faint" />

export function ArticleHeader({ post }: { post: Post }) {
    const updated = differenceInCalendarDays(new Date(post.updated_at), new Date(post.created_at)) >= 1

    return (
        <header>
            <div className="mb-[18px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-soft">
                    <time dateTime={post.created_at}>{formatPostDate(post.created_at)}</time>
                    <Dot />
                    <span>{post.reading_time || 1} min read</span>
                    {updated && (
                        <>
                            <Dot />
                            <em className="normal-case tracking-[0.02em]">
                                Updated <time dateTime={post.updated_at}>{format(new Date(post.updated_at), 'MMM d')}</time>
                            </em>
                        </>
                    )}
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
