export const SITE_URL = 'https://blogs.atharvsingh.me'

/** Each page names its own canonical; the root sets none, or pages would carry two. */
export const canonical = (path = '') => ({ rel: 'canonical', href: `${SITE_URL}${path}` })

/** The canonical address of a post, the one readers share. */
export const postUrl = (slug: string) => `${SITE_URL}/blog/${slug}`
