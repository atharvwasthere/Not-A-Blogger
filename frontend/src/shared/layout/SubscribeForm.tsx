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
        <h3 className="mb-2 text-[21px] font-normal leading-snug text-ink">Subscribe to the newsletter</h3>
        <p className="mb-[18px] max-w-sm font-sans text-sm leading-relaxed text-soft">
            Get notified when I publish. No spam, ever.
        </p>
        <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-2.5">
            <input
                type="email"
                placeholder="john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
                className="w-full rounded-[4px] border border-rule bg-card px-3.5 py-[13px] font-mono text-[13.5px] text-ink placeholder:text-faint transition-colors focus:border-ink focus:outline-none"
                disabled={uiStatus !== "idle"}
            />
            <Button
                type="submit"
                className="relative h-[46px] w-full overflow-hidden rounded-[4px] bg-ink text-[14.5px] font-medium text-paper hover:bg-ink/90"
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
                        <Send className="w-5 h-5 text-paper" />
                    </motion.div>
                )}
            </Button>
        </form>
        </div>
    );
}
