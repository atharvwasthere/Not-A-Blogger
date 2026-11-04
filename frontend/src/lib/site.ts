export const SITE_URL = 'https://blogs.atharvsingh.me'

/** Each page names its own canonical; the root sets none, or pages would carry two. */
export const canonical = (path = '') => ({ rel: 'canonical', href: `${SITE_URL}${path}` })
