import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AnimatePresence } from 'motion/react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { PhoneTail } from '@/shared/layout/PhoneTail'
import { postsQueryOptions, usePosts } from '@/features/blog/hooks/usePosts'
import { LatestNote } from '@/features/blog/components/LatestNote'
import { NoteRow } from '@/features/blog/components/NoteRow'

// Lazy load heavy admin components
const GlitchOverlay = lazy(() => import('@/features/admin/components/GlitchOverlay').then(module => ({ default: module.GlitchOverlay })))
const AdminLogin = lazy(() => import('@/features/admin/components/AdminLogin').then(module => ({ default: module.AdminLogin })))

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { tag?: string } => {
    const tag = typeof search.tag === 'string' && search.tag.trim() ? search.tag : undefined
    return tag ? { tag } : {}
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions),
  component: Home,
})

/** Types "admin" anywhere on the page to open the login. */
function useAdminEasterEgg() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    let buffer = ""
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable="true"]')) return
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

  return { isAdminMode, showLogin }
}

function Home() {
  const allPosts = usePosts()
  const { tag } = Route.useSearch()
  const posts = tag ? allPosts.filter((p) => p.tags?.includes(tag)) : allPosts
  const [latest, ...rest] = posts
  const { isAdminMode, showLogin } = useAdminEasterEgg()

  return (
    <MainLayout variant="browse">
      <div className="grid gap-10 px-5 pb-9 pt-[26px] md:gap-[52px] md:px-11 md:pb-16 md:pt-11">
        <h1 className="sr-only">Not a Blogger — Atharv Singh on backend systems and engineering</h1>
        {tag && (
          <Link
            to="/"
            search={{}}
            className="inline-flex items-center gap-2 justify-self-start rounded-full border border-rule px-3 py-1.5 font-mono text-xs text-soft transition-colors hover:text-ink"
          >
            Filtered by <span className="text-ink">#{tag}</span>
            <span aria-hidden>✕</span>
          </Link>
        )}
        {!latest && (
          <p className="font-serif text-xl italic text-soft">No posts yet.</p>
        )}
        {latest && <LatestNote post={latest} />}
        {rest.length > 0 && (
          <section aria-labelledby="recently-published" className="grid gap-[22px]">
            <p id="recently-published" className="section-label">Recently published</p>
            <ul className="grid grid-cols-1 gap-[22px] lg:grid-cols-2 lg:gap-x-12">
              {rest.map((post) => <NoteRow key={post.slug} post={post} />)}
            </ul>
          </section>
        )}
      </div>
      <PhoneTail />

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
