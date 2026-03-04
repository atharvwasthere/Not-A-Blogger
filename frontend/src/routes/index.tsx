import { createFileRoute } from '@tanstack/react-router'
import { BlogList } from '@/features/blog/components/BlogList'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AnimatePresence } from 'motion/react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Lazy load heavy admin components
const GlitchOverlay = lazy(() => import('@/features/admin/components/GlitchOverlay').then(module => ({ default: module.GlitchOverlay })))
const AdminLogin = lazy(() => import('@/features/admin/components/AdminLogin').then(module => ({ default: module.AdminLogin })))

const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => api.getPosts(),
})

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions),
  component: Home,
})

function Home() {
  const postsQuery = useSuspenseQuery(postsQueryOptions)
  const posts = postsQuery.data

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
