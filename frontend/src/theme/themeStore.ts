export type Theme = 'light' | 'dark'

/** The theme names the interactive embeds already understand. */
export type EmbedMode = 'default' | 'reader-dark'

export const THEME_STORAGE_KEY = 'nab-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function readStoredTheme(): Theme | null {
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY)
        return value === 'light' || value === 'dark' ? value : null
    } catch {
        return null
    }
}

export function storeTheme(theme: Theme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
        // Private mode or blocked storage: the choice lasts for this page only.
    }
}

export function systemTheme(): Theme {
    return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function initialTheme(): Theme {
    return readStoredTheme() ?? systemTheme()
}

/** The theme currently applied to <html>, set by the head script before first paint. */
export function appliedTheme(): Theme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const embedModeFor = (theme: Theme): EmbedMode => (theme === 'dark' ? 'reader-dark' : 'default')

/**
 * Runs inline in <head> before any CSS paints, so a dark reader never sees a light flash.
 * Same key and media query as above; kept as a string because it cannot import anything.
 */
export const themeBootScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('${DARK_QUERY}').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');})();`
