import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { PostEditor } from '@/components/admin/PostEditor'
import { api, stripHtml } from '@/lib/api'
import toast from 'react-hot-toast'
import { EditorSkeleton } from '@/components/admin/EditorSkeleton'

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
      await api.updatePost(post.id, {
        title,
        content,
        cover_image: coverImage || undefined,
        icon_url: iconUrl || undefined,
        is_published: isPublished,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
        excerpt: excerpt || stripHtml(content).slice(0, 150),
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
        slug: post.slug,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
      }}
    />
  )
}
