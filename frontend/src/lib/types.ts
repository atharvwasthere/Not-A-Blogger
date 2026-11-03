/** The source a post is built around ("Based on"). */
export interface BasedOn {
    title: string
    by?: string | null
    url: string
}

export interface PostInput {
    title: string
    content: string
    excerpt?: string | null
    cover_image?: string | null
    icon_url?: string | null
    is_published: boolean
    seo_title?: string | null
    seo_description?: string | null
    tags?: string[]
    series?: string | null
    series_order?: number | null
    based_on?: BasedOn | null
    /** Whether this post shows its newspaper cover (when one exists and covers are on site-wide). */
    show_print?: boolean
}

export interface Post extends PostInput {
    id: string
    slug: string
    created_at: string
    updated_at: string
    /** Set on first publish; null for a draft that was never published. */
    published_at?: string | null
    reading_time: number
    tags: string[]
    /** The halftone cover, written only by the generate endpoint. */
    print_url?: string | null
}

/** Site-wide switches (GET/PUT /settings). */
export interface SiteSettings {
    covers_enabled: boolean
}

export type PrintInvert = 'auto' | 'always' | 'never'

export interface User {
    username: string
    id: string
}

// The JWT is delivered via httpOnly cookie; access_token is not used client-side
/** Metadata for an uploaded visualiser. The html body is never sent here — it is served as a document. */
export interface EmbedSummary {
    id: string
    post_id: string
    title: string
    byte_size: number
    created_at: string
    updated_at: string
}
