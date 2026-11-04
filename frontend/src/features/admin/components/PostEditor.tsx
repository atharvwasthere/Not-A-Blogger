import { useState } from 'react'
import { Editor } from '@/features/editor/Editor'
import { ImageUpload } from '@/features/editor/ImageUpload'
import { Button } from '@/shared/ui/button'
import { format } from 'date-fns'
import type { BasedOn } from '@/lib/types'
import { NewspaperCover } from './NewspaperCover'

export interface PostEditorInitialValues {
    title?: string
    content?: string
    coverImage?: string
    iconUrl?: string
    excerpt?: string
    seoTitle?: string
    seoDescription?: string
    isPublished?: boolean
    tags?: string // comma-separated for the form input
    series?: string
    seriesOrder?: number | null
    basedOn?: BasedOn | null
    showPrint?: boolean
    printUrl?: string | null
    // Edit-only meta
    slug?: string
    createdAt?: string
    updatedAt?: string
}

export interface PostEditorValues {
    title: string
    content: string
    coverImage: string
    iconUrl: string
    excerpt: string
    seoTitle: string
    seoDescription: string
    isPublished: boolean
    tags: string // comma-separated; split by the route handler
    series: string
    seriesOrder: number | null
    /** null when the title is empty */
    basedOn: BasedOn | null
    printUrl: string | null
    showPrint: boolean
}

interface PostEditorProps {
    initialValues?: PostEditorInitialValues
    onSave: (data: PostEditorValues) => Promise<void>
    onDelete?: () => Promise<void>
    isSaving: boolean
    lastSaved?: Date
    mode: 'new' | 'edit'
    /** Owning post id. Absent while a draft is unsaved, which hides the /embed command. */
    postId?: string
}

export function PostEditor({
    initialValues = {},
    onSave,
    onDelete,
    isSaving,
    lastSaved,
    mode,
    postId,
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
    const [tags, setTags] = useState(initialValues.tags || '')
    const [series, setSeries] = useState(initialValues.series || '')
    const [seriesOrder, setSeriesOrder] = useState(
        initialValues.seriesOrder != null ? String(initialValues.seriesOrder) : ''
    )
    const [basedOnTitle, setBasedOnTitle] = useState(initialValues.basedOn?.title || '')
    const [basedOnBy, setBasedOnBy] = useState(initialValues.basedOn?.by || '')
    const [basedOnUrl, setBasedOnUrl] = useState(initialValues.basedOn?.url || '')
    const [printUrl, setPrintUrl] = useState(initialValues.printUrl ?? null)
    const [showPrint, setShowPrint] = useState(initialValues.showPrint ?? false)
    const [postStatus, setPostStatus] = useState<'Draft' | 'Published'>(
        initialValues.isPublished ? 'Published' : 'Draft'
    )
    const [confirmDelete, setConfirmDelete] = useState(false)

    // Mirrors the backend's BasedOn schema, so a bad entry blocks Save here instead of failing the whole save.
    const basedOnProblem = (() => {
        const title = basedOnTitle.trim()
        if (!title) return basedOnBy.trim() || basedOnUrl.trim() ? 'Add a title, or clear the other fields.' : null
        if (title.length < 2) return 'The title needs at least 2 characters.'
        try {
            if (!['http:', 'https:'].includes(new URL(basedOnUrl.trim()).protocol)) throw new Error()
        } catch {
            return "Add the paper's link (https://…)."
        }
        return null
    })()

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
            tags,
            series,
            seriesOrder: seriesOrder.trim() === '' ? null : Number(seriesOrder),
            basedOn: basedOnTitle.trim()
                ? { title: basedOnTitle.trim(), by: basedOnBy.trim() || null, url: basedOnUrl.trim() }
                : null,
            printUrl,
            showPrint,
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

                <Editor content={content} onChange={setContent} postId={postId} />

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

                <NewspaperCover
                    postId={postId}
                    content={content}
                    coverImage={coverImage}
                    printUrl={printUrl}
                    onPrintUrlChange={setPrintUrl}
                    showPrint={showPrint}
                    onShowPrintChange={setShowPrint}
                />

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
                        disabled={isSaving || basedOnProblem !== null}
                        className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800 h-10 shadow-none disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : mode === 'new' ? 'Save Post' : 'Update Post'}
                    </Button>
                    {basedOnProblem && <p className="text-xs text-danger">Based on: {basedOnProblem}</p>}
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

                {/* Topics & Series */}
                <div className="space-y-4">
                    <h3 className="font-serif text-lg text-zinc-900">Topics & Series</h3>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Tags (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="caching, debugging, go"
                            value={tags}
                            onChange={e => setTags(e.target.value)}
                            className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
                        />
                        <p className="text-[10px] text-zinc-400">Lowercased & de-duplicated on save.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs text-zinc-400 font-medium">Series slug</label>
                            <input
                                type="text"
                                placeholder="papers"
                                value={series}
                                onChange={e => setSeries(e.target.value)}
                                className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
                            />
                        </div>
                        <div className="w-24 space-y-1">
                            <label className="text-xs text-zinc-400 font-medium">Order</label>
                            <input
                                type="number"
                                min={0}
                                placeholder="1"
                                value={seriesOrder}
                                onChange={e => setSeriesOrder(e.target.value)}
                                className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-100 w-full" />

                {/* Based on: the paper series */}
                <div className="space-y-4">
                    <h3 className="font-serif text-lg text-zinc-900">Based on (research paper)</h3>
                    <p className="text-[10px] text-zinc-400">Optional. Shown above the article. Leave the title empty for none.</p>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Title</label>
                        <input
                            type="text"
                            placeholder="Scaling Memcache at Facebook"
                            value={basedOnTitle}
                            onChange={e => setBasedOnTitle(e.target.value)}
                            className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">By</label>
                        <input
                            type="text"
                            placeholder="Nishtala et al. · NSDI ’13"
                            value={basedOnBy}
                            onChange={e => setBasedOnBy(e.target.value)}
                            className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Link</label>
                        <input
                            type="url"
                            placeholder="https://…"
                            value={basedOnUrl}
                            onChange={e => setBasedOnUrl(e.target.value)}
                            className="w-full text-sm bg-white border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-300"
                        />
                    </div>
                    {basedOnProblem && <p className="text-xs text-danger">{basedOnProblem}</p>}
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
                        {confirmDelete ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onDelete}
                                    className="flex-1 rounded-none border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                                >
                                    Yes, delete
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 rounded-none border-zinc-200 text-zinc-500 hover:text-zinc-700"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDelete(true)}
                                className="w-full rounded-none border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                            >
                                Delete Post
                            </Button>
                        )}
                    </div>
                )}
            </aside>
        </div>
    )
}
