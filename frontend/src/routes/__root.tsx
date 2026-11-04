import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

import { NotFound } from '../shared/components/NotFound'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '../theme/ThemeProvider'
import { themeBootScript } from '../theme/themeStore'
import { CommandPaletteProvider } from '../shared/search/CommandPaletteProvider'
import { siteSettingsQueryOptions } from '../features/settings/useSiteSettings'
import type { SiteSettings } from '../lib/types'

import appCss from '../styles.css?url'
import { SITE_URL } from '@/lib/site'

// Lazy-load — keeps cmdk out of the initial bundle (consistent with PostEditor/GlitchOverlay).
const CommandPalette = lazy(() =>
  import('../shared/components/CommandPalette').then(m => ({ default: m.CommandPalette }))
)

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      // Primary SEO
      { title: 'Not a Blogger | Atharv Singh — Backend Systems & Engineering Notes' },
      { name: 'description', content: 'Atharv Singh writes about backend systems, debugging, architecture, and deliberate engineering. Not a Blogger is a technical blog focused on real-world software, system design, and building reliable backend systems.' },
      { name: 'author', content: 'Atharv Singh' },
      // Open Graph
      { property: 'og:title', content: 'Not a Blogger | Atharv Singh — Backend Systems & Engineering Notes' },
      { property: 'og:description', content: 'Backend systems, debugging, and deliberate engineering by Atharv Singh.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:site_name', content: 'Not a Blogger' },
      { property: 'og:image', content: 'https://images.atharvsingh.me/cta/NotABlogger.webp' },
      // Twitter Cards
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Not a Blogger | Atharv Singh — Backend Systems & Engineering Notes' },
      { name: 'twitter:description', content: 'Backend systems, debugging, and deliberate engineering by Atharv Singh.' },
      { name: 'twitter:site', content: '@atharvwasthere' },
      { name: 'twitter:creator', content: '@atharvwasthere' },
      { name: 'twitter:image', content: 'https://images.atharvsingh.me/cta/NotABlogger.webp' },
      { name: 'twitter:url', content: SITE_URL },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossOrigin: 'anonymous' },
      { rel: 'preload', href: 'https://cdn.jsdelivr.net/gh/atharvwasthere/fonts-cdn@v1.1.0/fonts/GeistSerif/GeistSerif-Variable.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/atharvwasthere/fonts-cdn@v1.1.0/fonts.css' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=JetBrains+Mono:wght@400;500&display=swap' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/quotation-marks-svgrepo-com.svg' },
      { rel: 'alternate', type: 'application/rss+xml', title: 'Not a Blogger', href: '/rss.xml' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Not a Blogger',
          url: SITE_URL,
          description: 'Backend systems and deliberate engineering notes by Atharv Singh.',
          author: {
            '@type': 'Person',
            name: 'Atharv Singh',
            url: SITE_URL,
            jobTitle: 'Backend Engineer',
            // Ties the author to their other profiles, so engines know who wrote the notes.
            sameAs: [
              'https://atharvsingh.me',
              'https://github.com/atharvwasthere',
              'https://linkedin.com/in/atharvwasthere',
              'https://twitter.com/atharvwasthere',
            ],
          },
        }),
      },
    ],
  }),

  // Site settings (covers on/off) before the first render, so covers never pop in.
  // A failed fetch must not take the site down: it only means no covers.
  loader: async ({ context: { queryClient } }): Promise<SiteSettings | null> => {
    try {
      return await queryClient.ensureQueryData(siteSettingsQueryOptions)
    } catch {
      return null
    }
  },

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext()

  return (
    // The head script sets the theme class before React hydrates, so <html> differs from the server render.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before any CSS paints: no light flash for a reader in dark. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CommandPaletteProvider>
              {children}
              <Toaster position="top-center" />
              <Suspense fallback={null}>
                <CommandPalette />
              </Suspense>
            </CommandPaletteProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
