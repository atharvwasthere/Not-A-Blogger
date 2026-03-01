import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

export function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await api.subscribe({ email, name });
            toast.success("Thanks for subscribing!");
            setEmail("");
            setName("");
        } catch (error: any) {
            if (error.message?.includes("already subscribed") || error.message?.includes("400")) {
                toast.error("You are already subscribed.");
            } else {
                toast.error("Failed to subscribe. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-serif text-lg font-medium text-foreground mb-2">Subscribe to the newsletter</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Get notified when I publish new essays on backend systems,
                architecture, and software design. No spam, ever.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="First name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors"
                />
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full px-4 py-2 text-sm bg-transparent border border-border focus:border-foreground focus:outline-none transition-colors"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 mt-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? "Subscribing..." : "Subscribe"}
                </button>
            </form>
        </div>
    );
}
