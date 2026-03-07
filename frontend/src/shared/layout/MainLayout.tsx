import * as React from "react";
import { IdentitySidebar } from "./IdentitySidebar";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
interface MainLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    className?: string;
}

export function MainLayout({ children, showSidebar = false, className }: MainLayoutProps) {
    return (
        <div className={cn("min-h-screen bg-background", className)}>
            {showSidebar && <IdentitySidebar />}

            <main className={`min-h-screen w-full transition-all duration-300 ${showSidebar
                ? "md:ml-[400px] md:w-[calc(100%-400px)]"
                : "mx-auto w-full relative"
                }`}>
                {!showSidebar && (
                    <div className="absolute top-6 right-6 z-50 Print:hidden">
                        <Link to="/" className="text-sm font-mono text-zinc-400 hover:text-zinc-900 transition-colors">
                            ← Home
                        </Link>
                    </div>
                )}
                {children}
                {!showSidebar && (
                    <footer className="max-w-3xl mx-auto px-6 py-12 text-center text-sm text-zinc-400 font-mono border-t border-zinc-100 mt-24">
                        © {new Date().getFullYear()} Not a Blogger.<br />
                        Written by{' '}
                        <span itemProp="author" className="inline-flex items-center gap-1 whitespace-nowrap">
                            <img src="https://images.atharvsingh.me/cta/Atharv_logo.svg" alt="Atharv Singh" className="h-3 w-auto opacity-80 inline-block align-text-bottom" />
                            Atharv Singh
                        </span>.
                    </footer>
                )}
            </main>
        </div>
    );
}
