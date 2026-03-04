# Codebase Agent-Skills Audit Report: "Not a Blogger"

**Platform Checked**: React, TanStack, Tailwind, FastAPI, Python

## 1. Vercel React Best Practices
- **Unoptimized Client Effects**: Component rendering issues logged in `frontend\src\routes\admin\dashboard.tsx` and `frontend\src\components\NotABloggerIntro.tsx`. State updates rely on multiple \useEffect\ triggers rather than native TanStack Loader caching.

## 2. TanStack Start Best Practices
- **Server Functions Underutilized**: \createServerFn\ natively provided by TanStack in `frontend\src\lib\server-intro.ts` isn’t systematically adopted across component fetches.

## 3. Requesting Code Review
- **Continuous Review Automation Missing**: There are no CI wrappers enforcing \superpowers:code-reviewer\ after specific milestones.

## 4. UI/UX Pro Max
- **Touch targets & Contrast modes**: Interaction items like delete confirmations use wrapper components lacking sufficient UX ARIA definitions or specific hover states outlined by UX Pro Max (ex: missing \cursor-pointer\ standards).

## 5. Website Audit & Health (udit-website)
- **SquirrelScan Implementations**: There is no baseline crawler testing pipeline running against localhost or staging builds dynamically checking schemas created by \utils/seo.ts\.
