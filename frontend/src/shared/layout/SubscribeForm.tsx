import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Send, Check, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

type UIStatus = "idle" | "loading" | "success";

export function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [uiStatus, setUiStatus] = useState<UIStatus>("idle");

    const { mutate: subscribe } = useMutation({
        mutationFn: (email: string) => api.subscribe({ email }),
        onMutate: () => setUiStatus("loading"),
        onSuccess: () => {
            setEmail("");
            setUiStatus("success");
            toast.success("You're on the list.");
            setTimeout(() => setUiStatus("idle"), 3000);
        },
        onError: (error: any) => {
            setUiStatus("idle");
            if (error.message?.includes("400") || error.message?.includes("already subscribed")) {
                toast.error("You're already subscribed.");
            } else {
                toast.error("Something went wrong. Try again.");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || uiStatus !== "idle") return;
        subscribe(email);
    };

    return (
        <div>
        <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-serif text-lg font-medium text-foreground mb-2">Subscribe to the newsletter</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Get notified when I publish. No spam, ever.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2">
            <input
                type="email"
                placeholder="john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                disabled={uiStatus !== "idle"}
            />
            <Button
                type="submit"
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none relative overflow-hidden"
                disabled={uiStatus !== "idle"}
            >
                <AnimatePresence mode="wait">
                    {uiStatus === "idle" && (
                        <motion.span
                            key="idle"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            Subscribe
                        </motion.span>
                    )}
                    {uiStatus === "loading" && (
                        <motion.span
                            key="loading"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                        >
                            <Mail className="w-5 h-5 animate-pulse" />
                        </motion.span>
                    )}
                    {uiStatus === "success" && (
                        <motion.span
                            key="success"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            <span>Sent!</span>
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Flying Envelope Animation */}
                {uiStatus === "loading" && (
                    <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2"
                        initial={{ x: 0, opacity: 1, scale: 1 }}
                        animate={{ x: 100, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <Send className="w-5 h-5 text-background" />
                    </motion.div>
                )}
            </Button>
        </form>
        </div>
    );
}
