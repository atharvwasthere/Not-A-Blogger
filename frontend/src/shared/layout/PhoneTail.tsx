import { SubscribeForm } from './SubscribeForm'
import { WhyThisBlog } from './WhyThisBlog'
import { SocialLinks } from './SocialLinks'
import { SiteCredit } from './SiteCredit'

/** What the rail carries, placed after the posts on the phone home page so a post comes first. */
export function PhoneTail() {
    return (
        <div className="flex flex-col gap-[26px] border-t border-rule px-5 pb-9 pt-[30px] md:hidden">
            <WhyThisBlog />
            <SubscribeForm />
            <SocialLinks />
            <SiteCredit />
        </div>
    )
}
