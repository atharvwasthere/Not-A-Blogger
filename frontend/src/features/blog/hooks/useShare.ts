import { useCallback, useEffect, useState } from 'react'

export type ShareMode = 'share' | 'copy'
export type ShareResult = 'done' | 'cancelled'

/** Copies text, falling back to a hidden selection when the async clipboard is missing or refused. */
export async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const field = document.createElement('textarea')
        field.value = text
        field.setAttribute('readonly', '')
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.appendChild(field)
        field.select()
        try {
            return document.execCommand('copy')
        } catch {
            return false
        } finally {
            field.remove()
        }
    }
}

/** Phones get the system share sheet; everything else copies the link. */
export function detectShareMode(): ShareMode {
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    return typeof navigator.share === 'function' && coarse ? 'share' : 'copy'
}

export function useShare(url: string, title: string) {
    // The server cannot know the device; decide after hydration.
    const [mode, setMode] = useState<ShareMode>('copy')
    useEffect(() => setMode(detectShareMode()), [])

    const share = useCallback(async (): Promise<ShareResult> => {
        if (mode === 'share') {
            try {
                await navigator.share({ url, title })
                return 'done'
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') return 'cancelled'
                // The sheet failed for another reason: copy instead of doing nothing.
            }
        }
        return (await copyText(url)) ? 'done' : 'cancelled'
    }, [mode, url, title])

    return { mode, share }
}
