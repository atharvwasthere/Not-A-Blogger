import { describe, expect, it } from 'vitest'
import { buildRss } from './rss'

const post = {
    title: 'Caching & <you>',
    slug: 'the-other-half-of-caching',
    excerpt: 'Why "consistency" is hard',
    published_at: '2026-06-29T18:31:15.059875',
    created_at: '2026-06-01T00:00:00',
}

describe('buildRss', () => {
    it('lists each post with its canonical link and escaped text', () => {
        const xml = buildRss([post])
        expect(xml).toContain('<title>Caching &amp; &lt;you&gt;</title>')
        expect(xml).toContain('<link>https://blogs.atharvsingh.me/blog/the-other-half-of-caching</link>')
        expect(xml).toContain('<guid isPermaLink="true">https://blogs.atharvsingh.me/blog/the-other-half-of-caching</guid>')
        expect(xml).toContain('<description>Why &quot;consistency&quot; is hard</description>')
    })

    it('dates items by publish date, read as UTC', () => {
        expect(buildRss([post])).toContain('<pubDate>Mon, 29 Jun 2026 18:31:15 GMT</pubDate>')
    })

    it('falls back to the creation date and omits an empty excerpt', () => {
        const xml = buildRss([{ ...post, published_at: null, excerpt: null }])
        expect(xml).toContain('<pubDate>Mon, 01 Jun 2026 00:00:00 GMT</pubDate>')
        expect(xml).not.toContain('<description>Why')
    })
})
