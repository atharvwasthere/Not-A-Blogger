import {
    Link,
    useRouter,
} from '@tanstack/react-router'
import { MainLayout } from '../layout/MainLayout'
import { RotateCcw } from 'lucide-react'

export function DefaultCatchBoundary({ error }: { error: Error }) {
    const router = useRouter()

    console.error("Route Error:", error)

    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-6 text-center animate-in fade-in duration-700">
                <div className="space-y-2">
                    <h1 className="font-serif text-4xl text-ink">Something went wrong</h1>
                    <p className="font-mono text-xs text-danger uppercase tracking-wider bg-wash px-3 py-1 rounded-full inline-block">
                        Runtime Error
                    </p>
                </div>

                <div className="bg-wash border border-rule p-6 rounded-lg max-w-2xl w-full text-left overflow-auto max-h-[300px]">
                    <pre className="text-xs text-body font-mono whitespace-pre-wrap break-all">
                        {error.message || JSON.stringify(error, null, 2)}
                    </pre>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            router.invalidate()
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-card border border-rule text-ink hover:bg-wash transition-colors text-sm font-mono uppercase tracking-wider"
                    >
                        <RotateCcw size={14} />
                        Try Again
                    </button>

                    <Link
                        to="/"
                        className="px-6 py-2 bg-ink text-paper hover:bg-ink/90 transition-colors text-sm font-mono uppercase tracking-wider"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </MainLayout>
    )
}
