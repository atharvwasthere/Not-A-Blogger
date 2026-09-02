import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { api } from '@/lib/api'

export const Route = createFileRoute('/unsubscribe/$id')({
    component: UnsubscribeById,
})

type Status = 'idle' | 'loading' | 'done' | 'error'

// Unsubscribing happens on click, never in a loader: loaders run server-side on the
// initial request, so mail scanners and link prefetchers that GET the URL from the
// email footer would unsubscribe people who never opened it.
function UnsubscribeById() {
    const { id } = Route.useParams()
    const [status, setStatus] = useState<Status>('idle')

    const confirm = async () => {
        setStatus('loading')
        try {
            await api.unsubscribeById(id)
            setStatus('done')
        } catch {
            setStatus('error')
        }
    }

    return (
        <MainLayout showSidebar={false}>
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center text-center space-y-8 animate-intro-frame">
                {status === 'idle' && (
                    <>
                        <h1 className="font-serif text-5xl text-foreground tracking-tight">
                            Leaving?
                        </h1>
                        <div className="space-y-6">
                            <p className="text-zinc-500 text-lg leading-relaxed">
                                Confirm and you'll stop receiving Not a Blogger.
                            </p>
                            <button
                                onClick={confirm}
                                className="font-mono text-sm border border-zinc-300 px-6 py-3 text-foreground hover:border-zinc-900 transition-colors"
                            >
                                Unsubscribe
                            </button>
                            <p className="text-zinc-400 text-sm">
                                Changed your mind?{' '}
                                <Link
                                    to="/"
                                    className="text-foreground underline underline-offset-4 hover:text-zinc-600 transition-colors"
                                >
                                    Keep reading
                                </Link>
                                .
                            </p>
                        </div>
                    </>
                )}

                {status === 'loading' && (
                    <>
                        <h1 className="font-serif text-5xl text-foreground tracking-tight animate-pulse underline underline-offset-8">
                            Unsubscribing...
                        </h1>
                        <p className="text-zinc-500 text-lg">One second.</p>
                    </>
                )}

                {status === 'done' && (
                    <>
                        <h1 className="font-serif text-6xl text-foreground tracking-tight italic">
                            Farewell.
                        </h1>
                        <div className="space-y-4">
                            <p className="text-zinc-500 text-lg">
                                You have been unsubscribed. No more notes, no more systems.
                            </p>
                            <p className="text-zinc-400">
                                Changed your mind?{' '}
                                <Link
                                    to="/"
                                    className="text-foreground underline underline-offset-4 hover:text-zinc-600 transition-colors"
                                >
                                    Resubscribe
                                </Link>{' '}
                                on the homepage.
                            </p>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1 className="font-serif text-5xl text-foreground tracking-tight">
                            Something went wrong.
                        </h1>
                        <div className="space-y-4">
                            <p className="text-zinc-500 text-lg leading-relaxed">
                                We couldn't find that subscription ID.
                            </p>
                            <p className="text-zinc-400">
                                Try unsubscribing manually{' '}
                                <Link
                                    to="/unsubscribe"
                                    className="text-foreground underline underline-offset-4 hover:text-zinc-600 transition-colors"
                                >
                                    here
                                </Link>
                                .
                            </p>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    )
}
