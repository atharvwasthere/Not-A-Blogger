import { createFileRoute, Link } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { MainLayout } from '@/shared/layout/MainLayout'

const seriesQueryOptions = (slug: string) =>
    queryOptions({
        queryKey: ['series', slug],
        queryFn: () => api.getSeries(slug),
    })

export const Route = createFileRoute('/series/$slug')({
    loader: ({ context: { queryClient }, params: { slug } }) =>
        queryClient.ensureQueryData(seriesQueryOptions(slug)),
    head: ({ params: { slug } }) => ({
        meta: [
            { title: `${slug} — a series | Not a Blogger` },
            { name: 'description', content: `A reading sequence on Not a Blogger: the ${slug} series by Atharv Singh.` },
        ],
    }),
    component: SeriesPage,
})

function SeriesPage() {
    const { slug } = Route.useParams()
    const { data: posts } = useSuspenseQuery(seriesQueryOptions(slug))

    return (
        <MainLayout showSidebar={false}>
            <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                <header className="mb-12 space-y-3">
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Series</p>
                    <h1 className="font-serif text-4xl md:text-5xl text-foreground capitalize">{slug}</h1>
                    <p className="font-sans text-sm text-muted-foreground">
                        Read in order — a deliberate sequence, not a reverse-chron feed.
                    </p>
                </header>

                {posts.length === 0 ? (
                    <p className="font-serif italic text-muted-foreground">No posts in this series yet.</p>
                ) : (
                    <ol className="space-y-0 border-t border-border">
                        {posts.map((post, i) => (
                            <li key={post.slug}>
                                <Link
                                    to="/blog/$slug"
                                    params={{ slug: post.slug }}
                                    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-border py-6 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                >
                                    <span className="font-mono text-sm text-muted-foreground">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="space-y-1">
                                        <h2 className="font-serif text-xl text-foreground group-hover:underline decoration-1 underline-offset-4 decoration-muted-foreground">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="font-mono text-xs text-muted-foreground line-clamp-1">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </MainLayout>
    )
}
