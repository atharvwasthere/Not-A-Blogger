import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { api } from "@/lib/api";

export function AdminLogin() {
    const [logs, setLogs] = useState<string[]>([]);
    const [redirecting, setRedirecting] = useState(false);

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

    const handleLogin = () => {
        setRedirecting(true);
        setLogs(prev => [...prev, "> HANDING OFF TO GITHUB..."]);
        window.location.assign(api.githubLoginUrl());
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

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-green-500/30 p-6 bg-black/50 backdrop-blur-sm"
                >
                    <button
                        type="button"
                        onClick={handleLogin}
                        disabled={redirecting}
                        autoFocus
                        className="w-full bg-green-900/20 border border-green-500 text-green-400 py-3 hover:bg-green-500 hover:text-black transition-colors uppercase tracking-widest font-bold"
                    >
                        {redirecting ? "Redirecting..." : "Authenticate_With_GitHub()"}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
