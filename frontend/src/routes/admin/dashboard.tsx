import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Post } from "@/lib/types";
import { PostList } from "@/components/admin/PostList";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();

  // Replaces useState and useEffect fetch loadPosts()
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["posts", "admin"],
    queryFn: () => api.getPosts(true),
  });

  // Replaces manual try-catch and reload cascade in handleDelete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "admin"] });
    },
    onError: (error) => {
      console.error("Failed to delete", error);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <main className="max-w-5xl mx-auto p-8 pt-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 font-mono text-sm mt-2">
            Manage your stories
          </p>
        </div>

        <Link to="/admin/new">
          <Button className="font-mono text-xs uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 rounded-none px-6">
            <Plus size={14} className="mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm">
        <PostList
          posts={posts}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
