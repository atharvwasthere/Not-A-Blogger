import { useEffect, useState } from "react"

// Simple cookie utilities
function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return undefined
}

function setCookie(name: string, value: string, days: number) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `; expires=${date.toUTCString()}`
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`
}

export function useSessionIntro(initialSeen?: boolean) {
    // Initialize from server-provided value or cookie
    const [show, setShow] = useState(() => {
        if (typeof initialSeen === 'boolean') return !initialSeen
        if (typeof window === 'undefined') return false
        return !getCookie("intro-seen")
    })

    useEffect(() => {
        if (show) {
            setCookie("intro-seen", "true", 1) // Keep for 1 day
            const t = setTimeout(() => setShow(false), 3500)
            return () => clearTimeout(t)
        }
    }, [show])

    return show
}
