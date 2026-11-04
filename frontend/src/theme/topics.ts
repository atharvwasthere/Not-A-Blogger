import type { Post } from '@/lib/types'

/**
 * Topics are the posts' `tags`, which the API stores lowercased.
 * These helpers derive what the UI shows from them. Tints map to token names, never to colour values.
 */

/** "distributed systems" -> "Distributed systems" */
export const topicLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1)

/** "Distributed Systems!" -> "distributed-systems" */
export const topicSlug = (tag: string) =>
    tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** A CSS value: the topic's own tint token, or the default tint when it has none. */
export const topicTint = (tag: string | undefined) =>
    tag ? `var(--tint-${topicSlug(tag)}, var(--tint-default))` : 'var(--tint-default)'

/** Posts grouped by topic, the topic with the most posts first, ties by name. Post order is kept. */
export function groupByTopic<P extends Pick<Post, 'tags'>>(posts: P[]): Map<string, P[]> {
    const groups = new Map<string, P[]>()
    for (const post of posts) {
        for (const tag of post.tags ?? []) {
            const list = groups.get(tag)
            if (list) list.push(post)
            else groups.set(tag, [post])
        }
    }
    return new Map([...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])))
}

/** The topic whose slug matches, with its posts, or undefined. */
export function findTopic<P extends Pick<Post, 'tags'>>(posts: P[], slug: string): { tag: string; posts: P[] } | undefined {
    for (const [tag, list] of groupByTopic(posts)) {
        if (topicSlug(tag) === slug) return { tag, posts: list }
    }
    return undefined
}
