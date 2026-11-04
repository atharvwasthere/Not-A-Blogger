// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useShare } from './useShare'

const URL_ = 'https://blogs.atharvsingh.me/blog/the-other-half-of-caching'

function setPointer(coarse: boolean) {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({ matches: coarse && q.includes('coarse'), media: q })) as never
}

function setShare(impl?: (data: ShareData) => Promise<void>) {
    Object.defineProperty(navigator, 'share', { value: impl, configurable: true, writable: true })
}

function setClipboard(writeText: (text: string) => Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

afterEach(() => {
    vi.restoreAllMocks()
    setShare(undefined)
})

describe('useShare', () => {
    it('copies on a fine pointer even when share exists', async () => {
        setPointer(false)
        setShare(vi.fn())
        const { result } = renderHook(() => useShare(URL_, 'Caching'))
        await waitFor(() => expect(result.current.mode).toBe('copy'))
    })

    it('shares on a coarse pointer when share exists', async () => {
        setPointer(true)
        const share = vi.fn().mockResolvedValue(undefined)
        setShare(share)
        const { result } = renderHook(() => useShare(URL_, 'Caching'))
        await waitFor(() => expect(result.current.mode).toBe('share'))

        let outcome: string | undefined
        await act(async () => { outcome = await result.current.share() })
        expect(share).toHaveBeenCalledWith({ url: URL_, title: 'Caching' })
        expect(outcome).toBe('done')
    })

    it('copies when there is no share sheet', async () => {
        setPointer(true)
        const writeText = vi.fn().mockResolvedValue(undefined)
        setClipboard(writeText)
        const { result } = renderHook(() => useShare(URL_, 'Caching'))

        let outcome: string | undefined
        await act(async () => { outcome = await result.current.share() })
        expect(result.current.mode).toBe('copy')
        expect(writeText).toHaveBeenCalledWith(URL_)
        expect(outcome).toBe('done')
    })

    it('falls back to a text selection when the clipboard refuses', async () => {
        setPointer(false)
        setClipboard(vi.fn().mockRejectedValue(new Error('denied')))
        const execCommand = vi.fn().mockReturnValue(true)
        document.execCommand = execCommand
        const { result } = renderHook(() => useShare(URL_, 'Caching'))

        let outcome: string | undefined
        await act(async () => { outcome = await result.current.share() })
        expect(execCommand).toHaveBeenCalledWith('copy')
        expect(outcome).toBe('done')
        expect(document.querySelector('textarea')).toBeNull()
    })

    it('returns cancelled when the share sheet is dismissed', async () => {
        setPointer(true)
        setShare(vi.fn().mockRejectedValue(Object.assign(new Error('cancel'), { name: 'AbortError' })))
        const writeText = vi.fn()
        setClipboard(writeText)
        const { result } = renderHook(() => useShare(URL_, 'Caching'))
        await waitFor(() => expect(result.current.mode).toBe('share'))

        let outcome: string | undefined
        await act(async () => { outcome = await result.current.share() })
        expect(outcome).toBe('cancelled')
        expect(writeText).not.toHaveBeenCalled()
    })
})
