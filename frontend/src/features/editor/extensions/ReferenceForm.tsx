import { useState } from 'react'
import { detectReference, REFERENCE_KINDS, type DetectedReference, type Reference, type ReferenceKind } from './referenceKind'

const isHttpUrl = (value: string) => {
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
        return false
    }
}

const EMPTY: Reference = { kind: 'article', url: '', title: '', source: '', note: '' }

const inputClass =
    'w-full rounded-[4px] border border-rule bg-card px-3 py-2 font-sans text-sm text-ink placeholder:text-faint focus:border-ink focus:outline-none'
const labelClass = 'grid gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-soft'

/** Inline fields for one reference. URL first: pasting it fills in kind, source and install. */
export function ReferenceForm({
    initial,
    onSave,
    onCancel,
}: {
    initial?: Reference
    onSave: (reference: Reference) => void
    onCancel: () => void
}) {
    const [draft, setDraft] = useState<Reference>(initial ?? EMPTY)
    const set = (patch: Partial<Reference>) => setDraft((d) => ({ ...d, ...patch }))

    // What detection last filled in; a field the author has changed since is left alone.
    const [auto, setAuto] = useState<DetectedReference>(() =>
        initial && isHttpUrl(initial.url) ? detectReference(initial.url) : { kind: EMPTY.kind, source: '' },
    )

    const onUrl = (url: string) => {
        if (!isHttpUrl(url)) return set({ url })
        const detected = detectReference(url)
        setDraft((d) => ({
            ...d,
            url,
            kind: d.kind === auto.kind ? detected.kind : d.kind,
            source: !d.source || d.source === auto.source ? detected.source : d.source,
            install: !d.install || d.install === auto.install ? detected.install : d.install,
        }))
        setAuto(detected)
    }

    const canSave = isHttpUrl(draft.url) && draft.title.trim() !== '' && draft.note.trim() !== ''

    const save = () => {
        if (!canSave) return
        const { install, ...rest } = draft
        const trimmed = {
            ...rest,
            url: rest.url.trim(),
            title: rest.title.trim(),
            source: rest.source.trim(),
            note: rest.note.trim(),
        }
        onSave(draft.kind === 'package' && install?.trim() ? { ...trimmed, install: install.trim() } : trimmed)
    }

    return (
        <div className="grid gap-3 rounded-md border border-rule bg-paper p-4">
            <label className={labelClass}>
                URL
                <input
                    autoFocus
                    className={inputClass}
                    value={draft.url}
                    placeholder="https://…"
                    onChange={(e) => onUrl(e.target.value)}
                />
            </label>
            <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
                <label className={labelClass}>
                    Kind
                    <select
                        className={inputClass}
                        value={draft.kind}
                        onChange={(e) => set({ kind: e.target.value as ReferenceKind })}
                    >
                        {REFERENCE_KINDS.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                    </select>
                </label>
                <label className={labelClass}>
                    Title
                    <input className={inputClass} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
                </label>
            </div>
            <label className={labelClass}>
                Source line
                <input
                    className={inputClass}
                    value={draft.source}
                    placeholder="dev.to · AWS Builders"
                    onChange={(e) => set({ source: e.target.value })}
                />
            </label>
            <label className={labelClass}>
                Note (why the reader should open it)
                <textarea
                    className={`${inputClass} min-h-[72px] font-serif text-base`}
                    value={draft.note}
                    onChange={(e) => set({ note: e.target.value })}
                />
            </label>
            {draft.kind === 'package' && (
                <label className={labelClass}>
                    Install
                    <input
                        className={`${inputClass} font-mono`}
                        value={draft.install ?? ''}
                        placeholder="npm i archiver"
                        onChange={(e) => set({ install: e.target.value })}
                    />
                </label>
            )}
            <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 font-mono text-xs text-soft hover:text-ink">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={!canSave}
                    title={canSave ? undefined : 'A reference needs a link, a title and a note'}
                    className="rounded-[4px] bg-ink px-3 py-1.5 font-mono text-xs text-paper disabled:opacity-40"
                >
                    Save
                </button>
            </div>
        </div>
    )
}
