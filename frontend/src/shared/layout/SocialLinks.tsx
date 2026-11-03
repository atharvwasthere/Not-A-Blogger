const LINKS = [
    {
        href: 'https://github.com/atharvwasthere',
        label: 'GitHub',
        icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
        ),
    },
    {
        href: 'https://twitter.com/atharvwasthere',
        label: 'X',
        icon: (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M3.5 3h3.8l9.2 14h-3.8z" />
                <path d="M16.5 3l-5.7 6.4M3.5 17l5.6-6.3" />
            </svg>
        ),
    },
    {
        href: 'https://linkedin.com/in/atharvwasthere',
        label: 'LinkedIn',
        icon: (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" />
                <path d="M6.5 8.5v5M6.5 6v.01M9.5 13.5v-5M9.5 10.5c0-1.2.9-2 2-2s2 .8 2 2v3" />
            </svg>
        ),
    },
]

export function SocialLinks() {
    return (
        <div className="flex gap-[22px] text-ink">
            {LINKS.map(link => (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="opacity-80 transition-opacity hover:opacity-100 [&_svg]:h-[22px] [&_svg]:w-[22px]"
                >
                    {link.icon}
                </a>
            ))}
        </div>
    )
}
