import { Post } from '@/lib/types'
import { format } from 'date-fns'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface PostListProps {
    posts: Post[]
    isLoading: boolean
    onSelect: (post: Post) => void
    onDelete: (id: string) => void
}

export function PostList({ posts, isLoading, onSelect, onDelete }: PostListProps) {
    if (isLoading && posts.length === 0) {
        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-[1fr_100px_150px_100px] gap-4 px-6 py-3 border-b border-zinc-100 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                        <div>Title</div>
                        <div>Status</div>
                        <div>Created</div>
                        <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-zinc-50">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="grid grid-cols-[1fr_100px_150px_100px] gap-4 px-6 py-4 items-center animate-pulse">
                                <div className="h-5 w-3/4 bg-zinc-200 rounded"></div>
                                <div className="h-4 w-16 bg-zinc-200 rounded"></div>
                                <div className="h-4 w-24 bg-zinc-200 rounded"></div>
                                <div className="h-6 w-16 bg-zinc-200 rounded justify-self-end"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
                <div className="grid grid-cols-[1fr_100px_150px_100px] gap-4 px-6 py-3 border-b border-zinc-100 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    <div>Title</div>
                    <div>Status</div>
                    <div>Created</div>
                    <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-zinc-50">
                    {posts.map(post => (
                        <div key={post.id} className="grid grid-cols-[1fr_100px_150px_100px] gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors items-center group">
                            <div className="font-serif text-lg text-zinc-900 truncate pr-4">
                                {post.title}
                            </div>

                            <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${post.is_published
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                    }`}>
                                    {post.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>

                            <div className="text-zinc-500 text-sm font-mono">
                                {format(new Date(post.created_at), 'MMM d, yyyy')}
                            </div>

                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    to="/blog/$slug"
                                    params={{ slug: post.slug }}
                                    target="_blank"
                                    className="p-2 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
                                    title="View"
                                >
                                    <Eye size={16} />
                                </Link>
                                <Link
                                    to="/admin/edit/$id"
                                    params={{ id: post.id }}
                                    className="p-2 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </Link>
                                <button
                                    onClick={() => onDelete(post.id)}
                                    className="p-2 hover:bg-red-50 rounded text-zinc-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && !isLoading && (
                        <div className="p-12 text-center">
                            <p className="text-zinc-400 font-serif text-lg italic">No posts found.</p>
                            <Link to="/admin/new" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">
                                Write your first story
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
