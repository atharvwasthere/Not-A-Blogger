import type { Post } from './types'
import { SITE_URL, postUrl } from './site'
import { postDate } from '@/features/blog/formatDate'

const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

// The API sends naive UTC timestamps; without the Z they would be read as local time.
const rfc822 = (iso: string) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`).toUTCString()

/** RSS 2.0 for the published posts, newest first as the API returns them. */
export function buildRss(posts: Pick<Post, 'title' | 'slug' | 'excerpt' | 'published_at' | 'created_at'>[]): string {
    const items = posts
        .map((post) => {
            const url = postUrl(post.slug)
            return [
                '    <item>',
                `      <title>${escape(post.title)}</title>`,
                `      <link>${url}</link>`,
                `      <guid isPermaLink="true">${url}</guid>`,
                `      <pubDate>${rfc822(postDate(post))}</pubDate>`,
                post.excerpt ? `      <description>${escape(post.excerpt)}</description>` : null,
                '    </item>',
            ]
                .filter(Boolean)
                .join('\n')
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Not a Blogger</title>
    <link>${SITE_URL}</link>
    <description>Notes on backend, systems, and things Atharv Singh builds.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
}
