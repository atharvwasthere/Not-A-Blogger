import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/shared/layout/MainLayout'
import { BrowsePage } from '@/shared/layout/BrowsePage'
import { PageHeading } from '@/shared/layout/PageHeading'
import { postsQueryOptions, usePosts } from '@/features/blog/hooks/usePosts'
import { NoteGrid } from '@/features/blog/components/NoteGrid'

export const Route = createFileRoute('/notes/')({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(postsQueryOptions),
    head: () => ({
        meta: [
            { title: 'Notes — Not a Blogger' },
            { name: 'description', content: 'Every note on Not a Blogger by Atharv Singh, newest first.' },
        ],
    }),
    component: NotesPage,
})

function NotesPage() {
    const posts = usePosts()
    return (
        <MainLayout variant="browse">
            <BrowsePage>
                <PageHeading label="Notes" title="Everything, newest first" />
                <NoteGrid posts={posts} />
            </BrowsePage>
        </MainLayout>
    )
}
