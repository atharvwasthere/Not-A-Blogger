import { createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
// highlight.js loaded dynamically in useEffect — core + individual languages (~50KB vs ~200KB common)
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { MainLayout } from '@/shared/layout/MainLayout'
import { NotFound } from '@/shared/components/NotFound'
import { postQueryOptions, usePost } from '@/features/blog/hooks/usePosts'
import { useTheme } from '@/theme/useTheme'
import type { EmbedMode } from '@/theme/themeStore'

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

const EMBED_FRAMES = 'figure[data-embed-id] iframe'
const MAX_EMBED_HEIGHT = 2000

function postTheme(frame: HTMLIFrameElement, mode: EmbedMode) {
    // targetOrigin '*' is required — a sandboxed frame has an opaque origin and cannot be
    // addressed any other way. The payload is a theme name and carries nothing sensitive.
    frame.contentWindow?.postMessage({ v: 1, type: 'embed:theme', mode }, '*')
}

function BlogPost() {
    const { slug } = Route.useParams()
    const post = usePost(slug)

    const articleRef = useRef<HTMLDivElement>(null)

    // Stable identity. A new object literal each render makes React reapply
    // dangerouslySetInnerHTML, which reparses the body and destroys the embed
    // frames along with their src, measured height and internal state.
    const contentHtml = useMemo(() => ({ __html: post.content ?? '' }), [post.content])

    // Dynamically load highlight.js core + only needed languages
    useEffect(() => {
        if (!articleRef.current) return
        let isActive = true
        import('highlight.js/lib/core').then(async ({ default: hljs }) => {
            if (!isActive) return
            const [js, ts, bash, python, json, css, xml] = await Promise.all([
                import('highlight.js/lib/languages/javascript'),
                import('highlight.js/lib/languages/typescript'),
                import('highlight.js/lib/languages/bash'),
                import('highlight.js/lib/languages/python'),
                import('highlight.js/lib/languages/json'),
                import('highlight.js/lib/languages/css'),
                import('highlight.js/lib/languages/xml'),
            ])
            if (!isActive) return
            hljs.registerLanguage('javascript', js.default)
            hljs.registerLanguage('typescript', ts.default)
            hljs.registerLanguage('bash', bash.default)
            hljs.registerLanguage('python', python.default)
            hljs.registerLanguage('json', json.default)
            hljs.registerLanguage('css', css.default)
            hljs.registerLanguage('xml', xml.default)

            if (articleRef.current) {
                articleRef.current.querySelectorAll('pre code').forEach((block) => {
                    block.removeAttribute('data-highlighted')
                    hljs.highlightElement(block as HTMLElement)
                })
            }
        }).catch(err => console.error("Failed to load syntax highlighter:", err))

        return () => { isActive = false }
    }, [post.content])

    const { embedMode } = useTheme()

    // Read by the message handler below, which must not be torn down on every theme change.
    const embedModeRef = useRef(embedMode)
    useEffect(() => {
        embedModeRef.current = embedMode
    }, [embedMode])

    // Point each frame at its document, then run the size/theme protocol. The src is set
    // here rather than stored in post HTML so content carries no API domain.
    useEffect(() => {
        const article = articleRef.current
        if (!article) return

        const frames = Array.from(article.querySelectorAll<HTMLIFrameElement>(EMBED_FRAMES))
        if (frames.length === 0) return

        for (const frame of frames) {
            const embedId = frame.closest('figure')?.getAttribute('data-embed-id')
            if (embedId && !frame.src) frame.src = api.embedSrc(embedId)
        }

        const onMessage = (event: MessageEvent) => {
            // Opaque origin means event.origin is always "null", so identify by source instead.
            const frame = frames.find(f => f.contentWindow === event.source)
            if (!frame || event.data?.v !== 1) return

            if (event.data.type === 'embed:ready') {
                postTheme(frame, embedModeRef.current)
            } else if (event.data.type === 'embed:size' && typeof event.data.height === 'number') {
                const height = Math.min(Math.max(event.data.height, 1), MAX_EMBED_HEIGHT)
                frame.style.height = `${height}px`
            }
        }

        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage)
    }, [post.content])

    // Push the new mode down instead of reloading the frame, which would reset its state.
    useEffect(() => {
        articleRef.current
            ?.querySelectorAll<HTMLIFrameElement>(EMBED_FRAMES)
            .forEach(frame => postTheme(frame, embedMode))
    }, [embedMode])

    return (
        <MainLayout variant="read">
            <div className="max-w-3xl mx-auto px-5 py-12 md:px-6 md:py-24 animate-in fade-in duration-500">
                <div className="mb-12">
                    <div className="font-mono text-xs text-soft uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span>{format(new Date(post.created_at), "MMMM d, yyyy")}</span>
                        <span className="w-1 h-1 rounded-full bg-faint" />
                        <span>{post.reading_time || 1} min read</span>
                        {post.updated_at !== post.created_at && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-faint hidden md:block" />
                                <span className="text-soft italic hidden md:block">
                                    Updated {format(new Date(post.updated_at), "MMM d")}
                                </span>
                            </>
                        )}
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.1] mb-8">
                        {post.title}
                    </h1>
                </div>

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
            </div>
        </MainLayout>
    )
}
