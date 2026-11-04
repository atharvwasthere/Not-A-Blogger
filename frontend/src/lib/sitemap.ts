import type { Post } from './types'
import { SITE_URL, postUrl } from './site'
import { groupByTopic, topicSlug } from '@/theme/topics'

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const url = (loc: string, lastmod?: string) =>
    `  <url><loc>${escape(loc)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`

/** Every public page: the browse pages, each published post and each topic. */
export function buildSitemap(posts: Pick<Post, 'slug' | 'tags' | 'updated_at'>[]): string {
    const pages = ['/', '/notes', '/topics', '/about'].map((path) => url(`${SITE_URL}${path === '/' ? '' : path}`))
    const notes = posts.map((post) => url(postUrl(post.slug), post.updated_at))
    const topics = [...groupByTopic(posts).keys()].map((tag) => url(`${SITE_URL}/topics/${topicSlug(tag)}`))

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages, ...notes, ...topics].join('\n')}
</urlset>
`
}
