import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { Post } from '@/lib/types'
import { PostIcon } from './PostIcon'
import { PostMeta } from './PostMeta'
import { postDate } from '../formatDate'

export function LatestNote({ post }: { post: Post }) {
    return (
        <section aria-labelledby="latest-note">
            <p id="latest-note" className="section-label mb-[18px]">Latest note</p>
            <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group grid grid-cols-1 gap-4 rounded-[14px] border border-rule bg-card px-[22px] py-6 transition-colors hover:border-faint md:grid-cols-[120px_minmax(0,1fr)] md:gap-10 md:px-10 md:pb-8 md:pt-10 xl:grid-cols-[150px_minmax(0,1.6fr)_minmax(0,1fr)] xl:items-center"
            >
                <span className="flex md:justify-center">
                    <PostIcon post={post} className="h-14 w-14 md:h-[104px] md:w-[104px]" />
                </span>
                <span>
                    <h2 className="mb-3.5 text-balance text-[30px] font-normal leading-[1.14] text-ink md:mb-5 md:text-[clamp(30px,3cqi,40px)]">
                        {post.title}
                    </h2>
                    <PostMeta
                        date={postDate(post)}
                        readingTime={post.reading_time}
                        className="font-mono text-[13px] uppercase tracking-[0.08em] text-soft"
                    />
                </span>
                <span className="flex h-full flex-col justify-between gap-[18px] md:col-span-full md:gap-[26px] xl:col-span-1">
                    {post.excerpt && (
                        <p className="line-clamp-7 font-mono text-[13px] leading-[1.8] text-ink md:text-sm">{post.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-2.5 self-end text-[14.5px] text-ink">
                        Read note
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[3px]" strokeWidth={1.4} aria-hidden />
                    </span>
                </span>
            </Link>
        </section>
    )
}
