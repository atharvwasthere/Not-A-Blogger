import { describe, expect, it } from 'vitest'
import { findTopic, groupByTopic, topicLabel, topicSlug, topicTint } from './topics'

describe('topicLabel', () => {
    it('capitalises the first letter only', () => {
        expect(topicLabel('distributed systems')).toBe('Distributed systems')
        expect(topicLabel('debugging')).toBe('Debugging')
        expect(topicLabel('')).toBe('')
    })
})

describe('topicSlug', () => {
    it('turns spaces into hyphens', () => {
        expect(topicSlug('under the hood')).toBe('under-the-hood')
    })
    it('collapses punctuation and trims stray hyphens', () => {
        expect(topicSlug('  C++ / Rust!  ')).toBe('c-rust')
        expect(topicSlug('node.js')).toBe('node-js')
    })
    it('lowercases', () => {
        expect(topicSlug('Distributed Systems')).toBe('distributed-systems')
    })
})

describe('topicTint', () => {
    it('references the topic token with the default as fallback', () => {
        expect(topicTint('distributed systems')).toBe('var(--tint-distributed-systems, var(--tint-default))')
    })
    it('falls back to the default tint without a topic', () => {
        expect(topicTint(undefined)).toBe('var(--tint-default)')
    })
    it('never contains a colour value', () => {
        expect(topicTint('anything at all')).not.toMatch(/#|rgb|hsl|oklch/)
    })
})

describe('groupByTopic', () => {
    const posts = [
        { slug: 'a', tags: ['performance'] },
        { slug: 'b', tags: ['debugging', 'performance'] },
        { slug: 'c', tags: ['debugging'] },
        { slug: 'd', tags: ['tooling'] },
        { slug: 'e', tags: ['alpha'] },
        { slug: 'f', tags: [] },
    ]

    it('orders by post count, then by name', () => {
        expect([...groupByTopic(posts).keys()]).toEqual(['debugging', 'performance', 'alpha', 'tooling'])
    })
    it('keeps post order inside a topic and lists a post under each of its topics', () => {
        const groups = groupByTopic(posts)
        expect(groups.get('performance')!.map(p => p.slug)).toEqual(['a', 'b'])
        expect(groups.get('debugging')!.map(p => p.slug)).toEqual(['b', 'c'])
    })
    it('finds a topic by slug', () => {
        expect(findTopic([{ tags: ['under the hood'] }], 'under-the-hood')?.tag).toBe('under the hood')
        expect(findTopic(posts, 'nope')).toBeUndefined()
    })
})
