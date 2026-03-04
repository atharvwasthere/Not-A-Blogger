import { useEffect, useState } from "react"
import newFrame from "@/assets/frame.webp"
import frame3 from "@/assets/frame-3.webp"

const frames = [
    { src: newFrame, bg: "#AAD2FA" },
    { src: frame3, bg: "#ffffff" },
]

export function NotABloggerIntro() {
    const [index, setIndex] = useState(0)
    useEffect(() => {
        const timer = setTimeout(() => setIndex(1), 600)
        return () => clearTimeout(timer)
    }, [])

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
                    objectFit: index === 1 ? "cover" : "contain",
                    animation: "intro-frame 0.25s ease-out",
                }}
            />
        </div>
    )
}
