import * as React from "react";
import { IdentitySidebar } from "./IdentitySidebar";
import { Link } from "@tanstack/react-router";
interface MainLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = false }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
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
                        Written by <span itemProp="author">Atharv Singh</span>.
                    </footer>
                )}
            </main>
        </div>
    );
}
