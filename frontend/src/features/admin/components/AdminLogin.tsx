import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "@tanstack/react-router";
import { api } from "@/lib/api";

export function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [logs, setLogs] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const lines = [
            "> INITIALIZING SECURE SHELL...",
            "> ESTABLISHING ENCRYPTED CONNECTION...",
            "> ACCESS MODE: ADMIN",
            "> AUTHENTICATION REQUIRED"
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < lines.length) {
                setLogs(prev => [...prev, lines[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 400);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setLogs(prev => [...prev, `> ATTEMPTING LOGIN FOR USER: ${username}...`]);

        try {
            await api.login({ username, password });

            setStatus("success");
            setLogs(prev => [...prev, "> ACCESS GRANTED", "> REDIRECTING..."]);

            setTimeout(() => {
                // Here we would navigate to the dashboard
                router.navigate({ to: "/admin/dashboard" });
            }, 1500);

        } catch (err) {
            setStatus("error");
            setLogs(prev => [...prev, `> ERROR: ${err}`, "> TRY AGAIN"]);
            setTimeout(() => setStatus("idle"), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black text-green-500 font-mono p-8 md:p-12 overflow-hidden flex flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-6">
                <div className="space-y-2 mb-8">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {log}
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {status !== "success" && (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleLogin}
                            className="space-y-4 border border-green-500/30 p-6 bg-black/50 backdrop-blur-sm"
                        >
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest opacity-70">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-transparent border-b border-green-500/50 py-2 focus:outline-none focus:border-green-400 font-bold"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest opacity-70">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-transparent border-b border-green-500/50 py-2 focus:outline-none focus:border-green-400 font-bold"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full bg-green-900/20 border border-green-500 text-green-400 py-3 mt-4 hover:bg-green-500 hover:text-black transition-colors uppercase tracking-widest font-bold"
                            >
                                {status === "loading" ? "Processing..." : "Initialise_Login_Sequence()"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
