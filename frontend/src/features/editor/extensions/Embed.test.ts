// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { getSchema } from '@tiptap/core'
import { DOMParser, DOMSerializer } from 'prosemirror-model'
import StarterKit from '@tiptap/starter-kit'
import { Embed, DEFAULT_EMBED_HEIGHT } from './Embed'

const schema = getSchema([StarterKit, Embed])

const toHtml = (doc: any) => {
    const el = document.createElement('div')
    el.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content))
    return el.innerHTML
}

const fromHtml = (html: string) => {
    const el = document.createElement('div')
    el.innerHTML = html
    return DOMParser.fromSchema(schema).parse(el)
}

const docWithEmbed = (attrs: Record<string, unknown>) =>
    schema.node('doc', null, [schema.node('embed', attrs)])

describe('Embed node', () => {
    const attrs = { embedId: 'abc-123', title: 'Chunking, step by step', height: 520 }

    it('serialises a figure carrying the embed id', () => {
        const html = toHtml(docWithEmbed(attrs))
        expect(html).toContain('data-embed-id="abc-123"')
        expect(html).toContain('<figcaption')
        expect(html).toContain('Chunking, step by step')
    })

    it('sandboxes the frame without granting same-origin', () => {
        const html = toHtml(docWithEmbed(attrs))
        expect(html).toContain('sandbox="allow-scripts"')
        expect(html).not.toContain('allow-same-origin')
        expect(html).toContain('loading="lazy"')
    })

    it('stores no src, so post content carries no API domain', () => {
        expect(toHtml(docWithEmbed(attrs))).not.toContain('src=')
    })

    it('round-trips through saved HTML without losing the node', () => {
        const parsed = fromHtml(toHtml(docWithEmbed(attrs)))
        expect(parsed.firstChild?.type.name).toBe('embed')
        expect(parsed.firstChild?.attrs).toMatchObject(attrs)
    })

    it('falls back to the default height when the attribute is absent', () => {
        const parsed = fromHtml('<figure data-embed-id="x"><iframe></iframe></figure>')
        expect(parsed.firstChild?.attrs.height).toBe(DEFAULT_EMBED_HEIGHT)
    })
})
