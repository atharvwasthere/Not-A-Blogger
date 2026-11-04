import { useEffect, useRef, type RefObject } from 'react'
import { api } from '@/lib/api'
import { useTheme } from '@/theme/useTheme'
import type { EmbedMode } from '@/theme/themeStore'

const EMBED_FRAMES = 'figure[data-embed-id] iframe'
const MAX_EMBED_HEIGHT = 2000

function postTheme(frame: HTMLIFrameElement, mode: EmbedMode) {
    // targetOrigin '*' is required — a sandboxed frame has an opaque origin and cannot be
    // addressed any other way. The payload is a theme name and carries nothing sensitive.
    frame.contentWindow?.postMessage({ v: 1, type: 'embed:theme', mode }, '*')
}

/** Points each visualiser frame at its document and runs the size/theme protocol with it. */
export function useEmbedFrames(root: RefObject<HTMLElement | null>, content: string) {
    const { embedMode } = useTheme()

    // Read by the message handler below, which must not be torn down on every theme change.
    const embedModeRef = useRef(embedMode)
    useEffect(() => {
        embedModeRef.current = embedMode
    }, [embedMode])

    // The src is set here rather than stored in post HTML so content carries no API domain.
    useEffect(() => {
        const article = root.current
        if (!article) return

        const frames = Array.from(article.querySelectorAll<HTMLIFrameElement>(EMBED_FRAMES))
        if (frames.length === 0) return

        for (const frame of frames) {
            const embedId = frame.closest('figure')?.getAttribute('data-embed-id')
            if (embedId && !frame.src) frame.src = api.embedSrc(embedId)
        }

        const onMessage = (event: MessageEvent) => {
            // Opaque origin means event.origin is always "null", so identify by source instead.
            const frame = frames.find(f => f.contentWindow === event.source)
            if (!frame || event.data?.v !== 1) return

            if (event.data.type === 'embed:ready') {
                postTheme(frame, embedModeRef.current)
            } else if (event.data.type === 'embed:size' && typeof event.data.height === 'number') {
                const height = Math.min(Math.max(event.data.height, 1), MAX_EMBED_HEIGHT)
                frame.style.height = `${height}px`
            }
        }

        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage)
    }, [root, content])

    // Push the new mode down instead of reloading the frame, which would reset its state.
    useEffect(() => {
        root.current
            ?.querySelectorAll<HTMLIFrameElement>(EMBED_FRAMES)
            .forEach(frame => postTheme(frame, embedMode))
    }, [root, embedMode])
}
