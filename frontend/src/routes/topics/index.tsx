import { createFileRoute, Link } from '@tanstack/react-router'
import { MainLayout } from '@/shared/layout/MainLayout'
import { BrowsePage } from '@/shared/layout/BrowsePage'
import { PageHeading } from '@/shared/layout/PageHeading'
import { postsQueryOptions, usePosts } from '@/features/blog/hooks/usePosts'
import { NoteRow } from '@/features/blog/components/NoteRow'
import { groupByTopic, topicLabel, topicSlug } from '@/theme/topics'

export const Route = createFileRoute('/topics/')({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(postsQueryOptions),
    head: () => ({
        meta: [
            { title: 'Topics — Not a Blogger' },
            { name: 'description', content: 'What Atharv Singh writes about on Not a Blogger, grouped by topic.' },
        ],
    }),
    component: TopicsPage,
})

function TopicsPage() {
    const topics = [...groupByTopic(usePosts())]
    return (
        <MainLayout variant="browse">
            <BrowsePage>
                <PageHeading label="Topics" title="What I write about" />
                <div>
                    {topics.map(([tag, posts]) => (
                        <section
                            key={tag}
                            aria-labelledby={`topic-${topicSlug(tag)}`}
                            className="grid grid-cols-1 gap-3.5 border-t border-rule py-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10"
                        >
                            <div>
                                <h2 id={`topic-${topicSlug(tag)}`} className="mb-1.5 text-[30px] font-normal text-ink">
                                    <Link
                                        to="/topics/$topic"
                                        params={{ topic: topicSlug(tag) }}
                                        className="decoration-faint underline-offset-[5px] hover:underline"
                                    >
                                        {topicLabel(tag)}
                                    </Link>
                                </h2>
                                <span className="font-mono text-xs uppercase tracking-[0.06em] text-soft">
                                    {posts.length} {posts.length === 1 ? 'note' : 'notes'}
                                </span>
                            </div>
                            <ul className="grid gap-[22px]">
                                {posts.map(post => <NoteRow key={post.slug} post={post} />)}
                            </ul>
                        </section>
                    ))}
                </div>
            </BrowsePage>
        </MainLayout>
    )
}
