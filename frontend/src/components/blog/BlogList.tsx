import { format } from "date-fns";
import { BlogItem } from "./BlogItem";
import { Post } from "@/lib/types";

interface BlogListProps {
    posts: Post[]
}

export function BlogList({ posts }: BlogListProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 text-center">
                <p className="text-zinc-500 font-serif italic text-xl">
                    No posts found. Start writing...
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-6 pb-12 md:pb-24 pt-0">
            <div className="space-y-0">
                {posts.map((post) => (
                    <BlogItem
                        key={post.slug}
                        slug={post.slug}
                        title={post.title}
                        date={format(new Date(post.created_at || Date.now()), "MMMM d, yyyy")}
                        description={post.excerpt || ""}
                        readingTime={post.reading_time}
                        coverImage={post.cover_image || undefined}
                        iconUrl={post.icon_url || undefined}
                    />
                ))}
            </div>
        </div>
    );
}
