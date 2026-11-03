import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export function WhyThisBlog() {
    return (
        <div>
            <p className="section-label">Why this blog exists</p>
            <p className="mb-3.5 mt-2.5 font-sans text-sm leading-[1.65] text-soft">
                Built instead of publishing on Hashnode to experiment with TanStack Start and keep long-form writing
                separate from my portfolio.
            </p>
            <Link to="/about" className="group inline-flex items-center gap-2.5 text-[14.5px] text-ink">
                About this site
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[3px]" strokeWidth={1.4} aria-hidden />
            </Link>
        </div>
    )
}
