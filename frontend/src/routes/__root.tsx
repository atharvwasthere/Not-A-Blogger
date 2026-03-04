import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'motion/react'


import { getSessionIntroState } from '../lib/server-intro'

import { NotFound } from '../shared/components/NotFound'
import { NotABloggerIntro } from '../shared/components/NotABloggerIntro'
import { useSessionIntro } from '../shared/hooks/useSessionIntro'
import { Toaster } from 'react-hot-toast'

import appCss from '../styles.css?url'

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
      { property: 'og:url', content: 'https://blogs.atharvsingh.me' },
      { property: 'og:site_name', content: 'Not a Blogger' },
      { property: 'og:image', content: 'https://images.atharvsingh.me/cta/NotABlogger.webp' },
      // Twitter Cards
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Not a Blogger | Atharv Singh — Backend Systems & Engineering Notes' },
      { name: 'twitter:description', content: 'Backend systems, debugging, and deliberate engineering by Atharv Singh.' },
      { name: 'twitter:site', content: '@atharvwasthere' },
      { name: 'twitter:creator', content: '@atharvwasthere' },
      { name: 'twitter:image', content: 'https://images.atharvsingh.me/cta/NotABlogger.webp' },
      { name: 'twitter:url', content: 'https://blogs.atharvsingh.me' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: 'https://blogs.atharvsingh.me' },
      { rel: 'icon', type: 'image/svg+xml', href: '/quotation-marks-svgrepo-com.svg' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Not a Blogger',
          url: 'https://blogs.atharvsingh.me',
          description: 'Backend systems and deliberate engineering notes by Atharv Singh.',
          author: {
            '@type': 'Person',
            name: 'Atharv Singh',
            url: 'https://blogs.atharvsingh.me',
            jobTitle: 'Backend Engineer',
          },
        }),
      },
    ],
  }),

  loader: async () => {
    const { hasSeenIntro } = await getSessionIntroState()
    return { hasSeenIntro }
  },

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext()
  const loaderData = Route.useLoaderData()
  // Use the server-provided initial state to prevent flash
  const showIntro = useSessionIntro(loaderData?.hasSeenIntro)

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AnimatePresence>
          {showIntro && <NotABloggerIntro />}
        </AnimatePresence>
        <div style={{ visibility: showIntro ? 'hidden' : 'visible' }}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-center" />
          </QueryClientProvider>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
