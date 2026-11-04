import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

/** The one secondary CTA in the rail, in the label colour so it reads as a link next to the author's name. */
export function AboutLink() {
    return (
        <Link to="/about" className="group inline-flex items-center gap-2 self-start text-[13.5px] font-medium text-label">
            About this site
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[3px]" strokeWidth={1.5} aria-hidden />
        </Link>
    )
}
