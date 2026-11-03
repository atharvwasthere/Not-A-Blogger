import { useEffect, type RefObject } from 'react'

/** Highlights `pre code` blocks once the post HTML is in the DOM. Loads hljs core + a few languages (~50KB). */
export function useCodeHighlighting(root: RefObject<HTMLElement | null>, content: string) {
    useEffect(() => {
        if (!root.current) return
        let isActive = true
        import('highlight.js/lib/core').then(async ({ default: hljs }) => {
            if (!isActive) return
            const [js, ts, bash, python, json, css, xml] = await Promise.all([
                import('highlight.js/lib/languages/javascript'),
                import('highlight.js/lib/languages/typescript'),
                import('highlight.js/lib/languages/bash'),
                import('highlight.js/lib/languages/python'),
                import('highlight.js/lib/languages/json'),
                import('highlight.js/lib/languages/css'),
                import('highlight.js/lib/languages/xml'),
            ])
            if (!isActive) return
            hljs.registerLanguage('javascript', js.default)
            hljs.registerLanguage('typescript', ts.default)
            hljs.registerLanguage('bash', bash.default)
            hljs.registerLanguage('python', python.default)
            hljs.registerLanguage('json', json.default)
            hljs.registerLanguage('css', css.default)
            hljs.registerLanguage('xml', xml.default)

            root.current?.querySelectorAll('pre code').forEach((block) => {
                block.removeAttribute('data-highlighted')
                hljs.highlightElement(block as HTMLElement)
            })
        }).catch(err => console.error("Failed to load syntax highlighter:", err))

        return () => { isActive = false }
    }, [root, content])
}
