export function SiteCredit() {
    return (
        <footer className="font-mono text-xs leading-[1.7] text-soft">
            © {new Date().getFullYear()} Not a Blogger.
            <br />
            Built by <span itemProp="author">Atharv Singh</span>.
        </footer>
    )
}
