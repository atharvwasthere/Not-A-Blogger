import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { LazyImage } from './extensions/LazyImage'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import Bold from 'lucide-react/dist/esm/icons/bold'
import Italic from 'lucide-react/dist/esm/icons/italic'
import LinkIcon from 'lucide-react/dist/esm/icons/link'
import Code from 'lucide-react/dist/esm/icons/code'
import AlignLeft from 'lucide-react/dist/esm/icons/align-left'
import AlignCenter from 'lucide-react/dist/esm/icons/align-center'
import AlignRight from 'lucide-react/dist/esm/icons/align-right'
import UnderlineIcon from 'lucide-react/dist/esm/icons/underline'
import YoutubeIcon from 'lucide-react/dist/esm/icons/youtube'
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import { cn } from '@/lib/utils'
import { SlashCommand } from './extensions/slash-command'
import { api } from '@/lib/api'
import { useCallback, useState, useRef, useEffect } from 'react'
import type { AnyExtension } from '@tiptap/core'
import { Loader2 } from 'lucide-react'

// Base extensions that are lightweight — loaded statically
const baseExtensions: AnyExtension[] = [
    StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        codeBlock: false,
        blockquote: { HTMLAttributes: { class: "border-l-4 border-zinc-200 pl-4 py-1 my-4 italic text-zinc-600 bg-zinc-50 rounded-r" } },
    }),
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === 'heading') return 'Heading...'
            return "Type '/' for commands..."
        },
    }),
    Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "active-link text-blue-500 underline cursor-pointer" }
    }),
    LazyImage.configure({
        HTMLAttributes: { class: "rounded-lg border border-zinc-200 shadow-sm max-w-full my-6" },
    }),
    Highlight.configure({
        multicolor: true,
    }),
    Underline,
    TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
    }),
    SlashCommand,
    Typography,
]

// Heavy extensions loaded dynamically: CodeBlockLowlight+lowlight, Youtube, TaskList, TaskItem
async function loadHeavyExtensions(): Promise<AnyExtension[]> {
    const [
        { default: CodeBlockLowlight },
        { createLowlight },
        { default: Youtube },
        { default: TaskList },
        { default: TaskItem },
        js, ts, bash, python, json, css, xml, go, rust, sql, java, cpp,
    ] = await Promise.all([
        import('@tiptap/extension-code-block-lowlight'),
        import('lowlight'),
        import('@tiptap/extension-youtube'),
        import('@tiptap/extension-task-list'),
        import('@tiptap/extension-task-item'),
        import('highlight.js/lib/languages/javascript'),
        import('highlight.js/lib/languages/typescript'),
        import('highlight.js/lib/languages/bash'),
        import('highlight.js/lib/languages/python'),
        import('highlight.js/lib/languages/json'),
        import('highlight.js/lib/languages/css'),
        import('highlight.js/lib/languages/xml'),
        import('highlight.js/lib/languages/go'),
        import('highlight.js/lib/languages/rust'),
        import('highlight.js/lib/languages/sql'),
        import('highlight.js/lib/languages/java'),
        import('highlight.js/lib/languages/cpp'),
    ])

    // Create lowlight with only the languages we need instead of `common` (~350KB savings)
    const lowlight = createLowlight()
    lowlight.register('javascript', js.default)
    lowlight.register('typescript', ts.default)
    lowlight.register('bash', bash.default)
    lowlight.register('python', python.default)
    lowlight.register('json', json.default)
    lowlight.register('css', css.default)
    lowlight.register('xml', xml.default)
    lowlight.register('go', go.default)
    lowlight.register('rust', rust.default)
    lowlight.register('sql', sql.default)
    lowlight.register('java', java.default)
    lowlight.register('cpp', cpp.default)

    return [
        CodeBlockLowlight.configure({
            lowlight,
            HTMLAttributes: { class: "notion-code-block hljs bg-[#191919] text-[#e1e1e1] p-5 rounded-lg font-mono text-sm my-4 overflow-x-auto border border-zinc-800/50" },
        }),
        Youtube.configure({
            HTMLAttributes: { class: "w-full max-w-full aspect-video rounded-lg shadow-sm my-6 overflow-hidden border border-zinc-200" },
            width: 840,
            height: 472.5,
        }),
        TaskList.configure({
            HTMLAttributes: { class: "not-prose pl-2" },
        }),
        TaskItem.configure({
            nested: true,
        }),
    ]
}

interface EditorProps {
    content: string
    onChange: (html: string) => void
    editable?: boolean
}

// Small inline URL input popover used for link + youtube
function UrlInput({
    placeholder,
    defaultValue,
    onConfirm,
    onCancel,
}: {
    placeholder: string
    defaultValue?: string
    onConfirm: (value: string) => void
    onCancel: () => void
}) {
    const [value, setValue] = useState(defaultValue || '')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); onConfirm(value) }
        if (e.key === 'Escape') { e.preventDefault(); onCancel() }
    }

    return (
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg shadow-md px-2 py-1">
            <input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="text-sm outline-none w-56 text-zinc-800 placeholder:text-zinc-400 bg-transparent"
            />
            <button
                onClick={() => onConfirm(value)}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-green-600 transition-colors"
            >
                <Check size={13} />
            </button>
            <button
                onClick={onCancel}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-red-500 transition-colors"
            >
                <X size={13} />
            </button>
        </div>
    )
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
    const [allExtensions, setAllExtensions] = useState<AnyExtension[] | null>(null)
    const [linkInputOpen, setLinkInputOpen] = useState(false)
    const [youtubeInputOpen, setYoutubeInputOpen] = useState(false)

    // Load heavy extensions before creating the editor
    useEffect(() => {
        loadHeavyExtensions().then(heavy => {
            setAllExtensions([...baseExtensions, ...heavy])
        })
    }, [])

    const editor = useEditor({
        extensions: allExtensions || baseExtensions,
        content,
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-zinc max-w-none focus:outline-none min-h-[50vh] text-zinc-800 break-words ' +
                    'prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-3 prose-h1:font-semibold ' +
                    'prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-2 prose-h2:font-semibold ' +
                    'prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-1 prose-h3:font-semibold ' +
                    'prose-p:my-2 prose-p:leading-relaxed ' +
                    'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
                spellcheck: 'false',
            },
            handleDrop: (view, event, _slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0]
                    if (file.type.startsWith('image/')) {
                        api.uploadImage(file).then(url => {
                            const { schema } = view.state
                            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                            const node = schema.nodes.image.create({ src: url })
                            const transaction = view.state.tr.insert(coordinates?.pos || 0, node)
                            view.dispatch(transaction)
                        }).catch(err => console.error("Drop upload failed", err))
                        return true
                    }
                }
                return false
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    }, [allExtensions])

    const handleLinkConfirm = useCallback((url: string) => {
        setLinkInputOpen(false)
        if (!editor) return
        if (!url) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const handleYoutubeConfirm = useCallback((url: string) => {
        setYoutubeInputOpen(false)
        if (!editor || !url) return
        editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }, [editor])

    if (!allExtensions) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-300" size={24} />
            </div>
        )
    }

    if (!editor) return null

    return (
        <div className="relative group editor-container">
            {editable && (
                <BubbleMenu
                    editor={editor}
                    className="bg-white border border-zinc-200 shadow-lg rounded-lg flex items-center p-1 gap-0.5 text-zinc-600 overflow-hidden"
                >
                    {/* Inline link input */}
                    {linkInputOpen ? (
                        <UrlInput
                            placeholder="https://..."
                            defaultValue={editor.getAttributes('link').href}
                            onConfirm={handleLinkConfirm}
                            onCancel={() => setLinkInputOpen(false)}
                        />
                    ) : youtubeInputOpen ? (
                        <UrlInput
                            placeholder="YouTube URL..."
                            onConfirm={handleYoutubeConfirm}
                            onCancel={() => setYoutubeInputOpen(false)}
                        />
                    ) : editor.isActive('image') ? (
                        <>
                            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn("p-1.5 hover:bg-zinc-100 rounded")}>
                                <AlignLeft size={14} />
                            </button>
                            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn("p-1.5 hover:bg-zinc-100 rounded")}>
                                <AlignCenter size={14} />
                            </button>
                            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn("p-1.5 hover:bg-zinc-100 rounded")}>
                                <AlignRight size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('bold') && "bg-zinc-100 text-zinc-900")}>
                                <Bold size={14} />
                            </button>
                            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('italic') && "bg-zinc-100 text-zinc-900")}>
                                <Italic size={14} />
                            </button>
                            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('underline') && "bg-zinc-100 text-zinc-900")}>
                                <UnderlineIcon size={14} />
                            </button>
                            <div className="flex items-center gap-0.5 px-1 border-l border-r border-zinc-100 mx-0.5">
                                <button
                                    onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef9c3' }).run()}
                                    className={cn("w-4 h-4 rounded-full bg-[#fef9c3] border border-zinc-200 hover:scale-110 transition-transform", editor.isActive('highlight', { color: '#fef9c3' }) && "ring-1 ring-zinc-400")}
                                    title="Yellow Highlight"
                                />
                                <button
                                    onClick={() => editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run()}
                                    className={cn("w-4 h-4 rounded-full bg-[#bbf7d0] border border-zinc-200 hover:scale-110 transition-transform", editor.isActive('highlight', { color: '#bbf7d0' }) && "ring-1 ring-zinc-400")}
                                    title="Green Highlight"
                                />
                                <button
                                    onClick={() => editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run()}
                                    className={cn("w-4 h-4 rounded-full bg-[#bfdbfe] border border-zinc-200 hover:scale-110 transition-transform", editor.isActive('highlight', { color: '#bfdbfe' }) && "ring-1 ring-zinc-400")}
                                    title="Blue Highlight"
                                />
                                <button
                                    onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbcfe8' }).run()}
                                    className={cn("w-4 h-4 rounded-full bg-[#fbcfe8] border border-zinc-200 hover:scale-110 transition-transform", editor.isActive('highlight', { color: '#fbcfe8' }) && "ring-1 ring-zinc-400")}
                                    title="Pink Highlight"
                                />
                                <button
                                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                                    className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
                                    title="Remove Highlight"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                            <button onClick={() => editor.chain().focus().toggleCode().run()} className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('code') && "bg-zinc-100 text-zinc-900")}>
                                <Code size={14} />
                            </button>

                            <div className="w-px h-4 bg-zinc-200 mx-1" />

                            <button onClick={() => setLinkInputOpen(true)} className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('link') && "bg-zinc-100 text-blue-500")}>
                                <LinkIcon size={14} />
                            </button>
                            <button onClick={() => setYoutubeInputOpen(true)} className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('youtube') && "bg-zinc-100 text-red-500")}>
                                <YoutubeIcon size={14} />
                            </button>
                        </>
                    )}
                </BubbleMenu>
            )}

            <div className="min-h-[500px]" onClick={() => editor?.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>

            <div className="absolute top-2 right-2 text-xs text-zinc-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Type '/' for commands
            </div>
        </div>
    )
}
