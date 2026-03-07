import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, lazy, Suspense } from 'react'
import { api, stripHtml } from '@/lib/api'
import toast from 'react-hot-toast'

// Lazy load — keeps Tiptap editor out of the main bundle
const PostEditor = lazy(() =>
  import('@/features/admin/components/PostEditor').then(m => ({ default: m.PostEditor }))
)

export const Route = createFileRoute('/admin/new')({
  component: NewPost
})

function NewPost() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async ({
    title, content, coverImage, iconUrl, excerpt, seoTitle, seoDescription, isPublished
  }: {
    title: string; content: string; coverImage: string; iconUrl: string
    excerpt: string; seoTitle: string; seoDescription: string; isPublished: boolean
  }) => {
    if (!title) {
      toast.error('Title is required')
      return
    }
    setIsSaving(true)
    try {
      await api.createPost({
        title,
        content,
        cover_image: coverImage || undefined,
        icon_url: iconUrl || undefined,
        is_published: isPublished,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
        excerpt: excerpt || stripHtml(content).slice(0, 150),
      })
      toast.success('Post saved successfully!')
      router.navigate({ to: '/admin/dashboard' })
    } catch (error) {
      console.error(error)
      toast.error('Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-zinc-400 font-mono text-sm">Loading editor...</div>}>
      <PostEditor mode="new" isSaving={isSaving} onSave={handleSave} />
    </Suspense>
  )
}
