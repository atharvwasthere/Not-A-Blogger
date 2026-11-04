import type { BasedOn as BasedOnSource } from '@/lib/types'

/** The source a paper-series post is built around, before the first word of the article. */
export function BasedOn({ source }: { source: BasedOnSource }) {
    return (
        <p className="mb-[30px] flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-rule pb-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-soft">Based on</span>
            <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-[19px] italic text-ink underline decoration-rule underline-offset-4"
            >
                {source.title}
            </a>
            {source.by && <span className="font-mono text-xs text-soft">{source.by}</span>}
        </p>
    )
}
