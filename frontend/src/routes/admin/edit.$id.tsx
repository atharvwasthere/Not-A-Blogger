import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, lazy, Suspense } from 'react'
import { api, stripHtml } from '@/lib/api'
import toast from 'react-hot-toast'
import { EditorSkeleton } from '@/features/admin/components/EditorSkeleton'

// Lazy load — keeps Tiptap editor out of the main bundle
const PostEditor = lazy(() =>
  import('@/features/admin/components/PostEditor').then(m => ({ default: m.PostEditor }))
)

export const Route = createFileRoute('/admin/edit/$id')({
  loader: async ({ params }) => api.getPostById(params.id),
  pendingComponent: EditorSkeleton,
  component: EditPost
})

function EditPost() {
  const post = Route.useLoaderData()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(new Date(post.updated_at))

  const handleSave = async ({
    title, content, coverImage, iconUrl, excerpt, seoTitle, seoDescription, isPublished,
    tags, series, seriesOrder
  }: {
    title: string; content: string; coverImage: string; iconUrl: string
    excerpt: string; seoTitle: string; seoDescription: string; isPublished: boolean
    tags: string; series: string; seriesOrder: number | null
  }) => {
    if (!title) {
      toast.error('Title is required')
      return
    }
    setIsSaving(true)
    try {
      await api.updatePost(post.id, {
        title,
        content,
        cover_image: coverImage || undefined,
        icon_url: iconUrl || undefined,
        is_published: isPublished,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
        excerpt: excerpt || stripHtml(content).slice(0, 150),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        series: series.trim() || null,
        series_order: seriesOrder,
      })
      setLastSaved(new Date())
      toast.success('Post updated successfully!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update post')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    try {
      await api.deletePost(post.id)
      toast.success('Post deleted')
      router.navigate({ to: '/admin/dashboard' })
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete post')
    }
  }

  return (
    <Suspense fallback={<EditorSkeleton />}>
      <PostEditor
        mode="edit"
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={handleSave}
        onDelete={handleDelete}
        initialValues={{
          title: post.title,
          content: post.content,
          coverImage: post.cover_image || '',
          iconUrl: post.icon_url || '',
          excerpt: post.excerpt || '',
          seoTitle: post.seo_title || '',
          seoDescription: post.seo_description || '',
          isPublished: post.is_published,
          tags: (post.tags || []).join(', '),
          series: post.series || '',
          seriesOrder: post.series_order ?? null,
          slug: post.slug,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
        }}
      />
    </Suspense>
  )
}
