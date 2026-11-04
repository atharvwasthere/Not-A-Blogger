import { createFileRoute, notFound } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { NotFound } from '@/shared/components/NotFound'
import { postQueryOptions, usePost } from '@/features/blog/hooks/usePosts'
import { useCodeHighlighting } from '@/features/blog/hooks/useCodeHighlighting'
import { useEmbedFrames } from '@/features/blog/hooks/useEmbedFrames'
import { useReferences } from '@/features/blog/hooks/useReferences'
import { ArticleHeader } from '@/features/blog/components/ArticleHeader'
import { SITE_URL, postUrl } from '@/lib/site'
import { postDate } from '@/features/blog/formatDate'
import { SubscribeForm } from '@/shared/layout/SubscribeForm'

export const Route = createFileRoute('/blog/$slug')({
    loader: async ({ context: { queryClient }, params: { slug } }) => {
        try {
            return await queryClient.ensureQueryData(postQueryOptions(slug))
        } catch (error: any) {
            if (error.message?.includes('404')) {
                throw notFound()
            }
            throw error
        }
    },
    head: ({ loaderData: post }) => {
        if (!post) return {}
        const url = postUrl(post.slug)
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
                { property: 'og:url', content: url },
                { property: 'og:site_name', content: 'Not a Blogger' },
                ...(post.cover_image ? [
                    { property: 'og:image', content: post.cover_image },
                    { property: 'og:image:alt', content: `Cover image for ${post.title}` }
                ] : []),
                { property: 'article:published_time', content: new Date(postDate(post)).toISOString() },
                { property: 'article:modified_time', content: new Date(post.updated_at).toISOString() },
                { property: 'article:author', content: SITE_URL },
                // Twitter Cards
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: metaTitle },
                { name: 'twitter:description', content: metaDesc },
                { name: 'twitter:site', content: '@atharvwasthere' },
                { name: 'twitter:creator', content: '@atharvwasthere' },
                ...(post.cover_image ? [{ name: 'twitter:image', content: post.cover_image }] : []),
            ],
            links: [
                { rel: 'canonical', href: url },
            ],
            scripts: [
                {
                    type: 'application/ld+json',
                    children: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: post.title,
                        url,
                        datePublished: new Date(postDate(post)).toISOString().split('T')[0],
                        dateModified: new Date(post.updated_at).toISOString().split('T')[0],
                        description: metaDesc,
                        ...(post.cover_image ? { image: post.cover_image } : {}),
                        author: {
                            '@type': 'Person',
                            name: 'Atharv Singh',
                            url: SITE_URL,
                        },
                        publisher: {
                            '@type': 'Blog',
                            name: 'Not a Blogger',
                            url: SITE_URL,
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
    const post = usePost(slug)
    const articleRef = useRef<HTMLDivElement>(null)

    // Stable identity. A new object literal each render makes React reapply
    // dangerouslySetInnerHTML, which reparses the body and destroys the embed
    // frames along with their src, measured height and internal state.
    const content = post.content ?? ''
    const contentHtml = useMemo(() => ({ __html: content }), [content])

    useCodeHighlighting(articleRef, content)
    useEmbedFrames(articleRef, content)
    useReferences(articleRef, content)

    return (
        <MainLayout variant="read">
            <div className="mx-auto w-full max-w-[680px] px-5 pb-[60px] pt-[30px] animate-in fade-in duration-500 md:px-0 md:pb-20 md:pt-12">
                <ArticleHeader post={post} />

                <article
                    ref={articleRef}
                    className="prose max-w-none font-serif prose-headings:font-serif prose-headings:font-normal prose-p:leading-loose
                               prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-3
                               prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-2
                               prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-1
                               prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                               break-words overflow-x-hidden"
                >
                    <div dangerouslySetInnerHTML={contentHtml} />
                </article>

                <div className="mt-14">
                    <SubscribeForm variant="article" />
                </div>
            </div>
        </MainLayout>
    )
}
