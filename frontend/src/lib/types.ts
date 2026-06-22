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
}

export interface Post extends PostInput {
    id: string
    slug: string
    created_at: string
    updated_at: string
    reading_time: number
    tags: string[]
}

/** Lightweight post shape for the ⌘K command palette (GET /posts/index). */
export interface PostIndexItem {
    slug: string
    title: string
    tags: string[]
}

export interface User {
    username: string
    id: string
}

// The JWT is delivered via httpOnly cookie; access_token is not used client-side
export interface AuthResponse {
    token_type: string
}
