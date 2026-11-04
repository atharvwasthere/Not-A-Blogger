import { cn } from '@/lib/utils'

/**
 * A halftone cover. The file is a transparency mask, so the dots are painted in the page's ink
 * colour (see `.print` in styles.css) and the same file works in light and dark.
 */
export function Print({
    src,
    tint,
    ratio,
    className,
}: {
    src: string
    /** A CSS colour value or variable reference for the paper behind the dots. */
    tint?: string
    /** e.g. "16/10"; omit to size from the container. */
    ratio?: string
    className?: string
}) {
    return (
        <span
            aria-hidden
            className={cn('print block', className)}
            style={
                {
                    '--print-src': `url("${src.replace(/["\\]/g, '\\$&')}")`,
                    ...(tint ? { '--print-tint': tint } : {}),
                    ...(ratio ? { aspectRatio: ratio } : {}),
                } as React.CSSProperties
            }
        />
    )
}
