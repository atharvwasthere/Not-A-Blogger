import { useEffect, useState } from "react"
import frame1 from "@/assets/frame-1.webp"
import frame2 from "@/assets/frame-2.webp"
import frame3 from "@/assets/frame-3.webp"

const frames = [
    { src: frame1, bg: "#AAD2FA" },
    { src: frame2, bg: "#AAD2FA" },
    { src: frame3, bg: "#ffffff" },
]

export function NotABloggerIntro() {
    const [index, setIndex] = useState(0)
    useEffect(() => {
        const timers = [
            setTimeout(() => setIndex(1), 600),
            setTimeout(() => setIndex(2), 1200),
        ]

        return () => timers.forEach(clearTimeout)
    }, [])

    // We render immediately to prevent flash, even if it causes a hydration mismatch warning
    // console.log("INTRO RENDERING - Frame:", index, "SVG:", frames[index].src)

    return (
        <div
            aria-hidden
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483647,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: frames[index].bg,
            }}
        >
            <img
                key={index}
                src={frames[index].src}
                alt=""
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: index === 2 ? "cover" : "contain",
                    animation: "intro-frame 0.25s ease-out",
                }}
                onLoad={() => console.log("✅ SVG LOADED:", frames[index].src)}
                onError={(e) => console.error("❌ SVG FAILED:", frames[index].src, e)}
            />
        </div>
    )
}
