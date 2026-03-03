import { useState } from 'react'
import { Editor } from '@/components/editor/Editor'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export interface PostEditorInitialValues {
    title?: string
    content?: string
    coverImage?: string
    iconUrl?: string
    excerpt?: string
    seoTitle?: string
    seoDescription?: string
    isPublished?: boolean
    // Edit-only meta
    slug?: string
    createdAt?: string
    updatedAt?: string
}

interface PostEditorProps {
    initialValues?: PostEditorInitialValues
    onSave: (data: {
        title: string
        content: string
        coverImage: string
        iconUrl: string
        excerpt: string
        seoTitle: string
        seoDescription: string
        isPublished: boolean
    }) => Promise<void>
    onDelete?: () => Promise<void>
    isSaving: boolean
    lastSaved?: Date
    mode: 'new' | 'edit'
}

export function PostEditor({
    initialValues = {},
    onSave,
    onDelete,
    isSaving,
    lastSaved,
    mode,
}: PostEditorProps) {
    const [title, setTitle] = useState(initialValues.title || '')
    const [content, setContent] = useState(
        initialValues.content || '<p>Start writing your story...</p>'
    )
    const [coverImage, setCoverImage] = useState(initialValues.coverImage || '')
    const [iconUrl, setIconUrl] = useState(initialValues.iconUrl || '')
    const [excerpt, setExcerpt] = useState(initialValues.excerpt || '')
    const [seoTitle, setSeoTitle] = useState(initialValues.seoTitle || '')
    const [seoDescription, setSeoDescription] = useState(initialValues.seoDescription || '')
    const [postStatus, setPostStatus] = useState<'Draft' | 'Published'>(
        initialValues.isPublished ? 'Published' : 'Draft'
    )

    const handleSave = () =>
        onSave({
            title,
            content,
            coverImage,
            iconUrl,
            excerpt,
            seoTitle,
            seoDescription,
            isPublished: postStatus === 'Published',
        })

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

                <Editor content={content} onChange={setContent} />

                {lastSaved && (
                    <div className="fixed bottom-6 left-6 text-xs text-zinc-300 bg-black font-mono transition-opacity duration-500">
                        saved {format(lastSaved, 'HH:mm:ss')}
                    </div>
                )}
            </section>

            {/* Right: Sidebar */}
            <aside className="border-l border-zinc-100 bg-zinc-50/30 p-8 flex flex-col gap-10 lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] overflow-y-auto">
                {/* Assets */}
                <div className="space-y-4">
                    <h3 className="font-serif text-lg text-zinc-900 border-b border-zinc-100 pb-2">Post Assets</h3>
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-[0.1em] font-bold">Banner Image</label>
                        <ImageUpload value={coverImage} onChange={setCoverImage} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-[0.1em] font-bold">Page Icon (SVG)</label>
                        <ImageUpload value={iconUrl} onChange={setIconUrl} className="aspect-square w-32 mx-auto" />
                    </div>
                </div>

                {/* Publish */}
                <div className="space-y-4">
                    <h3 className="font-serif text-xl text-zinc-900">{mode === 'new' ? 'Publish' : 'Post'}</h3>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Status</label>
                        <div className="bg-zinc-100 p-1 flex gap-1 rounded-lg">
                            <button
                                onClick={() => setPostStatus('Draft')}
                                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${postStatus === 'Draft' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                Draft
                            </button>
                            <button
                                onClick={() => setPostStatus('Published')}
                                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${postStatus === 'Published' ? 'bg-white text-green-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                Published
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800 h-10 shadow-none disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : mode === 'new' ? 'Save Post' : 'Update Post'}
                    </Button>
                </div>

                <div className="h-px bg-zinc-100 w-full" />

                {/* Summary / Excerpt */}
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

                {/* SEO */}
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

                {/* Post Info */}
                <div className="space-y-4">
                    <h3 className="font-serif text-lg text-zinc-900">Post Info</h3>
                    <div className="space-y-3 text-sm font-mono text-zinc-500">
                        <div className="flex gap-4">
                            <span className="w-12 text-zinc-400 shrink-0">Slug:</span>
                            <span className="text-zinc-700 truncate">
                                {initialValues.slug || '...'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <span className="w-16 text-zinc-400 shrink-0">Status:</span>
                            <span className="text-zinc-300 italic">
                                {initialValues.slug ? format(new Date(initialValues.createdAt || Date.now()), 'MMM d, yyyy') : 'Unsaved'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Delete — Edit mode only */}
                {onDelete && (
                    <div className="mt-auto pt-8">
                        <Button
                            variant="outline"
                            onClick={onDelete}
                            className="w-full rounded-none border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                        >
                            Delete Post
                        </Button>
                    </div>
                )}
            </aside>
        </div>
    )
}
