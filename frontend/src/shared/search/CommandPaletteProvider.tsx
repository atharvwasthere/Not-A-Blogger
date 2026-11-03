import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface CommandPaletteState {
    open: boolean
    setOpen: (open: boolean | ((open: boolean) => boolean)) => void
}

const CommandPaletteContext = createContext<CommandPaletteState | null>(null)

/** Shares the search dialog's open state between ⌘K, the nav button and the dialog itself. */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Modifier check keeps this independent of the homepage 'admin' easter-egg buffer.
            if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(o => !o)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const value = useMemo(() => ({ open, setOpen }), [open])
    return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
}

export function useCommandPalette(): CommandPaletteState {
    const value = useContext(CommandPaletteContext)
    if (!value) throw new Error('useCommandPalette must be used inside <CommandPaletteProvider>')
    return value
}
