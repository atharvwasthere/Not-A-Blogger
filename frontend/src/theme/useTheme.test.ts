// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'
import { THEME_STORAGE_KEY } from './themeStore'

function mockSystem(dark: boolean) {
    const system = { dark, listeners: [] as (() => void)[] }
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        get matches() { return system.dark && query.includes('dark') },
        media: query,
        addEventListener: (_: string, fn: () => void) => system.listeners.push(fn),
        removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    return (next: boolean) => {
        system.dark = next
        system.listeners.forEach(fn => fn())
    }
}

const render = () => renderHook(() => useTheme(), { wrapper: ThemeProvider })

beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
})

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

describe('useTheme', () => {
    it('defaults to the system preference', () => {
        mockSystem(true)
        const { result } = render()
        expect(result.current.theme).toBe('dark')
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('prefers a stored choice over the system preference', () => {
        mockSystem(true)
        window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
        const { result } = render()
        expect(result.current.theme).toBe('light')
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('toggle() flips the dark class and persists the choice', () => {
        mockSystem(false)
        const { result } = render()
        expect(result.current.theme).toBe('light')

        act(() => result.current.toggle())
        expect(result.current.theme).toBe('dark')
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

        act(() => result.current.toggle())
        expect(document.documentElement.classList.contains('dark')).toBe(false)
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })

    it('maps the theme onto the embed mode names', () => {
        mockSystem(false)
        const { result } = render()
        expect(result.current.embedMode).toBe('default')
        act(() => result.current.toggle())
        expect(result.current.embedMode).toBe('reader-dark')
    })

    it('keeps working when localStorage throws', () => {
        mockSystem(true)
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
        const { result } = render()
        expect(result.current.theme).toBe('dark')
        act(() => result.current.toggle())
        expect(result.current.theme).toBe('light')
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('picks up the class set by the head script', () => {
        mockSystem(false)
        document.documentElement.classList.add('dark')
        const { result } = render()
        expect(result.current.theme).toBe('dark')
    })

    it('follows a system change until the reader picks a theme', () => {
        const setSystem = mockSystem(false)
        const { result } = render()
        act(() => setSystem(true))
        expect(result.current.theme).toBe('dark')

        act(() => result.current.toggle())
        act(() => setSystem(true))
        expect(result.current.theme).toBe('light')
    })

    it('applies a choice made in another tab', () => {
        mockSystem(false)
        const { result } = render()
        act(() => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
            window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }))
        })
        expect(result.current.theme).toBe('dark')
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
})
