import { createFileRoute, Link } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/MainLayout'
import { api } from '@/lib/api'

export const Route = createFileRoute('/unsubscribe/$id')({
    loader: async ({ params }) => {
        await api.unsubscribeById(params.id)
    },
    errorComponent: () => (
        <MainLayout showSidebar={false}>
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center text-center space-y-8 animate-intro-frame">
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
            </div>
        </MainLayout>
    ),
    pendingComponent: () => (
        <MainLayout showSidebar={false}>
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center text-center space-y-8 animate-intro-frame">
                <h1 className="font-serif text-5xl text-foreground tracking-tight animate-pulse underline underline-offset-8">
                    Unsubscribing...
                </h1>
                <p className="text-zinc-500 text-lg">One second.</p>
            </div>
        </MainLayout>
    ),
    component: UnsubscribeById,
})

function UnsubscribeById() {
    return (
        <MainLayout showSidebar={false}>
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center text-center space-y-8 animate-intro-frame">
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
            </div>
        </MainLayout>
    )
}
