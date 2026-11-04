import { Search } from 'lucide-react'
import { useCommandPalette } from '@/shared/search/CommandPaletteProvider'

/** `compact` is the icon-only button in the phone header. */
export function SearchButton({ compact = false }: { compact?: boolean }) {
    const { setOpen } = useCommandPalette()

    if (compact) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Search notes"
                className="grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-wash"
            >
                <Search className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search notes"
            className="inline-flex items-center gap-[22px] rounded-lg border border-rule bg-card px-3.5 py-[9px] text-ink transition-colors hover:border-faint"
        >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
            <kbd className="font-mono text-[13px] text-soft">⌘ K</kbd>
        </button>
    )
}
