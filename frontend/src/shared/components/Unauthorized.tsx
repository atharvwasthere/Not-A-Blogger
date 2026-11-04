import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function Unauthorized() {
    return (
        <div className="min-h-screen bg-card flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <h1 className="font-serif text-9xl text-rule font-bold select-none p-4">401</h1>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-medium text-ink italic">Restricted Access</h1>
                    <p className="text-soft text-sm leading-relaxed">
                        This area is reserved for the author. Please authenticate or return to safety.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Link
                        to="/"
                        className="w-full h-11 bg-ink text-paper text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors flex items-center justify-center"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="pt-8 border-t border-rule">
                    <p className="text-[10px] text-danger uppercase tracking-widest font-mono">
                        Error 401: Unauthorized
                    </p>
                </div>
            </div>
        </div>
    )
}
