import { useState } from "react";
import { Button } from "../ui/button";
import { Send, Check, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        // Mock API call
        setTimeout(() => {
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000);
            setEmail("");
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2">
            <input
                type="email"
                placeholder="john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                disabled={status !== "idle"}
            />
            <Button
                type="submit"
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-none relative overflow-hidden"
                disabled={status !== "idle"}
            >
                <AnimatePresence mode="wait">
                    {status === "idle" && (
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
                    {status === "loading" && (
                        <motion.span
                            key="loading"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                        >
                            <Mail className="w-5 h-5 animate-pulse" />
                        </motion.span>
                    )}
                    {status === "success" && (
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
                {status === "loading" && (
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
    );
}
