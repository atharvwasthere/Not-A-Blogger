import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const TABS = [
    { to: '/', label: 'Notes', match: (path: string) => path === '/' || path.startsWith('/notes') },
] as const

export function NavTabs() {
    const pathname = useRouterState({ select: s => s.location.pathname })

    return (
        <div className="flex h-full gap-[26px] md:gap-10">
            {TABS.map(tab => {
                const active = tab.match(pathname)
                return (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'relative flex items-center text-[15px] transition-colors hover:text-ink md:text-base',
                            active
                                ? 'font-medium text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink'
                                : 'text-soft',
                        )}
                    >
                        {tab.label}
                    </Link>
                )
            })}
        </div>
    )
}
