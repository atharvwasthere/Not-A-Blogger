import { describe, expect, it } from 'vitest'
import { buildSitemap } from './sitemap'

const post = { slug: 'the-other-half-of-caching', tags: ['distributed systems'], updated_at: '2026-06-29T18:31:15.059875' }

describe('buildSitemap', () => {
    it('lists the browse pages, each post with its last change, and each topic', () => {
        const xml = buildSitemap([post])
        expect(xml).toContain('<loc>https://blogs.atharvsingh.me</loc>')
        expect(xml).toContain('<loc>https://blogs.atharvsingh.me/notes</loc>')
        expect(xml).toContain(
            '<url><loc>https://blogs.atharvsingh.me/blog/the-other-half-of-caching</loc><lastmod>2026-06-29</lastmod></url>',
        )
        expect(xml).toContain('<loc>https://blogs.atharvsingh.me/topics/distributed-systems</loc>')
    })

    it('lists a topic once however many posts carry it', () => {
        const xml = buildSitemap([post, { ...post, slug: 'another' }])
        expect(xml.match(/topics\/distributed-systems/g)).toHaveLength(1)
    })
})
