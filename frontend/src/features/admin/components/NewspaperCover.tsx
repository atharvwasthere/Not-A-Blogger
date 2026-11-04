import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import type { PrintInvert } from '@/lib/types'
import { Print } from '@/features/blog/components/Print'
import { Switch } from '@/shared/ui/Switch'

/** Every <img> in the post, plus the banner image, without duplicates. */
function sourceImages(content: string, coverImage: string): string[] {
    const doc = new DOMParser().parseFromString(content, 'text/html')
    const srcs = Array.from(doc.querySelectorAll('img'), (img) => img.getAttribute('src') ?? '')
    return [...new Set([...srcs, coverImage].filter(Boolean))]
}

const INVERT: Array<{ value: PrintInvert; label: string }> = [
    { value: 'auto', label: 'Auto' },
    { value: 'always', label: 'Always' },
    { value: 'never', label: 'Never' },
]

/** Pick a post image, print it, preview it on both papers; it reaches the site only when the post is saved. */
export function NewspaperCover({
    postId,
    content,
    coverImage,
    printUrl,
    onPrintUrlChange,
    showPrint,
    onShowPrintChange,
}: {
    postId?: string
    content: string
    coverImage: string
    printUrl: string | null
    onPrintUrlChange: (url: string) => void
    showPrint: boolean
    onShowPrintChange: (show: boolean) => void
}) {
    const sources = useMemo(() => sourceImages(content, coverImage), [content, coverImage])
    const [source, setSource] = useState<string | null>(null)
    const [invert, setInvert] = useState<PrintInvert>('auto')

    const generate = useMutation({
        mutationFn: () => api.generatePrint(postId!, source!, invert),
        onSuccess: ({ print_url }) => {
            onPrintUrlChange(print_url)
            toast.success('Cover ready. Save the post to use it.')
        },
        onError: (error) => toast.error((error as Error).message || 'Could not generate the cover'),
    })

    return (
        <div className="space-y-4">
            <h3 className="font-serif text-lg text-zinc-900">Newspaper cover</h3>
            {!postId ? (
                <p className="text-xs text-zinc-400">Save the post once to make a cover from its images.</p>
            ) : (
                <>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Source</label>
                        {sources.length === 0 ? (
                            <p className="text-xs text-zinc-400">This post has no images yet.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {sources.map((src) => (
                                    <button
                                        key={src}
                                        type="button"
                                        onClick={() => setSource(src)}
                                        aria-pressed={source === src}
                                        className={`aspect-[16/10] overflow-hidden rounded border-2 bg-white ${source === src ? 'border-zinc-900' : 'border-transparent hover:border-zinc-200'}`}
                                    >
                                        <img src={src} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-medium">Invert</label>
                        <div className="bg-zinc-100 p-1 flex gap-1 rounded-lg">
                            {INVERT.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setInvert(option.value)}
                                    aria-pressed={invert === option.value}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md ${invert === option.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => generate.mutate()}
                        disabled={!source || generate.isPending}
                        className="w-full border border-zinc-300 py-2 font-mono text-xs uppercase tracking-wider text-zinc-700 hover:border-zinc-900 disabled:opacity-40"
                    >
                        {generate.isPending ? 'Generating…' : 'Generate'}
                    </button>

                    {printUrl && (
                        <div className="grid grid-cols-2 gap-2">
                            {/* The same file on both papers: the dots take each theme's ink. */}
                            <div className="theme-light rounded bg-paper p-2">
                                <Print src={printUrl} ratio="16/10" />
                            </div>
                            <div className="dark rounded bg-paper p-2">
                                <Print src={printUrl} ratio="16/10" />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-zinc-700">Show cover</span>
                        <Switch
                            checked={showPrint}
                            onChange={onShowPrintChange}
                            label="Show cover"
                            disabled={!printUrl}
                        />
                    </div>
                    {!printUrl && <p className="text-[10px] text-zinc-400">Generate a cover first.</p>}
                </>
            )}
        </div>
    )
}
