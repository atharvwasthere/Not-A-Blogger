import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

export const getSessionIntroState = createServerFn({ method: 'GET' })
    .handler(async () => {
        const request = getRequest()
        const cookieHeader = request.headers.get('cookie') || ''
        const hasSeenIntro = cookieHeader.includes('intro-seen=true')
        return { hasSeenIntro }
    })
