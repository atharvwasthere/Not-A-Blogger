import { Link } from '@tanstack/react-router'
import { SearchButton } from './SearchButton'
import { ThemeToggle } from './ThemeToggle'

export function PhoneHeader() {
    return (
        <header className="flex items-center justify-between border-b border-rule px-5 pb-3.5 pt-[18px] md:hidden">
            <Link to="/" className="font-title text-[25px] text-ink">
                Not a Blogger.
            </Link>
            <div className="flex gap-1">
                <SearchButton compact />
                <ThemeToggle />
            </div>
        </header>
    )
}
