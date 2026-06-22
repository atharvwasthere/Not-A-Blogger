import { SubscribeForm } from "./SubscribeForm";
import { CircuitPulse } from "../components/CircuitPulse";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { api } from "@/lib/api";

function TopicsBlock() {
    // Reads the shared ['posts'] cache the homepage already populated — no extra fetch.
    const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: () => api.getPosts() });
    const activeTag = useSearch({ strict: false, select: (s: { tag?: string }) => s.tag });

    if (!posts?.length) return null;

    // Aggregate unique tags with counts, sorted by frequency then alphabetically.
    const counts = new Map<string, number>();
    for (const post of posts) {
        for (const tag of post.tags ?? []) {
            counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
    }
    const topics = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const seriesSlugs = [...new Set(posts.map(p => p.series).filter(Boolean) as string[])];

    if (topics.length === 0 && seriesSlugs.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Topics</h3>
            <div className="flex flex-wrap gap-2">
                {topics.map(([tag, count]) => {
                    const isActive = activeTag === tag;
                    return (
                        <Link
                            key={tag}
                            to="/"
                            search={isActive ? {} : { tag }}
                            className={`font-mono text-xs px-2 py-1 rounded-full border transition-colors ${isActive
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                                }`}
                        >
                            {tag} <span className="opacity-50">{count}</span>
                        </Link>
                    );
                })}
            </div>
            {seriesSlugs.map(slug => (
                <Link
                    key={slug}
                    to="/series/$slug"
                    params={{ slug }}
                    className="block font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Read the {slug} series →
                </Link>
            ))}
        </div>
    );
}

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
                                <span className="font-medium text-foreground inline-flex items-center gap-1.5 whitespace-nowrap">
                                    Atharv Singh
                                </span> (not a blogger).
                            </a>
                        </p>
                    </div>
                </div>

                <SubscribeForm />
                <TopicsBlock />
                <div className="md:hidden">
                    <CircuitPulse />
                </div>
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
                    Written by{' '}
                    <span itemProp="author" className="inline-flex items-center gap-1 whitespace-nowrap">
                        Atharv Singh
                    </span>.
                </footer>
            </div>
        </aside>
    );
}
