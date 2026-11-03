import { useEffect, useState } from 'react'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Reference } from './referenceKind'
import { ReferenceForm } from './ReferenceForm'

/** Sent on window with the editor as detail, to open that editor's "add reference" form. */
export const OPEN_REFERENCES_EVENT = 'references:open'

/** `null`: nothing open; `'new'`: adding; a number: editing that item. */
type Editing = null | 'new' | number

/** The References block in the editor: the list, with add, edit, remove and drag-to-reorder. */
export function ReferencesView({ editor, node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
    const items = node.attrs.items as Reference[]
    const [editing, setEditing] = useState<Editing>(items.length === 0 ? 'new' : null)
    const [dragFrom, setDragFrom] = useState<number | null>(null)

    useEffect(() => {
        const open = (e: Event) => {
            if ((e as CustomEvent).detail === editor) setEditing('new')
        }
        window.addEventListener(OPEN_REFERENCES_EVENT, open)
        return () => window.removeEventListener(OPEN_REFERENCES_EVENT, open)
    }, [editor])

    const setItems = (next: Reference[]) => updateAttributes({ items: next })

    const save = (reference: Reference) => {
        if (editing === 'new') setItems([...items, reference])
        else if (typeof editing === 'number') setItems(items.map((item, i) => (i === editing ? reference : item)))
        setEditing(null)
    }

    const move = (from: number, to: number) => {
        if (from === to) return
        const next = [...items]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        setItems(next)
    }

    return (
        <NodeViewWrapper
            contentEditable={false}
            className={`not-prose my-8 rounded-md border bg-wash p-4 ${selected ? 'border-ink' : 'border-rule'}`}
        >
            <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-ink">References</span>
                <button
                    type="button"
                    onClick={deleteNode}
                    className="font-mono text-[11px] text-soft hover:text-danger"
                >
                    Remove block
                </button>
            </div>

            {items.length > 0 && (
                <ol className="grid gap-1">
                    {items.map((item, i) =>
                        editing === i ? (
                            <li key={i}>
                                <ReferenceForm initial={item} onSave={save} onCancel={() => setEditing(null)} />
                            </li>
                        ) : (
                            <li
                                key={i}
                                draggable
                                onDragStart={(e) => {
                                    setDragFrom(i)
                                    e.dataTransfer.effectAllowed = 'move'
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    if (dragFrom !== null) move(dragFrom, i)
                                    setDragFrom(null)
                                }}
                                onDragEnd={() => setDragFrom(null)}
                                className={`grid grid-cols-[18px_24px_minmax(0,1fr)_auto] items-start gap-2 rounded-[4px] bg-card px-2 py-2 ${dragFrom === i ? 'opacity-50' : ''}`}
                            >
                                <GripVertical className="mt-0.5 h-4 w-4 cursor-grab text-faint" aria-label="Drag to reorder" />
                                <span className="font-mono text-xs text-soft">[{i + 1}]</span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-ink">{item.title}</span>
                                    <span className="block truncate font-mono text-[11px] text-soft">
                                        {item.kind}{item.source ? ` · ${item.source}` : ''}
                                    </span>
                                    <span className="block truncate font-serif text-sm italic text-body">{item.note}</span>
                                </span>
                                <span className="flex gap-1">
                                    <button type="button" aria-label="Edit reference" onClick={() => setEditing(i)} className="p-1 text-soft hover:text-ink">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Remove reference"
                                        onClick={() => setItems(items.filter((_, j) => j !== i))}
                                        className="p-1 text-soft hover:text-danger"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </span>
                            </li>
                        ),
                    )}
                </ol>
            )}

            <div className="mt-3">
                {editing === 'new' ? (
                    <ReferenceForm onSave={save} onCancel={() => setEditing(null)} />
                ) : (
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-ink hover:underline"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add reference
                    </button>
                )}
            </div>
        </NodeViewWrapper>
    )
}
