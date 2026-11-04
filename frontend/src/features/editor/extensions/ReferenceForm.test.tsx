// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ReferenceForm } from './ReferenceForm'

afterEach(cleanup)

const field = (name: RegExp) => screen.getByLabelText(name) as HTMLInputElement | HTMLSelectElement

describe('ReferenceForm', () => {
    it('fills kind, source and install from a pasted URL', () => {
        render(<ReferenceForm onSave={vi.fn()} onCancel={vi.fn()} />)
        fireEvent.change(field(/url/i), { target: { value: 'https://www.npmjs.com/package/archiver' } })
        expect(field(/kind/i).value).toBe('package')
        expect(field(/source/i).value).toBe('npm package')
        expect(field(/install/i).value).toBe('npm i archiver')
    })

    it('keeps a hand-written source and kind when the URL is edited', () => {
        render(
            <ReferenceForm
                initial={{ kind: 'paper', url: 'https://dev.to/a', title: 'T', source: 'dev.to · AWS Builders', note: 'n' }}
                onSave={vi.fn()}
                onCancel={vi.fn()}
            />,
        )
        fireEvent.change(field(/url/i), { target: { value: 'https://dev.to/ab' } })
        expect(field(/source/i).value).toBe('dev.to · AWS Builders')
        expect(field(/kind/i).value).toBe('paper')
    })
})
