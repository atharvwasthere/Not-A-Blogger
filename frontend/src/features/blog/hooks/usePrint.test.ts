// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrint } from './usePrint'

const settings = vi.hoisted(() => ({ current: undefined as undefined | { covers_enabled: boolean } }))
vi.mock('@/features/settings/useSiteSettings', () => ({
    useSiteSettings: () => ({ data: settings.current }),
}))

const PRINT = 'https://res.cloudinary.com/x/image/upload/prints/a.png'

describe('usePrint', () => {
    const cases: Array<[boolean, boolean, boolean, string | null]> = [
        // site on, post on, print exists -> cover
        [true, true, true, PRINT],
        [true, true, false, null],
        [true, false, true, null],
        [true, false, false, null],
        [false, true, true, null],
        [false, true, false, null],
        [false, false, true, null],
        [false, false, false, null],
    ]

    it.each(cases)('site %s × post %s × print %s', (site, post, hasPrint, expected) => {
        settings.current = { covers_enabled: site }
        const { result } = renderHook(() => usePrint({ show_print: post, print_url: hasPrint ? PRINT : null }))
        expect(result.current).toBe(expected)
    })

    it('shows no cover while settings are unknown', () => {
        settings.current = undefined
        const { result } = renderHook(() => usePrint({ show_print: true, print_url: PRINT }))
        expect(result.current).toBeNull()
    })
})
