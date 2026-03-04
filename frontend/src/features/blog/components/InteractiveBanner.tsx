import { ArrowRight, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function InteractiveBanner() {
    return (
        <div className="relative border border-dashed border-border bg-background p-6 mb-12 group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
            {/* Corner markers to mimic the design */}
            <X className="absolute top-[-5px] left-[-5px] w-3 h-3 text-muted-foreground bg-background" />
            <X className="absolute top-[-5px] right-[-5px] w-3 h-3 text-muted-foreground bg-background" />
            <X className="absolute bottom-[-5px] left-[-5px] w-3 h-3 text-muted-foreground bg-background" />
            <X className="absolute bottom-[-5px] right-[-5px] w-3 h-3 text-muted-foreground bg-background" />

            <Link to="/" className="flex items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <span className="font-medium text-foreground text-sm md:text-base whitespace-nowrap">
                        Interactive SVG Animations
                    </span>
                    <span className="hidden md:inline text-muted-foreground/50">|</span>
                    <span className="text-muted-foreground text-sm md:text-base font-mono">
                        An interactive course on making whimsical SVGs and SVG animations.
                    </span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
