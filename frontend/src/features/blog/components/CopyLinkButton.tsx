import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Link2, Share } from 'lucide-react'
import { useShare } from '../hooks/useShare'

type Phase = 'idle' | 'sending' | 'done'

const FLY_SECONDS = 0.65
const HOLD_MS = 1500

/**
 * "Copy link" (or "Share" on phones). Same choreography as SubscribeForm: the label lifts out, the icon
 * flies off, a check pops in, then the label rises back. Fixed width, so the date line never shifts.
 */
export function CopyLinkButton({ url, title }: { url: string; title: string }) {
    const { mode, share } = useShare(url, title)
    const reduced = useReducedMotion()
    const [phase, setPhase] = useState<Phase>('idle')
    const [announcement, setAnnouncement] = useState('')
    const [flyFrom, setFlyFrom] = useState(0)
    const button = useRef<HTMLButtonElement>(null)
    const label = useRef<HTMLSpanElement>(null)

    const Icon = mode === 'share' ? Share : Link2
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, reduced ? 0 : ms))

    const onClick = async () => {
        if (phase !== 'idle') return
        // The icon starts where the label's icon sits (the label is right-aligned).
        setFlyFrom((button.current?.offsetWidth ?? 0) - (label.current?.offsetWidth ?? 0))
        setPhase('sending')
        const [result] = await Promise.all([share(), wait(FLY_SECONDS * 1000)])
        if (result === 'cancelled') {
            setPhase('idle')
            return
        }
        setAnnouncement(mode === 'share' ? 'Link shared' : 'Link copied')
        setPhase('done')
        await wait(HOLD_MS)
        setPhase('idle')
    }

    const t = (seconds: number) => ({ duration: reduced ? 0 : seconds })

    return (
        <button
            ref={button}
            type="button"
            onClick={onClick}
            className="relative inline-grid h-[26px] min-w-[92px] items-center justify-items-end font-sans text-[13.5px] text-soft transition-colors hover:text-ink"
            style={{ clipPath: 'inset(0 -240px 0 -240px)' }}
        >
            <AnimatePresence mode="wait" initial={false}>
                {phase === 'idle' && (
                    <motion.span
                        key="label"
                        ref={label}
                        className="col-start-1 row-start-1 inline-flex items-center gap-[7px] whitespace-nowrap"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={t(0.25)}
                    >
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
                        {mode === 'share' ? 'Share' : 'Copy link'}
                    </motion.span>
                )}
                {phase === 'done' && (
                    <motion.span
                        key="done"
                        className="col-start-1 row-start-1 inline-flex items-center gap-[7px] whitespace-nowrap text-ink"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 18 }}
                        aria-hidden
                    >
                        <Check className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                        {mode === 'share' ? 'Shared' : 'Copied'}
                    </motion.span>
                )}
            </AnimatePresence>

            {phase === 'sending' && !reduced && (
                <motion.span
                    className="pointer-events-none absolute top-1/2 -mt-[7px] text-ink"
                    style={{ left: flyFrom }}
                    initial={{ x: 0, scale: 1, opacity: 1 }}
                    animate={{ x: 70, scale: 0.5, opacity: 0 }}
                    transition={{ duration: FLY_SECONDS, ease: 'easeInOut' }}
                    aria-hidden
                >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                </motion.span>
            )}

            <span className="sr-only" aria-live="polite">{announcement}</span>
        </button>
    )
}
