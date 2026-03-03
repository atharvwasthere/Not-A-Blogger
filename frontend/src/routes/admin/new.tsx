import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { PostEditor } from '@/components/admin/PostEditor'
import { api, stripHtml } from '@/lib/api'
import toast from 'react-hot-toast'

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

  return <PostEditor mode="new" isSaving={isSaving} onSave={handleSave} />
}
