/** A browse page's label and heading. `label` may be a link (the topic page's "TOPICS /"). */
export function PageHeading({ label, title }: { label: React.ReactNode; title: string }) {
    return (
        <div className="grid gap-2.5">
            <p className="section-label">{label}</p>
            <h1 className="text-[36px] font-normal leading-[1.05] text-ink md:text-[46px]">{title}</h1>
        </div>
    )
}
