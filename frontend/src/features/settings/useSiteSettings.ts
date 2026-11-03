import { queryOptions, useQuery } from '@tanstack/react-query'
import { useLoaderData } from '@tanstack/react-router'
import { api } from '@/lib/api'

export const siteSettingsQueryOptions = queryOptions({
    queryKey: ['settings'],
    queryFn: api.getSettings,
    staleTime: 5 * 60 * 1000,
})

/**
 * Site-wide settings. The root loader fetches them before the first render, so server-rendered
 * pages already know whether covers are on and nothing pops in. `data` is undefined only if the
 * API could not be reached; callers treat that as "covers off".
 */
export function useSiteSettings() {
    const fromLoader = useLoaderData({ from: '__root__' })
    return useQuery({ ...siteSettingsQueryOptions, initialData: fromLoader ?? undefined })
}
