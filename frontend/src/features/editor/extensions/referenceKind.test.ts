import { describe, expect, it } from 'vitest'
import { detectReference } from './referenceKind'

describe('detectReference', () => {
    it.each([
        ['https://github.com/archiverjs/node-archiver', { kind: 'repo', source: 'github · archiverjs/node-archiver' }],
        ['https://github.com/archiverjs/node-archiver/tree/master/lib', { kind: 'repo', source: 'github · archiverjs/node-archiver' }],
        ['https://www.npmjs.com/package/archiver', { kind: 'package', source: 'npm package', install: 'npm i archiver' }],
        ['https://www.npmjs.com/package/@aws-sdk/client-s3', { kind: 'package', source: 'npm package', install: 'npm i @aws-sdk/client-s3' }],
        ['https://pypi.org/project/requests/', { kind: 'package', source: 'PyPI package', install: 'pip install requests' }],
        ['https://arxiv.org/abs/1706.03762', { kind: 'paper', source: 'arxiv.org' }],
        ['https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala', { kind: 'paper', source: 'usenix.org' }],
        ['https://dl.acm.org/doi/10.1145/1294261.1294281', { kind: 'paper', source: 'dl.acm.org' }],
        ['https://queue.acm.org/detail.cfm?id=2655736', { kind: 'paper', source: 'queue.acm.org' }],
        ['https://ieeexplore.ieee.org/document/1234', { kind: 'paper', source: 'ieeexplore.ieee.org' }],
        ['https://research.google/pubs/pub36356/', { kind: 'paper', source: 'research.google' }],
        ['https://www.dev.to/aws-builders/s3-zipper', { kind: 'article', source: 'dev.to' }],
        ['https://martinfowler.com/articles/patterns-of-distributed-systems/', { kind: 'article', source: 'martinfowler.com' }],
    ])('%s', (url, expected) => {
        expect(detectReference(url)).toEqual(expected)
    })

    it('does not treat a GitHub profile as a repo', () => {
        expect(detectReference('https://github.com/atharvwasthere').kind).toBe('article')
    })

    it('treats an unparseable URL as an article with no source', () => {
        expect(detectReference('not a url')).toEqual({ kind: 'article', source: '' })
    })
})
