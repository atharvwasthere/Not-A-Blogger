import * as React from 'react'
import { cn } from '@/lib/utils'
import { IdentityRail } from './IdentityRail'
import { PhoneHeader } from './PhoneHeader'
import { SiteNav } from './SiteNav'

interface MainLayoutProps {
    children: React.ReactNode
    /** `browse`: identity rail + nav (home, notes, topics). `read`: nav with the wordmark, single column. */
    variant?: 'browse' | 'read'
    className?: string
}

export function MainLayout({ children, variant = 'read', className }: MainLayoutProps) {
    const browse = variant === 'browse'

    return (
        <div
            className={cn(
                'min-h-screen bg-paper text-body',
                browse && 'md:grid md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]',
                className,
            )}
        >
            {browse && <IdentityRail />}
            <div className="min-w-0">
                <PhoneHeader />
                <SiteNav showWordmark={!browse} />
                <main>{children}</main>
            </div>
        </div>
    )
}
