import { Loader2 } from 'lucide-react'

export function EditorSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] min-h-[calc(100vh-56px)] animate-pulse">
            {/* Left: Editor Skeleton */}
            <section className="relative w-full border-r border-zinc-50 p-8 md:p-12 lg:p-16">
                <div className="h-16 w-3/4 bg-zinc-200 rounded-md mb-12"></div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-zinc-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-zinc-100 rounded"></div>
                    <div className="h-4 w-4/6 bg-zinc-100 rounded"></div>
                    <div className="h-4 w-full bg-zinc-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-zinc-100 rounded"></div>
                </div>
            </section>

            {/* Right: Sidebar Skeleton */}
            <aside className="border-l border-zinc-100 bg-zinc-50/30 p-8 flex flex-col gap-10 lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] overflow-y-auto">
                <div className="space-y-4">
                    <div className="w-full aspect-video bg-zinc-200 rounded-lg flex items-center justify-center">
                        <Loader2 className="animate-spin text-zinc-400" size={24} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-6 w-24 bg-zinc-200 rounded"></div>
                    <div className="h-10 w-full bg-zinc-200 rounded-lg"></div>
                    <div className="h-10 w-full bg-zinc-200 rounded"></div>
                </div>

                <div className="h-px bg-zinc-100 w-full" />

                <div className="space-y-4">
                    <div className="h-6 w-24 bg-zinc-200 rounded"></div>
                    <div className="h-24 w-full bg-zinc-100 rounded"></div>
                </div>
            </aside>
        </div>
    )
}
