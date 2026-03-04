import { motion } from "motion/react"
import newFrame from "@/assets/frame.webp"

export function NotABloggerIntro() {
    return (
        <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483647,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#AAD2FA",
            }}
        >
            <motion.img
                src={newFrame}
                alt=""
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1], // Custom bounce/out
                    delay: 0.1
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                }}
            />
        </motion.div>
    )
}


