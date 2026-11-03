import { Command } from 'cmdk'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useCommandPalette } from '@/shared/search/CommandPaletteProvider'

/**
 * Global search dialog, opened by ⌘K / Ctrl+K or the search button in the nav.
 * Client-side fuzzy search over post title + tags (cmdk's built-in filter
 * matches against each item's `value`, which we set to "title tags...").
 */
export function CommandPalette() {
    const { open, setOpen } = useCommandPalette()
    const navigate = useNavigate()

    const { data: posts } = useQuery({
        queryKey: ['posts-index'],
        queryFn: api.getPostIndex,
        staleTime: 5 * 60 * 1000,
    })

    const go = (slug: string) => {
        setOpen(false)
        navigate({ to: '/blog/$slug', params: { slug } })
    }

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Search notes"
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
                        value={`${post.title} ${post.tags.join(' ')}`}
                        onSelect={() => go(post.slug)}
                        className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2.5 aria-selected:bg-wash"
                    >
                        <span className="font-sans text-[14.5px] text-ink">{post.title}</span>
                        {post.tags.length > 0 && (
                            <span className="font-mono text-xs uppercase tracking-wider text-soft">
                                {post.tags.join(' · ')}
                            </span>
                        )}
                    </Command.Item>
                ))}
            </Command.List>
        </Command.Dialog>
    )
}
