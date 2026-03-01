export interface PostInput {
    title: string
    content: string
    excerpt?: string | null
    cover_image?: string | null
    is_published: boolean
    seo_title?: string | null
    seo_description?: string | null
}

export interface Post extends PostInput {
    id: string
    slug: string
    created_at: string
    updated_at: string
    reading_time: number
}

export interface User {
    username: string
    id: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
}
