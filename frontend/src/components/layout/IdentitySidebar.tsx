import { Github, Twitter } from "lucide-react";
import { SubscribeForm } from "../SubscribeForm";

export function IdentitySidebar() {
    return (
        <aside className="static w-full px-6 py-12 md:fixed md:top-0 md:h-screen md:w-[400px] md:px-12 md:py-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border bg-background z-10 transition-colors">
            <div className="space-y-12">
                <div className="space-y-6">
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
            </div>

            <div className="mt-12 md:mt-0 flex items-center justify-between">
                <div className="flex gap-4 text-muted-foreground">
                    <a href="https://github.com/atharvsingh" target="_blank" rel="noopener noreferrer" aria-label="Github" className="hover:text-foreground transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com/atharvsingh" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-foreground transition-colors">
                        <Twitter className="w-5 h-5" />
                    </a>
                </div>
                <footer className="text-xs text-muted-foreground font-mono">
                    © {new Date().getFullYear()} Not a Blogger.<br />
                    Written by <span itemProp="author">Atharv Singh</span>.
                </footer>
            </div>
        </aside>
    );
}
