import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Editor } from '@/components/editor/Editor'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/admin/new')({
  component: NewPost
})

function NewPost() {
  const router = useRouter()

  // State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('<p>Start writing your story...</p>')
  const [coverImage, setCoverImage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [postStatus, setPostStatus] = useState<'Draft' | 'Published'>('Draft')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (publishedOverride?: boolean) => {
    if (!title) {
      toast.error('Title is required')
      return
    }

    setIsSaving(true)

    // Determine published state: if override provided use it, otherwise use select box
    const isPublished = publishedOverride !== undefined ? publishedOverride : (postStatus === 'Published')

    try {
      await api.createPost({
        title,
        content,
        cover_image: coverImage || undefined,
        is_published: isPublished,
        seo_title: seoTitle || undefined,
        seo_description: seoDescription || undefined,
        excerpt: excerpt || content.replace(/<[^>]*>?/gm, '').slice(0, 150)
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] min-h-[calc(100vh-56px)]">
      {/* Left: Editor */}
      <section className="relative w-full min-w-0 border-r border-zinc-50 p-8 md:p-12 lg:p-16">
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-5xl md:text-6xl font-serif text-zinc-900 placeholder:text-zinc-200 outline-none bg-transparent mb-12"
          autoFocus
        />

        <Editor
          content={content}
          onChange={setContent}
        />
      </section>

      {/* Right: Sidebar */}
      <aside className="border-l border-zinc-100 bg-zinc-50/30 p-8 flex flex-col gap-10 lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] overflow-y-auto">
        <div className="space-y-4">
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-xl text-zinc-900">Publish</h3>

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Status</label>
            <div className="bg-zinc-100 p-1 flex gap-1 rounded-lg">
              <button
                onClick={() => setPostStatus('Draft')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${postStatus === 'Draft'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
                  }`}
              >
                Draft
              </button>
              <button
                onClick={() => setPostStatus('Published')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${postStatus === 'Published'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
                  }`}
              >
                Published
              </button>
            </div>
          </div>

          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800 h-10 shadow-none disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>

        <div className="h-px bg-zinc-100 w-full" />

        <div className="space-y-4">
          <h3 className="font-serif text-lg text-zinc-900">Summary</h3>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium">Excerpt (Optional)</label>
            <textarea
              placeholder="Short description..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 h-24 resize-none outline-none focus:border-zinc-300"
            />
          </div>
        </div>

        <div className="h-px bg-zinc-100 w-full" />

        <div className="space-y-4">
          <h3 className="font-serif text-lg text-zinc-900">SEO Meta</h3>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium">Meta Title</label>
            <input
              type="text"
              placeholder={title || 'SEO Title...'}
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium">Meta Description</label>
            <textarea
              placeholder={excerpt || 'Will use excerpt if empty...'}
              value={seoDescription}
              onChange={e => setSeoDescription(e.target.value)}
              className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 h-20 resize-none outline-none focus:border-zinc-300"
            />
          </div>
        </div>

        <div className="h-px bg-zinc-100 w-full" />

        <div className="space-y-4">
          <h3 className="font-serif text-lg text-zinc-900">Post Info</h3>
          <div className="space-y-3 text-sm font-mono text-zinc-500">
            <div className="flex gap-4">
              <span className="w-12 text-zinc-400 shrink-0">Slug:</span>
              <span className="text-zinc-700 truncate">...</span>
            </div>
            <div className="flex gap-4">
              <span className="w-12 text-zinc-400 shrink-0">Status:</span>
              <span className="text-zinc-300 italic">Unsaved</span>
            </div>
          </div>
        </div>

      </aside>
    </div>
  )
}
