import { createFileRoute, Outlet, Link, useRouter } from '@tanstack/react-router'
import { ExternalLink, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { Unauthorized } from '@/components/Unauthorized'

export const Route = createFileRoute('/admin')({
    loader: async () => {
        try {
            return await api.getMe()
        } catch (error) {
            throw new Error('401')
        }
    },
    errorComponent: ({ error }) => {
        if (error.message === '401') {
            return <Unauthorized />
        }
        return <div>Something went wrong: {error.message}</div>
    },
    component: AdminLayout,
})

export function AdminLayout() {
    const router = useRouter()

    const handleLogout = async () => {
        await api.logout()
        router.navigate({ to: '/' })
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
            {/* Top Bar - Consistent across all admin pages */}
            <header className="h-14 border-b border-zinc-100 flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
                <div className="flex items-center gap-2">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="font-serif font-medium text-lg">Admin</span>
                        <span className="text-zinc-300">—</span>
                        <span className="text-zinc-400 text-sm font-mono">behind the scenes</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6 text-sm text-zinc-500">
                    <a href="/" target="_blank" className="hover:text-zinc-900 transition-colors flex items-center gap-1">
                        View site
                        <ExternalLink className="w-3 h-3" />
                    </a>
                    <button onClick={handleLogout} className="hover:text-zinc-900 transition-colors flex items-center gap-1">
                        Logout
                        <LogOut className="w-3 h-3" />
                    </button>
                </div>
            </header>

            <Outlet />
        </div>
    )
}
