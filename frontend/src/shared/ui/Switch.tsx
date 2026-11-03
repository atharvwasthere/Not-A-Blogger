import { cn } from '@/lib/utils'

/** An on/off switch. `label` is its accessible name; render visible text next to it yourself. */
export function Switch({
    checked,
    onChange,
    label,
    disabled,
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50',
                checked ? 'border-ink bg-ink' : 'border-rule bg-wash',
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 rounded-full transition-transform',
                    checked ? 'translate-x-[22px] bg-paper' : 'translate-x-[3px] bg-soft',
                )}
            />
        </button>
    )
}
