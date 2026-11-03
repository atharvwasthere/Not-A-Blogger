export type ReferenceKind = 'article' | 'paper' | 'repo' | 'package'

export const REFERENCE_KINDS: ReferenceKind[] = ['article', 'paper', 'repo', 'package']

export interface Reference {
    kind: ReferenceKind
    url: string
    title: string
    source: string
    note: string
    /** Package references only: the install command, e.g. "npm i archiver". */
    install?: string
}

export interface DetectedReference {
    kind: ReferenceKind
    source: string
    install?: string
}

const PAPER_HOSTS = ['arxiv.org', 'usenix.org', 'dl.acm.org', 'acm.org', 'ieeexplore.ieee.org']

const isHost = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`)

/** Guesses kind, source line and install command from a pasted URL. The author can change all three. */
export function detectReference(url: string): DetectedReference {
    let parsed: URL
    try {
        parsed = new URL(url.trim())
    } catch {
        return { kind: 'article', source: '' }
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    const [first, second] = parsed.pathname.split('/').filter(Boolean)

    if (host === 'github.com' && first && second) {
        return { kind: 'repo', source: `github · ${first}/${second}` }
    }
    if (host === 'npmjs.com' && first === 'package' && second) {
        // Scoped packages: /package/@scope/name
        const name = second.startsWith('@') ? `${second}/${parsed.pathname.split('/').filter(Boolean)[2] ?? ''}` : second
        return { kind: 'package', source: 'npm package', install: `npm i ${name}` }
    }
    if (host === 'pypi.org' && first === 'project' && second) {
        return { kind: 'package', source: 'PyPI package', install: `pip install ${second}` }
    }
    if (PAPER_HOSTS.some(domain => isHost(host, domain)) || host.startsWith('research.')) {
        return { kind: 'paper', source: host }
    }
    return { kind: 'article', source: host }
}
