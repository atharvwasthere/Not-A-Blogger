import { Node, mergeAttributes } from '@tiptap/core'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

export const DEFAULT_EMBED_HEIGHT = 480

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        embed: {
            setEmbed: (attrs: { embedId: string; title: string }) => ReturnType
        }
    }
}

/** Opens a file picker for a single .html visualiser. Shared with the /embed slash item. */
export function pickHtmlFile(onPick: (file: File) => void) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,text/html'
    input.onchange = () => {
        const file = input.files?.[0]
        if (file) onPick(file)
    }
    input.click()
}

export const Embed = Node.create({
    name: 'embed',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addOptions() {
        // Absent until the post has been saved once — the /embed item stays hidden until then.
        return { postId: null as string | null }
    },

    addAttributes() {
        return {
            embedId: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-embed-id'),
                renderHTML: (attrs) => ({ 'data-embed-id': attrs.embedId }),
            },
            title: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-embed-title') ?? '',
                renderHTML: (attrs) => ({ 'data-embed-title': attrs.title }),
            },
            height: {
                default: DEFAULT_EMBED_HEIGHT,
                parseHTML: (el) =>
                    Number(el.getAttribute('data-embed-height')) || DEFAULT_EMBED_HEIGHT,
                renderHTML: (attrs) => ({ 'data-embed-height': String(attrs.height) }),
            },
        }
    },

    // Matches what renderHTML writes, so a saved post reopens as a node instead of being discarded.
    parseHTML() {
        return [{ tag: 'figure[data-embed-id]' }]
    },

    renderHTML({ HTMLAttributes, node }) {
        const title = node.attrs.title || 'Interactive visualiser'
        // No src — it is attached at read time from data-embed-id, so saved posts never
        // carry an API domain that a migration would invalidate.
        return [
            'figure',
            mergeAttributes(HTMLAttributes, { class: 'not-prose my-8' }),
            [
                'iframe',
                {
                    'data-embed-frame': '',
                    sandbox: 'allow-scripts',
                    loading: 'lazy',
                    title,
                    style: `display:block;width:100%;border:0;height:${node.attrs.height}px`,
                },
            ],
            ['figcaption', { class: 'mt-3 font-mono text-xs text-zinc-500' }, title],
        ]
    },

    addCommands() {
        return {
            setEmbed:
                (attrs) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs }),
        }
    },

    // A card, not a live frame: the visualiser was built and checked standalone, and running
    // its scripts inside a contenteditable invites hung loops and selection bugs.
    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('div')
            dom.contentEditable = 'false'
            dom.className =
                'not-prose my-8 flex items-center gap-4 border border-zinc-200 bg-zinc-50 px-4 py-3'

            const label = document.createElement('div')
            label.className = 'min-w-0 flex-1'
            label.innerHTML =
                '<div class="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Visualiser</div>' +
                '<div class="truncate text-sm text-zinc-800"></div>'
            label.lastElementChild!.textContent = node.attrs.title || 'Untitled'

            const replace = document.createElement('button')
            replace.type = 'button'
            replace.textContent = 'Replace file'
            replace.className =
                'shrink-0 border border-zinc-300 px-3 py-1.5 font-mono text-xs text-zinc-600 hover:border-zinc-900 hover:text-zinc-900'
            replace.onclick = () =>
                pickHtmlFile(async (file) => {
                    try {
                        await api.replaceEmbed(node.attrs.embedId, file)
                        toast.success('Visualiser replaced')
                    } catch (error) {
                        toast.error((error as Error).message || 'Replace failed')
                    }
                })

            dom.append(label, replace)
            return { dom }
        }
    },
})
