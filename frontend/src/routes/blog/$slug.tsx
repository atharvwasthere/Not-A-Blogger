import { createFileRoute, notFound } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { MainLayout } from '@/components/layout/MainLayout'
import { NotFound } from '@/components/NotFound'

export const Route = createFileRoute('/blog/$slug')({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        try {
            return await queryClient.ensureQueryData(
                queryOptions({
                    queryKey: ['posts', slug],
                    queryFn: () => api.getPostBySlug(slug),
                })
            )
        } catch (error: any) {
            if (error.message?.includes('404')) {
                throw notFound()
            }
            throw error
        }
    },
    head: ({ loaderData: post }) => {
        if (!post) return {}
        const siteUrl = 'https://blogs.atharvsingh.me'
        const postUrl = `${siteUrl}/blog/${post.slug}`
        const metaTitle = post.seo_title || `${post.title} | Atharv Singh — Not a Blogger`
        const metaDesc = post.seo_description || post.excerpt || `${post.title}. By Atharv Singh on Not a Blogger.`
        return {
            meta: [
                { title: metaTitle },
                { name: 'description', content: metaDesc },
                { name: 'author', content: 'Atharv Singh' },
                // Open Graph
                { property: 'og:title', content: metaTitle },
                { property: 'og:description', content: metaDesc },
                { property: 'og:type', content: 'article' },
                { property: 'og:url', content: postUrl },
                { property: 'og:site_name', content: 'Not a Blogger' },
                ...(post.cover_image ? [
                    { property: 'og:image', content: post.cover_image },
                    { property: 'og:image:alt', content: `Cover image for ${post.title}` }
                ] : []),
                { property: 'article:published_time', content: new Date(post.created_at).toISOString() },
                { property: 'article:modified_time', content: new Date(post.updated_at).toISOString() },
                { property: 'article:author', content: 'https://blogs.atharvsingh.me' },
                // Twitter Cards
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: metaTitle },
                { name: 'twitter:description', content: metaDesc },
                { name: 'twitter:site', content: '@atharvwasthere' },
                { name: 'twitter:creator', content: '@atharvwasthere' },
                ...(post.cover_image ? [{ name: 'twitter:image', content: post.cover_image }] : []),
            ],
            links: [
                { rel: 'canonical', href: postUrl },
            ],
            scripts: [
                {
                    type: 'application/ld+json',
                    children: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: post.title,
                        url: postUrl,
                        datePublished: new Date(post.created_at).toISOString().split('T')[0],
                        dateModified: new Date(post.updated_at).toISOString().split('T')[0],
                        description: metaDesc,
                        ...(post.cover_image ? { image: post.cover_image } : {}),
                        author: {
                            '@type': 'Person',
                            name: 'Atharv Singh',
                            url: siteUrl,
                        },
                        publisher: {
                            '@type': 'Blog',
                            name: 'Not a Blogger',
                            url: siteUrl,
                        },
                    }),
                },
            ],
        }
    },
    component: BlogPost,
    notFoundComponent: NotFound,
})

function BlogPost() {
    const { slug } = Route.useParams()
    const { data: post } = useSuspenseQuery(
        queryOptions({
            queryKey: ['posts', slug],
            queryFn: () => api.getPostBySlug(slug),
        })
    )

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-500">
                <div className="mb-12">
                    <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span>{format(new Date(post.created_at), "MMMM d, yyyy")}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span>{post.reading_time || 1} min read</span>
                        {post.updated_at !== post.created_at && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                <span className="text-zinc-500 italic">
                                    Updated {format(new Date(post.updated_at), "MMM d")}
                                </span>
                            </>
                        )}
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-zinc-900 leading-[1.1] mb-8">
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p className="text-xl leading-relaxed text-zinc-500 font-serif italic border-l-2 border-zinc-100 pl-6">
                            {post.excerpt}
                        </p>
                    )}
                </div>

                <article className="prose prose-zinc max-w-none font-serif prose-headings:font-serif prose-headings:font-normal prose-p:text-zinc-600 prose-p:leading-loose">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
            </div>
        </MainLayout>
    )
}
