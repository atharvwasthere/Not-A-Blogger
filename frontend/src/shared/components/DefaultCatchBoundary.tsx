import {
    Link,
    useRouter,
} from '@tanstack/react-router'
import { MainLayout } from './layout/MainLayout'
import { RotateCcw } from 'lucide-react'

export function DefaultCatchBoundary({ error }: { error: Error }) {
    const router = useRouter()

    console.error("Route Error:", error)

    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 text-center animate-in fade-in duration-700">
                <div className="space-y-2">
                    <h1 className="font-serif text-4xl text-zinc-900">Something went wrong</h1>
                    <p className="font-mono text-xs text-red-500 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full inline-block">
                        Runtime Error
                    </p>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-lg max-w-2xl w-full text-left overflow-auto max-h-[300px]">
                    <pre className="text-xs text-zinc-600 font-mono whitespace-pre-wrap break-all">
                        {error.message || JSON.stringify(error, null, 2)}
                    </pre>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            router.invalidate()
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors text-sm font-mono uppercase tracking-wider"
                    >
                        <RotateCcw size={14} />
                        Try Again
                    </button>

                    <Link
                        to="/"
                        className="px-6 py-2 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors text-sm font-mono uppercase tracking-wider"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </MainLayout>
    )
}
