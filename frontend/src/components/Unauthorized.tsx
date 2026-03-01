import { Link } from '@tanstack/react-router'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export function Unauthorized() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <h1 className="font-serif text-9xl text-zinc-100 font-bold select-none p-4">401</h1>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-medium text-zinc-900 italic">Restricted Access</h1>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        This area is reserved for the author. Please authenticate or return to safety.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Link
                        to="/"
                        className="w-full h-11 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                <div className="pt-8 border-t border-zinc-50">
                    <p className="text-[10px] text-red-500 uppercase tracking-widest font-mono">
                        Error 401: Unauthorized
                    </p>
                </div>
            </div>
        </div>
    )
}
