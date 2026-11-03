import { useEffect, type RefObject } from 'react'
import { copyText } from './useShare'

const CHEVRON =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>'

interface Parts {
    toggle: HTMLButtonElement
    list: HTMLOListElement
}

/**
 * Turns the saved references block (a heading and a list, readable without JavaScript) into a
 * collapsible section. Idempotent: the DOM is built once, listeners are bound per effect run.
 */
function enhance(section: HTMLElement): Parts | null {
    const existing = section.querySelector<HTMLButtonElement>(':scope > .references-toggle')
    const list = section.querySelector<HTMLOListElement>('ol')
    if (!list) return null
    if (existing) return { toggle: existing, list }

    const bodyId = 'references-list'
    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'references-toggle'
    toggle.setAttribute('aria-controls', bodyId)
    toggle.innerHTML = `<span>References</span>${CHEVRON}`
    section.querySelector(':scope > h2')?.replaceWith(toggle)
    if (!toggle.isConnected) section.prepend(toggle)

    const body = document.createElement('div')
    body.className = 'references-body'
    body.id = bodyId
    const inner = document.createElement('div')
    inner.className = 'references-inner'
    list.replaceWith(body)
    inner.appendChild(list)
    body.appendChild(inner)

    // Package install lines get a prompt and a copy button.
    list.querySelectorAll<HTMLElement>('li > code[data-install]').forEach((code) => {
        const line = document.createElement('div')
        line.className = 'references-install'
        const prompt = document.createElement('span')
        prompt.className = 'references-prompt'
        prompt.setAttribute('aria-hidden', 'true')
        prompt.textContent = '$'
        const copy = document.createElement('button')
        copy.type = 'button'
        copy.dataset.copyInstall = code.textContent ?? ''
        copy.setAttribute('aria-label', `Copy ${code.textContent ?? ''}`)
        copy.textContent = 'copy'
        code.replaceWith(line)
        line.append(prompt, code, copy)
    })

    section.classList.add('is-enhanced')
    return { toggle, list }
}

export function useReferences(root: RefObject<HTMLElement | null>, content: string) {
    useEffect(() => {
        const section = root.current?.querySelector<HTMLElement>('section[data-references]')
        if (!section) return
        const parts = enhance(section)
        if (!parts) return

        const setOpen = (open: boolean) => {
            section.toggleAttribute('data-open', open)
            parts.toggle.setAttribute('aria-expanded', String(open))
            // Closed links must not be reachable by Tab.
            parts.list.inert = !open
        }
        setOpen(section.hasAttribute('data-open'))

        const timers = new Set<ReturnType<typeof setTimeout>>()
        const onClick = async (event: MouseEvent) => {
            const target = event.target as Element
            if (target.closest('.references-toggle')) {
                setOpen(!section.hasAttribute('data-open'))
                return
            }
            const copy = target.closest<HTMLButtonElement>('button[data-copy-install]')
            if (copy) {
                const ok = await copyText(copy.dataset.copyInstall ?? '')
                copy.textContent = ok ? 'copied' : 'copy'
                const timer = setTimeout(() => {
                    copy.textContent = 'copy'
                    timers.delete(timer)
                }, 1400)
                timers.add(timer)
            }
        }
        section.addEventListener('click', onClick)
        return () => {
            section.removeEventListener('click', onClick)
            timers.forEach(clearTimeout)
        }
    }, [root, content])
}
