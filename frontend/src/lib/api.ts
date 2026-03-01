import { Post, PostInput, AuthResponse } from "./types"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = {
        "Content-Type": "application/json",
        ...options?.headers,
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Ensure cookies are sent with requests
    })

    // Handle 204 No Content
    if (res.status === 204) {
        return {} as T
    }

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`)
    }

    return res.json()
}

export const api = {
    // Posts
    getPosts: (includeDrafts = false) => fetcher<Post[]>(`/posts/?include_drafts=${includeDrafts}`),
    getPostBySlug: (slug: string) => fetcher<Post>(`/posts/${slug}`), // GET /posts/{slug} usually doesn't need trailing slash if slug is the end, but check backend. Backend: @posts_router.get("/{slug}") -> /posts/{slug}. No trailing slash needed here assuming standard path param behavior.
    createPost: (data: PostInput) =>
        fetcher<Post>("/posts/", { method: "POST", body: JSON.stringify(data) }),
    getPostById: (id: string) => fetcher<Post>(`/posts/id/${id}`),
    updatePost: (id: string, data: PostInput) =>
        fetcher<Post>(`/posts/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
    deletePost: (id: string) =>
        fetcher<void>(`/posts/${id}/`, { method: "DELETE" }),

    // Auth
    login: (credentials: { username: string; password: string }) =>
        fetcher<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }), // Auth router usually simpler, check auth.py. @auth_router.post("/login") -> /auth/login.
    logout: () => fetcher<void>("/auth/logout", { method: "POST" }),
    getMe: () => fetcher<{ username: string }>("/auth/me"),

    // Media
    uploadImage: async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${API_BASE}/upload/`, { // Check backend path. @upload_router.post("/") -> /upload/ (with prefix /api -> /api/upload/)
            method: 'POST',
            body: formData,
            headers: {
                // Content-Type is set automatically by browser for FormData
                // But we need to handle auth. fetcher helper handles simple JSON.
                // We should probably reuse logic or manual fetch.
                // Let's implement manual fetch here to handle FormData correctly.
            },
            credentials: "include"
        })

        if (!res.ok) throw new Error("Upload failed")
        const data = await res.json()
        return data.url as string
    },

    // Subscribers
    subscribe: (data: { email: string, name?: string }) =>
        fetcher<{ id: string, email: string }>("/subscribers/", { method: "POST", body: JSON.stringify(data) }),

    unsubscribeById: (id: string) =>
        fetcher<{ message: string }>(`/subscribers/unsubscribe/${id}`),

    unsubscribeByEmail: (email: string) =>
        fetcher<{ message: string }>("/subscribers/unsubscribe", { method: "POST", body: JSON.stringify({ email }) })
}
