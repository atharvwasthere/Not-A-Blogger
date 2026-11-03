import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/theme/useTheme'

/** Sun in dark, moon in light. Both are rendered and CSS picks one, so nothing swaps after hydration. */
export function ThemeToggle() {
    const { toggle } = useTheme()
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark theme"
            className="grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-wash"
        >
            <Moon className="h-5 w-5 dark:hidden" strokeWidth={1.4} aria-hidden />
            <Sun className="hidden h-5 w-5 dark:block" strokeWidth={1.4} aria-hidden />
        </button>
    )
}
