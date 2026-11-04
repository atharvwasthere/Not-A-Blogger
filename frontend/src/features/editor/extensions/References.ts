import { Node } from '@tiptap/core'
import type { DOMOutputSpec, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { REFERENCE_KINDS, type Reference, type ReferenceKind } from './referenceKind'
import { OPEN_REFERENCES_EVENT, ReferencesView } from './ReferencesView'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        references: {
            /** Adds the post's References block at the end, or goes to the one it already has. */
            openReferences: () => ReturnType
        }
    }
}

const text = (el: Element | null) => el?.textContent?.trim() ?? ''

/** Reads the HTML contract (see docs/redesign/03-article-and-references.md) back into items. */
export function parseReferences(section: HTMLElement): Reference[] {
    return Array.from(section.querySelectorAll(':scope > ol > li')).map((li) => {
        const kind = li.getAttribute('data-kind') as ReferenceKind
        const link = li.querySelector('a[href]')
        const install = text(li.querySelector('code[data-install]'))
        return {
            kind: REFERENCE_KINDS.includes(kind) ? kind : 'article',
            url: link?.getAttribute('href') ?? '',
            title: text(link),
            source: text(li.querySelector('[data-source]')),
            note: text(li.querySelector('[data-note]')),
            ...(install ? { install } : {}),
        }
    })
}

function renderReference(item: Reference): DOMOutputSpec {
    const children: DOMOutputSpec[] = [['a', { href: item.url }, item.title || item.url]]
    if (item.source) children.push(['span', { 'data-source': '' }, item.source])
    children.push(['p', { 'data-note': '' }, item.note])
    if (item.kind === 'package' && item.install) children.push(['code', { 'data-install': '' }, item.install])
    return ['li', { 'data-kind': item.kind }, ...children]
}

/** The position of the post's references node, if it has one. */
export function findReferences(doc: ProseMirrorNode): number | null {
    let found: number | null = null
    doc.descendants((node, pos) => {
        if (found !== null) return false
        if (node.type.name === 'references') found = pos
        return found === null
    })
    return found
}

export const References = Node.create({
    name: 'references',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            items: {
                default: [] as Reference[],
                parseHTML: (el) => parseReferences(el as HTMLElement),
                // Written by renderHTML below, not as an attribute.
                renderHTML: () => ({}),
            },
        }
    },

    parseHTML() {
        return [{ tag: 'section[data-references]' }]
    },

    // The contract the MCP agent and the article page also use: a heading and a list,
    // so it reads correctly with no JavaScript.
    renderHTML({ node }) {
        const items = (node.attrs.items as Reference[]).map(renderReference)
        return ['section', { 'data-references': '' }, ['h2', {}, 'References'], ['ol', {}, ...items]]
    },

    addCommands() {
        return {
            openReferences:
                () =>
                ({ editor, tr, dispatch }) => {
                    // tr.doc, not editor.state: the chained deleteRange has already moved positions.
                    let pos = findReferences(tr.doc)
                    if (pos === null) {
                        pos = tr.doc.content.size
                        tr.insert(pos, this.type.create({ items: [] }))
                    }
                    if (dispatch) {
                        const at = pos
                        // After the transaction lands, so the node view exists.
                        requestAnimationFrame(() => {
                            const dom = editor.view.nodeDOM(at) as HTMLElement | null
                            dom?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                            window.dispatchEvent(new CustomEvent(OPEN_REFERENCES_EVENT, { detail: editor }))
                        })
                    }
                    return true
                },
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(ReferencesView, {
            // The card has its own inputs and drag handling; keep ProseMirror out of them.
            stopEvent: () => true,
        })
    },
})
