import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { buildSitemap } from '@/lib/sitemap'

export const Route = createFileRoute('/sitemap.xml')({
    server: {
        handlers: {
            GET: async () =>
                new Response(buildSitemap(await api.getPosts()), {
                    headers: {
                        'Content-Type': 'application/xml; charset=utf-8',
                        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
                    },
                }),
        },
    },
})
