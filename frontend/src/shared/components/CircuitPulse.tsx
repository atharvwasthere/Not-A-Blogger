import { motion } from "motion/react";

const TRACES = [
    { id: 1, path: "M10 20 H70 V50 H100", duration: 3, delay: 0, color: "#4ade80" }, // Green
    { id: 2, path: "M0 80 H40 V40 H80", duration: 4, delay: 1.5, color: "#60a5fa" },  // Light Blue
    { id: 3, path: "M20 0 V30 H60 V100", duration: 5, delay: 0.5, color: "#f472b6" }, // Light Pink
    { id: 4, path: "M100 10 H85 V60 H50 V90", duration: 3.5, delay: 2, color: "#60a5fa" },
    { id: 5, path: "M30 100 V70 H0", duration: 2.5, delay: 3, color: "#4ade80" },
];

export function CircuitPulse() {
    return (
        <div className="relative w-full h-40 opacity-40 pointer-events-none select-none overflow-hidden">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full stroke-muted-foreground fill-none"
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Static Traces */}
                {TRACES.map((trace) => (
                    <motion.path
                        key={`trace-${trace.id}`}
                        d={trace.path}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="0.3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: trace.delay * 0.2 }}
                        className="opacity-30"
                    />
                ))}

                {/* Animated Pulses */}
                {TRACES.map((trace) => (
                    <motion.path
                        key={`pulse-${trace.id}`}
                        d={trace.path}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.2"
                        stroke={trace.color}
                        filter="url(#glow)"
                        initial={{ pathLength: 0.05, pathOffset: -0.05, opacity: 0 }}
                        animate={{
                            pathOffset: [0, 1],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: trace.duration,
                            repeat: Infinity,
                            delay: trace.delay,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
