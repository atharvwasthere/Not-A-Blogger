import * as React from "react";

export function AnnouncementBanner() {
    return (
        <div className="w-full bg-black overflow-hidden py-2 border-b border-white/10 select-none">
            <div className="animate-marquee inline-block whitespace-nowrap px-4">
                <span className="text-[14px] text-white opacity-80 font-mono tracking-tight">
                    Welcome! This blog just went live — I’ll be adding new posts soon. Stay tuned.
                </span>
                {/* Duplicate the text to create a seamless loop effect if needed, 
                    but for a 35s slow crawl, a single span with transform is usually fine.
                    Adding a second one for continuity. */}
                <span className="text-[14px] text-white opacity-80 font-mono tracking-tight ml-12">
                    Welcome! This blog just went live — I’ll be adding new posts soon. Stay tuned.
                </span>
            </div>
        </div>
    );
}
