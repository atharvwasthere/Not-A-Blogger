import { SubscribeForm } from "./SubscribeForm";
import { CircuitPulse } from "../components/CircuitPulse";


export function IdentitySidebar() {
    return (
        <aside className="static w-full min-h-screen px-6 py-12 md:fixed md:top-0 md:h-screen md:w-[400px] md:px-12 md:py-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border bg-background z-10 transition-colors overflow-y-auto no-scrollbar">
            <div className="space-y-8">
                <div className="space-y-4">
                    <h1 className="font-serif text-5xl md:text-6xl text-foreground leading-[0.9] tracking-tight">
                        Not a<br />
                        Blogger
                    </h1>
                    <h2 className="sr-only">Atharv Singh — Backend Systems & Deliberate Engineering</h2>
                    <div className="space-y-4 max-w-xs">
                        <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed">
                            I break systems so you don’t have to.<br />
                            <span className="text-xs text-muted-foreground/80 mt-2 block">
                                Notes on backend, systems, and things I build when I’m bored of tutorials.
                            </span>
                        </p>
                        <p className="font-sans text-xs md:text-sm text-muted-foreground">
                            Written by <br />
                            <a
                                href="https://atharvsingh.me/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Portfolio"
                                className="font-medium text-foreground hover:pointer"
                            >
                                <span className="font-medium text-foreground">Atharv Singh</span> (not a blogger).
                            </a>
                        </p>
                    </div>
                </div>

                <SubscribeForm />
                <CircuitPulse />
            </div>

            <div className="mt-8 flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                    <a href="https://github.com/atharvwasthere" target="_blank" rel="noopener noreferrer" aria-label="Github" className="opacity-70 hover:opacity-100 transition-opacity">
                        <img src="/github.ico" alt="Github" className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com/atharvwasthere" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="opacity-70 hover:opacity-100 transition-opacity">
                        <img src="/twitter.ico" alt="Twitter" className="w-5 h-5" />
                    </a>
                    <a href="https://linkedin.com/in/atharvwasthere" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="opacity-70 hover:opacity-100 transition-opacity">
                        <img src="/linkedin.ico" alt="LinkedIn" className="w-5 h-5" />
                    </a>
                </div>
                <footer className="text-[10px] md:text-xs text-muted-foreground font-mono leading-tight">
                    © {new Date().getFullYear()} Not a Blogger.<br />
                    Written by <span itemProp="author">Atharv Singh</span>.
                </footer>
            </div>
        </aside>
    );
}
