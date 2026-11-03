import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { appliedTheme, applyTheme, embedModeFor, initialTheme, storeTheme, type EmbedMode, type Theme } from './themeStore'

export interface ThemeContextValue {
    theme: Theme
    toggle: () => void
    embedMode: EmbedMode
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // The server cannot know the reader's theme; the head script has already set the class
    // on <html>, so the client reads it after hydration instead of recomputing it.
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        // Without the head script (tests, a blocked inline script) fall back to the same rule.
        const current = appliedTheme() === 'dark' ? 'dark' : initialTheme()
        applyTheme(current)
        setTheme(current)
    }, [])

    const toggle = useCallback(() => {
        setTheme(current => {
            const next: Theme = current === 'dark' ? 'light' : 'dark'
            applyTheme(next)
            storeTheme(next)
            return next
        })
    }, [])

    const value = useMemo(() => ({ theme, toggle, embedMode: embedModeFor(theme) }), [theme, toggle])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
