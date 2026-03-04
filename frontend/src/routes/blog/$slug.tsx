import { createFileRoute, notFound } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BookOpen, Glasses, Eye } from 'lucide-react'
// highlight.js loaded dynamically in useEffect — core + individual languages (~50KB vs ~200KB common)
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { MainLayout } from '@/shared/layout/MainLayout'
import { NotFound } from '@/shared/components/NotFound'

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

type ViewMode = 'default' | 'reader-light' | 'reader-dark'

const MODE_CONFIG: Record<ViewMode, {
    className: string | undefined
    label: string
    icon: typeof Glasses
    btnClass: string
    overlayColor: string
    next: ViewMode
}> = {
    'default': {
        className: undefined,
        label: 'reader mode',
        icon: Glasses,
        btnClass: 'bg-white/90 border-zinc-200 text-zinc-700 hover:bg-zinc-50',
        overlayColor: '#f8fbe2',
        next: 'reader-light',
    },
    'reader-light': {
        className: 'reader-light',
        label: 'dark reader',
        icon: Eye,
        btnClass: 'bg-[#eef1cc]/90 border-[#c8cc9a] text-[#2c2c2b] hover:bg-[#e5e8b8]',
        overlayColor: '#0D1117',
        next: 'reader-dark',
    },
    'reader-dark': {
        className: 'reader-dark',
        label: 'exit reader',
        icon: BookOpen,
        btnClass: 'bg-[#161B22]/90 border-[#30363D] text-[#E5E7EB] hover:bg-[#1C2128]',
        overlayColor: '#ffffff',
        next: 'default',
    },
}

function ReaderModeToggle({
    mode,
    onToggle,
    disabled,
}: {
    mode: ViewMode
    onToggle: () => void
    disabled: boolean
}) {
    const config = MODE_CONFIG[mode]
    const Icon = config.icon

    return (
        <motion.button
            onClick={onToggle}
            disabled={disabled}
            className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5",
                "font-mono text-xs tracking-wide cursor-pointer",
                "shadow-lg border backdrop-blur-sm",
                "print:hidden disabled:opacity-50",
                config.btnClass,
            )}
            aria-label={`Switch to ${config.label}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    className="flex items-center gap-2"
                    initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    <Icon size={14} />
                    <span>{config.label}</span>
                </motion.div>
            </AnimatePresence>
        </motion.button>
    )
}

function BlogPost() {
    const { slug } = Route.useParams()
    const { data: post } = useSuspenseQuery(
        queryOptions({
            queryKey: ['posts', slug],
            queryFn: () => api.getPostBySlug(slug),
        })
    )

    const articleRef = useRef<HTMLDivElement>(null)

    // Dynamically load highlight.js core + only needed languages
    useEffect(() => {
        if (!articleRef.current) return
        import('highlight.js/lib/core').then(async ({ default: hljs }) => {
            const [js, ts, bash, python, json, css, xml] = await Promise.all([
                import('highlight.js/lib/languages/javascript'),
                import('highlight.js/lib/languages/typescript'),
                import('highlight.js/lib/languages/bash'),
                import('highlight.js/lib/languages/python'),
                import('highlight.js/lib/languages/json'),
                import('highlight.js/lib/languages/css'),
                import('highlight.js/lib/languages/xml'),
            ])
            hljs.registerLanguage('javascript', js.default)
            hljs.registerLanguage('typescript', ts.default)
            hljs.registerLanguage('bash', bash.default)
            hljs.registerLanguage('python', python.default)
            hljs.registerLanguage('json', json.default)
            hljs.registerLanguage('css', css.default)
            hljs.registerLanguage('xml', xml.default)

            articleRef.current!.querySelectorAll('pre code').forEach((block) => {
                block.removeAttribute('data-highlighted')
                hljs.highlightElement(block as HTMLElement)
            })
        })
    }, [post.content])

    const [viewMode, setViewMode] = useState<ViewMode>('default')
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [wipePhase, setWipePhase] = useState<'idle' | 'cover' | 'reveal'>('idle')
    const [wipeDirection, setWipeDirection] = useState<'down' | 'up'>('down')
    const [overlayColor, setOverlayColor] = useState('#f8fbe2')
    const [nextMode, setNextMode] = useState<ViewMode>('reader-light')

    const handleToggle = useCallback(() => {
        if (isTransitioning) return
        const config = MODE_CONFIG[viewMode]
        setIsTransitioning(true)
        setNextMode(config.next)
        setOverlayColor(config.overlayColor)
        // default->light: top-down, light->dark: top-down, dark->default: bottom-up
        setWipeDirection(viewMode === 'reader-dark' ? 'up' : 'down')
        setWipePhase('cover')
    }, [viewMode, isTransitioning])

    const handleWipeComplete = useCallback(() => {
        if (wipePhase === 'cover') {
            setViewMode(nextMode)
            setWipePhase('reveal')
        } else if (wipePhase === 'reveal') {
            setWipePhase('idle')
            setIsTransitioning(false)
        }
    }, [wipePhase, nextMode])

    const getClipPath = () => {
        if (wipePhase === 'idle') return undefined
        if (wipeDirection === 'down') {
            if (wipePhase === 'cover') return 'inset(0 0 0 0)'
            if (wipePhase === 'reveal') return 'inset(100% 0 0 0)'
        } else {
            if (wipePhase === 'cover') return 'inset(0 0 0 0)'
            if (wipePhase === 'reveal') return 'inset(0 0 100% 0)'
        }
    }

    const getInitialClipPath = () => {
        if (wipeDirection === 'down') {
            if (wipePhase === 'cover') return 'inset(0 0 100% 0)'
            if (wipePhase === 'reveal') return 'inset(0 0 0 0)'
        } else {
            if (wipePhase === 'cover') return 'inset(100% 0 0 0)'
            if (wipePhase === 'reveal') return 'inset(0 0 0 0)'
        }
        return 'inset(0 0 100% 0)'
    }

    return (
        <MainLayout className={MODE_CONFIG[viewMode].className}>
            {/* Wipe transition overlay */}
            <AnimatePresence>
                {wipePhase !== 'idle' && (
                    <motion.div
                        key={`wipe-${wipeDirection}-${wipePhase}`}
                        className="fixed inset-0 z-[100] pointer-events-none"
                        style={{ backgroundColor: overlayColor }}
                        initial={{ clipPath: getInitialClipPath() }}
                        animate={{ clipPath: getClipPath() }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        onAnimationComplete={handleWipeComplete}
                    />
                )}
            </AnimatePresence>

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
                </div>

                <article ref={articleRef} className="prose prose-zinc max-w-none font-serif prose-headings:font-serif prose-headings:font-normal prose-p:text-zinc-600 prose-p:leading-loose
                                   prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-3
                                   prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-2
                                   prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-1
                                   prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                    <div dangerouslySetInnerHTML={{ __html: post.content ?? '' }} />
                </article>
            </div>

            <ReaderModeToggle
                mode={viewMode}
                onToggle={handleToggle}
                disabled={isTransitioning}
            />
        </MainLayout>
    )
}
