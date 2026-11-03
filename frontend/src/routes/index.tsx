import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AnimatePresence } from 'motion/react'
import { MainLayout } from '@/shared/layout/MainLayout'
import { PhoneTail } from '@/shared/layout/PhoneTail'
import { BrowsePage } from '@/shared/layout/BrowsePage'
import { topicSlug } from '@/theme/topics'
import { postsQueryOptions, usePosts } from '@/features/blog/hooks/usePosts'
import { LatestNote } from '@/features/blog/components/LatestNote'
import { NoteRow } from '@/features/blog/components/NoteRow'

// Lazy load heavy admin components
const GlitchOverlay = lazy(() => import('@/features/admin/components/GlitchOverlay').then(module => ({ default: module.GlitchOverlay })))
const AdminLogin = lazy(() => import('@/features/admin/components/AdminLogin').then(module => ({ default: module.AdminLogin })))

export const Route = createFileRoute('/')({
  // Old topic links filtered this page in place (/?tag=x); topics have their own pages now.
  beforeLoad: ({ location }) => {
    const tag = (location.search as { tag?: unknown }).tag
    if (typeof tag === 'string' && topicSlug(tag)) {
      throw redirect({ to: '/topics/$topic', params: { topic: topicSlug(tag) }, statusCode: 301 })
    }
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
  const [latest, ...rest] = usePosts()
  const { isAdminMode, showLogin } = useAdminEasterEgg()

  return (
    <MainLayout variant="browse">
      <BrowsePage>
        <h1 className="sr-only">Not a Blogger — Atharv Singh on backend systems and engineering</h1>
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
            <Link to="/notes" className="group inline-flex items-center gap-2.5 justify-self-start text-[14.5px] text-ink">
              View all notes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[3px]" strokeWidth={1.4} aria-hidden />
            </Link>
          </section>
        )}
      </BrowsePage>
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
