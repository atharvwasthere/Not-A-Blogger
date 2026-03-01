import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'

import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Bold from 'lucide-react/dist/esm/icons/bold'
import Italic from 'lucide-react/dist/esm/icons/italic'
import LinkIcon from 'lucide-react/dist/esm/icons/link'
import Code from 'lucide-react/dist/esm/icons/code'
import AlignLeft from 'lucide-react/dist/esm/icons/align-left'
import AlignCenter from 'lucide-react/dist/esm/icons/align-center'
import AlignRight from 'lucide-react/dist/esm/icons/align-right'
import UnderlineIcon from 'lucide-react/dist/esm/icons/underline'
import Highlighter from 'lucide-react/dist/esm/icons/highlighter'
import YoutubeIcon from 'lucide-react/dist/esm/icons/youtube'
import { cn } from '@/lib/utils'
import { SlashCommand } from './extensions/slash-command'
import { api } from '@/lib/api'
import { useCallback } from 'react'

const lowlight = createLowlight(common)

interface EditorProps {
    content: string
    onChange: (html: string) => void
    editable?: boolean
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
                codeBlock: false, // Disable default codeBlock to use lowlight
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
            Image.configure({
                HTMLAttributes: { class: "rounded-lg border border-zinc-200 shadow-sm max-w-full my-6" },
            }),
            Youtube.configure({
                HTMLAttributes: { class: "w-full max-w-full aspect-video rounded-lg shadow-sm my-6 overflow-hidden border border-zinc-200" },
                width: 840,
                height: 472.5,
            }),
            Highlight.configure({
                HTMLAttributes: { class: "bg-yellow-100 px-1 rounded" },
            }),
            Underline,
            TaskList.configure({
                HTMLAttributes: { class: "not-prose pl-2" },
            }),
            TaskItem.configure({
                nested: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: { class: "bg-zinc-900 text-zinc-100 p-4 rounded-md font-mono text-sm my-4 overflow-x-auto" },
            }),
            SlashCommand,
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-zinc prose-lg max-w-none focus:outline-none min-h-[50vh] text-zinc-800 break-words',
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        // Upload Logic
                        api.uploadImage(file).then(url => {
                            const { schema } = view.state;
                            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                            const node = schema.nodes.image.create({ src: url });
                            const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
                            view.dispatch(transaction);
                        }).catch(err => console.error("Drop upload failed", err));
                        return true;
                    }
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            // HTML is the contract
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    const setLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const setYoutube = useCallback(() => {
        if (!editor) return
        const url = window.prompt('YouTube URL')

        if (url === null || url === '') return
        editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }, [editor])

    if (!editor) return null

    return (
        <div className="relative group editor-container">
            {/* Context-Aware Bubble Menu */}
            {editable && (
                <BubbleMenu
                    editor={editor}
                    className="bg-white border border-zinc-200 shadow-lg rounded-lg flex items-center p-1 gap-0.5 text-zinc-600 overflow-hidden"
                >
                    {editor.isActive('image') ? (
                        <>
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded")}
                            >
                                <AlignLeft size={14} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded")}
                            >
                                <AlignCenter size={14} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded")}
                            >
                                <AlignRight size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Standard Text Formatting */}
                            <button
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('bold') && "bg-zinc-100 text-zinc-900")}
                            >
                                <Bold size={14} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('italic') && "bg-zinc-100 text-zinc-900")}
                            >
                                <Italic size={14} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('underline') && "bg-zinc-100 text-zinc-900")}
                            >
                                <UnderlineIcon size={14} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleHighlight().run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('highlight') && "bg-zinc-100 text-zinc-900")}
                            >
                                <Highlighter size={14} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleCode().run()}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('code') && "bg-zinc-100 text-zinc-900")}
                            >
                                <Code size={14} />
                            </button>

                            <div className="w-px h-4 bg-zinc-200 mx-1" />

                            <button
                                onClick={setLink}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('link') && "bg-zinc-100 text-blue-500")}
                            >
                                <LinkIcon size={14} />
                            </button>
                            <button
                                onClick={setYoutube}
                                className={cn("p-1.5 hover:bg-zinc-100 rounded", editor.isActive('youtube') && "bg-zinc-100 text-red-500")}
                            >
                                <YoutubeIcon size={14} />
                            </button>
                        </>
                    )}
                </BubbleMenu>
            )}

            {/* Main Content */}
            <div className="min-h-[500px]" onClick={() => editor?.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>

            {/* Hint */}
            <div className="absolute top-2 right-2 text-xs text-zinc-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Type '/' for commands
            </div>
        </div>
    )
}
