import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/shared/layout/MainLayout'

export const Route = createFileRoute('/about/')({
    component: AboutPage,
})

function AboutPage() {
    return (
        <MainLayout showSidebar={false}>
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
                <div className="prose prose-zinc dark:prose-invert prose-headings:font-serif prose-h1:text-4xl prose-h1:font-normal prose-h2:text-2xl prose-h2:font-normal prose-h2:mt-12 prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-li:text-zinc-600 dark:prose-li:text-zinc-400 max-w-none">

                    <h1 className="mb-12">About this site</h1>

                    <section className="animate-intro-frame" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
                        <h2>Why this exists</h2>
                        <p>
                            My portfolio and this blog serve different purposes.
                        </p>
                        <p>
                            A portfolio should be clean show projects, highlight work, explain outcomes. If I start dumping long posts about debugging or system design there, it becomes messy. Nobody wants to scroll through five engineering deep-dives to find a project demo.
                        </p>
                        <p>
                            So I separated them. Portfolio stays focused. Writing gets its own home.
                        </p>
                    </section>

                    <section className="animate-intro-frame" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                        <h2>Why not Hashnode or Medium</h2>
                        <p>
                            Hashnode and Medium are solid platforms. For most people, they're the right call.
                        </p>
                        <p>
                            But I write about systems. Building them, debugging them, understanding how they work. It felt weird to do that on a platform where I have zero control over the system itself.
                        </p>
                        <p>I wanted to own:</p>
                        <ul>
                            <li>how pages render</li>
                            <li>how content gets indexed</li>
                            <li>how the site is structured</li>
                            <li>how things evolve over time</li>
                        </ul>
                        <p>
                            Plus, building the platform yourself lets you experiment with stuff most blog platforms can't handle custom layouts, interactive diagrams, weird post structures. The blog is part of the experiment.
                        </p>
                    </section>

                    <section className="animate-intro-frame" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                        <h2>Engineering motivation</h2>
                        <p>
                            The other reason was technical.
                        </p>
                        <p>
                            My portfolio is a React SPA. Works fine for UI stuff, but I wasn't happy with how it handled content SEO felt off, server rendering was non-existent, and metadata control was annoying.
                        </p>
                        <p>
                            This site gave me a chance to try{' '}
                            <strong className="inline whitespace-nowrap">
                                <img src="https://images.atharvsingh.me/cta/logo-black.svg" alt="TanStack Start" className="!inline-block !m-0 !mr-1.5 h-4 w-auto relative -top-[2px] dark:invert" />
                                TanStack Start
                            </strong>{' '}
                            and see what server-first rendering actually looks like. Better routing, better performance characteristics, tighter control over how things load.
                        </p>
                        <p>
                            So yeah, this is both a writing platform and a sandbox for trying things out.
                        </p>
                    </section>

                    <section className="animate-intro-frame" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                        <h2>Writing philosophy</h2>
                        <p>
                            This isn't a tutorial blog. I'm not trying to teach Next.js basics or explain what REST APIs are.
                        </p>
                        <p>
                            It's more about documenting how I approach problems. The stuff that usually shows up here:
                        </p>
                        <ul>
                            <li>backend systems</li>
                            <li>debugging weird issues</li>
                            <li>architectural decisions</li>
                            <li>trade-offs when building things</li>
                            <li>lessons learned the hard way</li>
                        </ul>
                        <p>
                            I'm not rushing to post every week. The goal is clarity, not frequency. If someone reads this later and it helps them think through a similar problem, cool.
                        </p>
                    </section>

                    <section className="animate-intro-frame" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
                        <h2>Long-term goal</h2>
                        <p>
                            Over time, this should become a searchable archive of engineering thinking. Not a feed you scroll through, but something you dig into when you're stuck or curious.
                        </p>
                        <p>
                            If it helps someone work through a problem more clearly, that's a win.
                        </p>
                    </section>

                </div>
            </div>
        </MainLayout>
    )
}
