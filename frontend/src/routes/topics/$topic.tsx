import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { MainLayout } from '@/shared/layout/MainLayout'
import { BrowsePage } from '@/shared/layout/BrowsePage'
import { PageHeading } from '@/shared/layout/PageHeading'
import { NotFound } from '@/shared/components/NotFound'
import { postsQueryOptions, usePosts } from '@/features/blog/hooks/usePosts'
import { NoteGrid } from '@/features/blog/components/NoteGrid'
import { findTopic, topicLabel, topicSlug } from '@/theme/topics'
import { canonical } from '@/lib/site'

export const Route = createFileRoute('/topics/$topic')({
    loader: async ({ context: { queryClient }, params: { topic } }) => {
        const slug = topicSlug(topic)
        if (slug && slug !== topic) throw redirect({ to: '/topics/$topic', params: { topic: slug }, statusCode: 301 })
        const found = findTopic(await queryClient.ensureQueryData(postsQueryOptions), topic)
        if (!found) throw notFound()
        return { label: topicLabel(found.tag), slug }
    },
    head: ({ loaderData }) =>
        loaderData
            ? {
                  meta: [
                      { title: `${loaderData.label} — Not a Blogger` },
                      { name: 'description', content: `Notes on ${loaderData.label.toLowerCase()} by Atharv Singh.` },
                  ],
                  links: [canonical(`/topics/${loaderData.slug}`)],
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
                <NoteGrid posts={found.posts} topic={found.tag} />
            </BrowsePage>
        </MainLayout>
    )
}
