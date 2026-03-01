import { Link } from '@tanstack/react-router'
import { MainLayout } from './layout/MainLayout'

export function NotFound() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 text-center animate-in fade-in duration-700">
                <div className="space-y-2">
                    <h1 className="font-serif text-9xl text-zinc-100 font-bold select-none p-4">404</h1>
                    <h2 className="font-serif text-3xl text-zinc-900">Page not found</h2>
                </div>


                <p className="text-red-500 font-mono text-sm max-w-md">
                    The path you are looking for does not exist. It might have been moved or deleted.
                </p>

                <Link
                    to="/"
                    className="px-6 py-2 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors text-sm font-mono uppercase tracking-wider"
                >
                    Return Home
                </Link>
            </div>
        </MainLayout>
    )
}
