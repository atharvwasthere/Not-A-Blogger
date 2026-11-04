import { PaintRoller } from 'lucide-react'
import { useTheme } from '@/theme/useTheme'

export function ThemeToggle() {
    const { toggle } = useTheme()
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark theme"
            className="grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-wash"
        >
            <PaintRoller className="h-5 w-5" strokeWidth={1.4} aria-hidden />
        </button>
    )
}
