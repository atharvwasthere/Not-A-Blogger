import { formatPostDate } from '../formatDate'

/** "Sep 1, 2026 · 17 min read", the dot drawn as decoration. */
export function PostMeta({ date, readingTime, className }: { date: string; readingTime: number; className?: string }) {
    return (
        <span className={className}>
            {formatPostDate(date)}
            <span aria-hidden className="mx-2.5 inline-block h-[3px] w-[3px] rounded-full bg-faint align-middle" />
            {readingTime || 1} min read
        </span>
    )
}
