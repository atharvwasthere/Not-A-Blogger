import { createFileRoute, Link } from '@tanstack/react-router'
import { BlogList } from '@/features/blog/components/BlogList'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AnimatePresence } from 'motion/react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CtaBanner } from '@/shared/components/ui/CtaBanner'

// Lazy load heavy admin components
const GlitchOverlay = lazy(() => import('@/features/admin/components/GlitchOverlay').then(module => ({ default: module.GlitchOverlay })))
const AdminLogin = lazy(() => import('@/features/admin/components/AdminLogin').then(module => ({ default: module.AdminLogin })))

const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => api.getPosts(),
})

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { tag?: string } => {
    const tag = typeof search.tag === 'string' && search.tag.trim() ? search.tag : undefined
    return tag ? { tag } : {}
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions),
  component: Home,
})

function Home() {
  const postsQuery = useSuspenseQuery(postsQueryOptions)
  const { tag } = Route.useSearch()
  const posts = tag
    ? postsQuery.data.filter((p) => p.tags?.includes(tag))
    : postsQuery.data

  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    let buffer = ""
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add char to buffer (keep last 5)
      if (e.key.length === 1) {
        buffer = (buffer + e.key).slice(-5)
        if (buffer === "admin") {
          setIsAdminMode(true)
          // Wait for glitch animation before showing login
          setTimeout(() => setShowLogin(true), 300)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <MainLayout showSidebar={true}>
      <CtaBanner />
      {tag && (
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <Link
            to="/"
            search={{}}
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition-colors"
          >
            Filtered by <span className="text-foreground">#{tag}</span>
            <span aria-hidden>✕</span>
          </Link>
        </div>
      )}
      <BlogList posts={posts} />

      <AnimatePresence>
        {isAdminMode && (
          <Suspense fallback={null}>
            <GlitchOverlay />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <Suspense fallback={null}>
            <AdminLogin />
          </Suspense>
        )}
      </AnimatePresence>
    </MainLayout>
  )
}
