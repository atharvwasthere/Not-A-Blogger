import { Command } from 'cmdk'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { PostIcon } from '@/features/blog/components/PostIcon'
import { postsQueryOptions } from '@/features/blog/hooks/usePosts'
import { useCommandPalette } from '@/shared/search/CommandPaletteProvider'

// Plain substring match: cmdk's default fuzzy scoring matches almost anything against a long excerpt.
const matches = (value: string, search: string, keywords?: string[]) =>
    [value, ...(keywords ?? [])].join(' ').toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0

/** Global search dialog, opened by ⌘K / Ctrl+K or the search button in the nav. */
export function CommandPalette() {
    const { open, setOpen } = useCommandPalette()
    const navigate = useNavigate()

    const { data: posts } = useQuery({ ...postsQueryOptions, enabled: open })

    const go = (slug: string) => {
        setOpen(false)
        navigate({ to: '/blog/$slug', params: { slug } })
    }

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Search notes"
            filter={matches}
            overlayClassName="fixed inset-0 z-[100] bg-[var(--scrim)]"
            contentClassName="fixed left-1/2 top-[14vh] z-[101] w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-[14px] border border-rule bg-card shadow-2xl"
        >
            <Command.Input
                placeholder="Search notes…"
                className="w-full border-b border-rule bg-transparent px-5 py-[18px] font-sans text-base text-ink outline-none placeholder:text-faint"
            />
            <Command.List className="max-h-[50vh] overflow-y-auto p-2 no-scrollbar">
                <Command.Empty className="px-3 py-[18px] font-sans text-sm text-soft">
                    No notes match that.
                </Command.Empty>
                {posts?.map(post => (
                    <Command.Item
                        key={post.slug}
                        value={post.slug}
                        keywords={[post.title, ...post.tags, post.excerpt ?? '']}
                        onSelect={() => go(post.slug)}
                        className="grid cursor-pointer grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-wash"
                    >
                        <PostIcon post={post} className="h-[22px] w-[22px]" />
                        <span className="font-sans text-[14.5px] text-ink">{post.title}</span>
                        <span className="font-mono text-xs text-soft">{post.reading_time || 1} min</span>
                    </Command.Item>
                ))}
            </Command.List>
        </Command.Dialog>
    )
}
