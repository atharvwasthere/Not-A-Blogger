import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface BlogItemProps {
    title: string;
    date: string;
    description: string;
    slug: string;
    readingTime: number;
}

export function BlogItem({ title, date, description, slug, readingTime }: BlogItemProps) {
    return (
        <Link
            to="/blog/$slug"
            params={{ slug: slug }}
            className="group block border-b border-border py-12 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        >
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-8 items-start">
                {/* Icon Column */}
                <div className="hidden md:block">
                    <img
                        src="/debugger.3b2d6247.png.svg"
                        alt=""
                        className="w-16 h-16 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                </div>

                {/* Content Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
                    <div className="space-y-2">
                        <h2 className="font-serif text-3xl text-foreground font-normal group-hover:underline decoration-1 underline-offset-4 decoration-muted-foreground">
                            {title}
                        </h2>
                        <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span>{date}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                            <span>{readingTime || 1} min read</span>
                        </div>
                    </div>

                    <p className="font-mono text-sm leading-relaxed text-muted-foreground max-w-lg">
                        {description}
                    </p>
                </div>

                {/* Arrow Column */}
                <div className="hidden md:flex items-center justify-end h-full pt-2">
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
            </div>
        </Link>
    );
}
