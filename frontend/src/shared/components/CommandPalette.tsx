import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'

/**
 * Global ⌘K / Ctrl+K command palette.
 * Client-side fuzzy search over post title + tags (cmdk's built-in filter
 * matches against each item's `value`, which we set to "title tags...").
 * Mounted once at the root so it works on every route.
 */
export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const { data: posts } = useQuery({
        queryKey: ['posts-index'],
        queryFn: api.getPostIndex,
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Modifier check keeps this independent of the homepage 'admin' easter-egg buffer.
            if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(o => !o)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const go = (slug: string) => {
        setOpen(false)
        navigate({ to: '/blog/$slug', params: { slug } })
    }

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Search posts"
            overlayClassName="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            contentClassName="fixed left-1/2 top-[20vh] z-[101] w-[90vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        >
            <Command.Input
                placeholder="Search posts by title or tag…"
                className="w-full border-b border-border bg-transparent px-4 py-3.5 font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <Command.List className="max-h-[50vh] overflow-y-auto p-2 no-scrollbar">
                <Command.Empty className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
                    No posts found.
                </Command.Empty>
                {posts?.map(post => (
                    <Command.Item
                        key={post.slug}
                        value={`${post.title} ${post.tags.join(' ')}`}
                        onSelect={() => go(post.slug)}
                        className="flex cursor-pointer flex-col gap-1 rounded-md px-3 py-2.5 text-foreground aria-selected:bg-foreground/5"
                    >
                        <span className="font-serif text-sm">{post.title}</span>
                        {post.tags.length > 0 && (
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                {post.tags.join(' · ')}
                            </span>
                        )}
                    </Command.Item>
                ))}
            </Command.List>
        </Command.Dialog>
    )
}
