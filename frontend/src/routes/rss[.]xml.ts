import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { buildRss } from '@/lib/rss'

export const Route = createFileRoute('/rss.xml')({
    server: {
        handlers: {
            GET: async () =>
                new Response(buildRss(await api.getPosts()), {
                    headers: {
                        'Content-Type': 'application/rss+xml; charset=utf-8',
                        // Feed readers poll often; the CDN answers for 10 minutes.
                        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
                    },
                }),
        },
    },
})
