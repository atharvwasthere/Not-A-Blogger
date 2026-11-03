import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { MainLayout } from '@/shared/layout/MainLayout'
import { BrowsePage } from '@/shared/layout/BrowsePage'
import { PageHeading } from '@/shared/layout/PageHeading'
import { NotFound } from '@/shared/components/NotFound'
import { postsQueryOptions, usePosts } from '@/features/blog/hooks/usePosts'
import { NoteGrid } from '@/features/blog/components/NoteGrid'
import { findTopic, topicLabel } from '@/theme/topics'

export const Route = createFileRoute('/topics/$topic')({
    loader: async ({ context: { queryClient }, params: { topic } }) => {
        const found = findTopic(await queryClient.ensureQueryData(postsQueryOptions), topic)
        if (!found) throw notFound()
        return { label: topicLabel(found.tag) }
    },
    head: ({ loaderData }) =>
        loaderData
            ? {
                  meta: [
                      { title: `${loaderData.label} — Not a Blogger` },
                      { name: 'description', content: `Notes on ${loaderData.label.toLowerCase()} by Atharv Singh.` },
                  ],
              }
            : {},
    component: TopicPage,
    notFoundComponent: NotFound,
})

function TopicPage() {
    const { topic } = Route.useParams()
    const found = findTopic(usePosts(), topic)
    if (!found) return <NotFound />

    return (
        <MainLayout variant="browse">
            <BrowsePage>
                <PageHeading
                    label={<Link to="/topics" className="hover:underline">Topics /</Link>}
                    title={topicLabel(found.tag)}
                />
                <NoteGrid posts={found.posts} />
            </BrowsePage>
        </MainLayout>
    )
}
