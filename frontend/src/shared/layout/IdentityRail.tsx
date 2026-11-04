import { Link } from '@tanstack/react-router'
import { AboutLink } from './AboutLink'
import { SubscribeForm } from './SubscribeForm'
import { SocialLinks } from './SocialLinks'
import { SiteCredit } from './SiteCredit'

/** Left rail on browsing pages (≥ md): pinned at viewport height and never scrolls, so its spacing shrinks on short screens. */
export function IdentityRail() {
    return (
        <aside className="hidden border-r border-rule md:sticky md:top-0 md:flex md:h-screen md:flex-col md:gap-[clamp(16px,3.2vh,28px)] md:overflow-hidden md:px-7 md:pb-[clamp(16px,3vh,28px)] md:pt-[clamp(20px,4vh,36px)]">
            <div className="flex flex-col gap-[clamp(10px,1.8vh,16px)]">
                <Link to="/" className="block font-title text-[48px] leading-[0.9] tracking-[-0.025em] text-ink xl:text-[56px]">
                    Not a<br />
                    Blogger
                </Link>
                <div className="flex max-w-[280px] flex-col gap-2">
                    <p className="font-sans text-[15px] leading-[1.6] text-soft">I break systems so you don’t have to.</p>
                    <p className="font-sans text-[13px] leading-[1.6] text-mute">
                        Notes on backend, systems, and things I build when I’m bored of tutorials.
                    </p>
                </div>
                <p className="font-sans text-sm leading-[1.6] text-soft">
                    Written by
                    <br />
                    <a
                        href="https://atharvsingh.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        itemProp="author"
                        className="font-medium text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
                    >
                        Atharv Singh
                    </a>{' '}
                    (not a blogger).
                </p>
                <AboutLink />
            </div>
            <div className="border-t border-rule pt-[clamp(16px,2.6vh,24px)]">
                <SubscribeForm />
            </div>
            <div className="mt-auto flex flex-col gap-4">
                <SocialLinks />
                <SiteCredit />
            </div>
        </aside>
    )
}
