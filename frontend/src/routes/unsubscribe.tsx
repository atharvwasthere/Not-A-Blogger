import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

export const Route = createFileRoute('/unsubscribe')({
    component: UnsubscribeManual,
})

function UnsubscribeManual() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDone, setIsDone] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            await api.unsubscribeByEmail(email)
            setIsDone(true)
            toast.success('You have been unsubscribed.')
        } catch (error: any) {
            toast.error('Failed to unsubscribe. Please check the email address.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isDone) {
        return (
            <MainLayout variant="read">
                <div className="max-w-xl mx-auto px-6 py-32 flex flex-col items-center text-center space-y-8 animate-intro-frame">
                    <h1 className="font-serif text-6xl text-foreground tracking-tight italic">
                        Farewell.
                    </h1>
                    <div className="space-y-4">
                        <p className="text-soft text-lg">
                            You won't receive any more notes on systems and backend from me.
                        </p>
                        <p className="text-soft">
                            Changed your mind? <Link to="/" className="text-foreground underline underline-offset-4 hover:text-body transition-colors">Resubscribe</Link> on the homepage.
                        </p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout variant="read">
            <div className="max-w-xl mx-auto px-6 py-32 flex flex-col space-y-12 animate-intro-frame">
                <div className="space-y-4">
                    <h1 className="font-serif text-5xl text-foreground tracking-tight">
                        Unsubscribe
                    </h1>
                    <p className="text-soft text-lg leading-relaxed">
                        Enter your email address below to stop receiving the "Not a Blogger" newsletter.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="w-full px-4 py-3 text-lg bg-transparent border-b border-rule focus:border-foreground focus:outline-none transition-colors placeholder:text-faint"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-6 py-4 bg-foreground text-background font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Processing...' : 'Unsubscribe'}
                    </button>
                </form>

                <Link to="/" className="text-sm font-mono text-soft hover:text-foreground transition-colors">
                    ← Back to home
                </Link>
            </div>
        </MainLayout>
    )
}
