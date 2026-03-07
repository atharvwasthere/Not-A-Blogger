import { Link } from "@tanstack/react-router";

export function CtaBanner() {
    return (
        <Link to="/about" className="block max-w-5xl mx-auto px-6 mb-12 lg:mb-16 mt-8 md:mt-12 group">
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-6 gap-4 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 font-serif">
                <div className="space-y-1">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs tracking-widest uppercase font-mono mb-1">NOTE</p>
                    <span className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-100">Why does this blog exist?</span>
                    <p className="text-zinc-500 md:text-md mt-2 max-w-2xl font-sans">
                        I built this instead of publishing on Hashnode to experiment with TanStack Start and keep long-form engineering writing separate from my portfolio.
                    </p>
                </div>

                <div className="flex items-center text-zinc-900 dark:text-zinc-100 font-sans mt-2 md:mt-0 text-sm md:text-base group-hover:underline decoration-1 underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700">
                    About this site <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </Link>
    );
}
