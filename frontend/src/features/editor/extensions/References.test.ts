// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { getSchema } from '@tiptap/core'
import { DOMParser, DOMSerializer } from 'prosemirror-model'
import StarterKit from '@tiptap/starter-kit'
import { References } from './References'
import type { Reference } from './referenceKind'

const schema = getSchema([StarterKit, References])

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

const items: Reference[] = [
    {
        kind: 'article',
        url: 'https://dev.to/aws-builders/s3-zipper-challenge-a-parallel-zip-assembly-that-beats-the-single-lambda',
        title: 'S3 zipper challenge: a parallel zip assembly that beats the single Lambda',
        source: 'dev.to · AWS Builders',
        note: 'Read this for STORE mode: when the archive layout is fixed in advance, you can build the zip in parallel.',
    },
    {
        kind: 'package',
        url: 'https://www.npmjs.com/package/archiver',
        title: 'archiver',
        source: 'npm package',
        note: 'What V3 streams every file through on its way into the multipart upload.',
        install: 'npm i archiver',
    },
    {
        kind: 'paper',
        url: 'https://www.usenix.org/nsdi13',
        title: 'Scaling Memcache at Facebook',
        source: 'usenix.org',
        note: 'Section 3.2.1 is the lease.',
    },
]

const docWith = (attrs: Record<string, unknown>) => schema.node('doc', null, [schema.node('references', attrs)])

describe('References node', () => {
    it('serialises the HTML contract: a heading and a list', () => {
        const el = document.createElement('div')
        el.innerHTML = toHtml(docWith({ items }))
        const section = el.querySelector('section[data-references]')!
        expect(section.querySelector('h2')?.textContent).toBe('References')
        const lis = section.querySelectorAll('ol > li')
        expect(lis).toHaveLength(3)
        expect(lis[0].getAttribute('data-kind')).toBe('article')
        expect(lis[0].querySelector('a')?.getAttribute('href')).toBe(items[0].url)
        expect(lis[0].querySelector('span[data-source]')?.textContent).toBe('dev.to · AWS Builders')
        expect(lis[0].querySelector('p[data-note]')?.textContent).toBe(items[0].note)
        expect(lis[1].querySelector('code[data-install]')?.textContent).toBe('npm i archiver')
        expect(lis[0].querySelector('code[data-install]')).toBeNull()
    })

    it('round-trips through saved HTML with every reference intact', () => {
        const parsed = fromHtml(toHtml(docWith({ items })))
        expect(parsed.firstChild?.type.name).toBe('references')
        expect(parsed.firstChild?.attrs.items).toEqual(items)
    })

    it('reads the contract as written by the MCP agent, with whitespace between tags', () => {
        const parsed = fromHtml(`<p>Body</p>
            <section data-references="">
              <h2>References</h2>
              <ol>
                <li data-kind="package">
                  <a href="https://www.npmjs.com/package/archiver">archiver</a>
                  <span data-source="">npm package</span>
                  <p data-note="">Why it matters.</p>
                  <code data-install="">npm i archiver</code>
                </li>
              </ol>
            </section>`)
        const node = parsed.lastChild!
        expect(node.type.name).toBe('references')
        expect(node.attrs.items).toEqual([
            { kind: 'package', url: 'https://www.npmjs.com/package/archiver', title: 'archiver', source: 'npm package', note: 'Why it matters.', install: 'npm i archiver' },
        ])
    })

    it('treats an unknown kind as an article', () => {
        const parsed = fromHtml('<section data-references=""><ol><li data-kind="video"><a href="https://x.dev">x</a><p data-note="">n</p></li></ol></section>')
        expect(parsed.firstChild?.attrs.items[0].kind).toBe('article')
    })

    it('leaves an ordinary section alone', () => {
        expect(fromHtml('<section><p>Hi</p></section>').firstChild?.type.name).toBe('paragraph')
    })
})
