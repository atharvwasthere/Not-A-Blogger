import { Link } from '@tanstack/react-router'
import { SubscribeForm } from './SubscribeForm'
import { WhyThisBlog } from './WhyThisBlog'
import { SocialLinks } from './SocialLinks'
import { SiteCredit } from './SiteCredit'

/** Left rail on browsing pages (≥ md). Sticky; scrolls on its own when taller than the viewport. */
export function IdentityRail() {
    return (
        <aside className="no-scrollbar hidden border-r border-rule md:sticky md:top-0 md:flex md:h-screen md:flex-col md:gap-7 md:overflow-y-auto md:px-7 md:pb-8 md:pt-11 xl:px-10 xl:pb-10 xl:pt-14">
            <div>
                <Link to="/" className="block font-title text-[48px] leading-[0.95] tracking-[-0.015em] text-ink xl:text-[58px]">
                    Not a Blogger.
                </Link>
                <p className="mt-[18px] max-w-[220px] font-sans text-[17px] leading-[1.55] text-ink">
                    I break systems so you don’t have to.
                </p>
            </div>
            <hr className="border-rule" />
            <WhyThisBlog />
            <hr className="border-rule" />
            <SubscribeForm />
            <SocialLinks />
            <div className="mt-auto">
                <SiteCredit />
            </div>
        </aside>
    )
}
