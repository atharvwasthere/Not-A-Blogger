import { Link } from '@tanstack/react-router'
import { MainLayout } from '@/shared/layout/MainLayout'

export function NotFound() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 text-center animate-in fade-in duration-700">
                <div className="space-y-2">
                    <h1 className="font-serif text-9xl text-rule font-bold select-none p-4">404</h1>
                    <h2 className="font-serif text-3xl text-ink">Page not found</h2>
                </div>


                <p className="text-soft font-mono text-sm max-w-md">
                    The path you are looking for does not exist. It might have been moved or deleted.
                </p>

                <Link
                    to="/"
                    className="px-6 py-2 bg-ink text-paper hover:bg-ink/90 transition-colors text-sm font-mono uppercase tracking-wider"
                >
                    Return Home
                </Link>
            </div>
        </MainLayout>
    )
}
