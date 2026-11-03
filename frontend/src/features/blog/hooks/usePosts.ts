import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

/** Every published post, newest first. Shared by the home page, notes, topics and search. */
export const postsQueryOptions = queryOptions({
    queryKey: ['posts'],
    queryFn: () => api.getPosts(),
})

export const postQueryOptions = (slug: string) =>
    queryOptions({
        queryKey: ['posts', slug],
        queryFn: () => api.getPostBySlug(slug),
    })

export function usePosts() {
    return useSuspenseQuery(postsQueryOptions).data
}

export function usePost(slug: string) {
    return useSuspenseQuery(postQueryOptions(slug)).data
}
