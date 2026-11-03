import { Link } from '@tanstack/react-router'
import { NavTabs } from './NavTabs'
import { SearchButton } from './SearchButton'
import { ThemeToggle } from './ThemeToggle'

/** Top nav on every page. On phones only the tabs show; PhoneHeader carries search and theme. */
export function SiteNav({ showWordmark }: { showWordmark: boolean }) {
    return (
        <nav aria-label="Site" className="flex h-[50px] items-center gap-5 border-b border-rule px-5 md:h-[72px] md:px-11">
            {showWordmark && (
                <Link to="/" className="mr-[18px] hidden font-title text-2xl text-ink md:inline">
                    Not a Blogger.
                </Link>
            )}
            <NavTabs />
            <span className="flex-1" />
            <div className="hidden items-center gap-5 md:flex">
                <SearchButton />
                <ThemeToggle />
            </div>
        </nav>
    )
}
