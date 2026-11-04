# PR 4 · Newspaper covers, with switches in the admin

## Why

The archive should look like a printed journal: each post gets a halftone print of an image **from that post** (a diagram, the bundle treemap, a DevTools waterfall), never a stock picture.

- The existing `cover_image`s are social cards with the title set in type, so printing one next to the title would say the title twice. The source is chosen from the images inside the post.
- The dots are stored as a transparency mask, so the page paints them in its own ink colour and the same file works in light and dark.

Two switches, both in the admin:
- **per post** (`show_print`): this post shows its cover or not
- **site-wide** (`covers_enabled`): turn every cover on or off at once without touching posts

A cover renders only when **site-wide is on AND the post's switch is on AND a print exists**.

## Where covers appear

Covers appear on these, and nowhere else (the landing list stays calm with icons):

| Place | Treatment |
|---|---|
| Landing: Latest note card | Desktop grid `minmax(0,.75fr) minmax(0,1.5fr)`. The print fills the left column across both rows (min-height 280px), with the title, meta, excerpt and Read note on the right. Phone: the print on top at 16:10, text below. Without a cover, keep PR 1's icon layout. |
| `/notes` and `/topics/$topic` grid (`NoteCard`) | Between the topic line and the excerpt, 16:10, transparent background (the card's topic tint shows through). |
| Article | Under the title and "Based on", 16:9, radius 4px. |

## Rendering (`features/blog/components/Print.tsx`)

```tsx
<Print src={post.print_url} tint={topicTint(post.tags[0])} ratio="16/10" />
```

```css
.print { position: relative; background: var(--print-tint, var(--wash)); }
.print::before {
  content: ""; position: absolute; inset: 0;
  background: var(--ink); opacity: .88;
  -webkit-mask: var(--print-src) center / cover no-repeat;
  mask: var(--print-src) center / cover no-repeat;
}
```

`Print` sets `--print-src: url(...)` and `--print-tint` as inline custom properties; it is `aria-hidden`.

Cloudinary serves `Access-Control-Allow-Origin: *` (checked), which CSS masks require.

Visibility lives in one hook, so no component re-implements the rule:

```ts
// features/blog/hooks/usePrint.ts
export function usePrint(post: Pick<Post, 'print_url' | 'show_print'>): string | null
// = settings.covers_enabled && post.show_print && post.print_url ? post.print_url : null
```

## Backend

### Schema

Migration:
- `blogs.print_url`: `String(500)`, nullable.
- `blogs.show_print`: `Boolean`, not null, `server_default false`.
- New table `site_settings`: `key String PK`, `value JSONB not null`, `updated_at`.
- Seed `('covers_enabled', true)`.

Add `print_url` and `show_print` to `PostOutput`/`PostSummary`, and `show_print` to `PostInput`. `print_url` is only written by the generate endpoint.

### Endpoints

| Method | Path | Auth | Body → Response |
|---|---|---|---|
| GET | `/api/settings` | public | → `{ "covers_enabled": true }` |
| PUT | `/api/settings` | admin | `{ "covers_enabled": false }` → same shape |
| POST | `/api/posts/{id}/print` | admin | `{ "source_url": "...", "invert": "auto" \| "always" \| "never" }` → `{ "print_url": "..." }` |

`POST /print`:
1. **Only fetch your own images.** `source_url` must start with `https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/`; anything else is a 400. This stops the server being used to fetch arbitrary URLs.
2. Download with a 10s timeout and a 15 MB cap. Open with Pillow, keeping its decompression-bomb guard.
3. Render with `services/halftone.py` (port [reference/halftone.py](reference/halftone.py)).
4. Upload the PNG to Cloudinary under `blog_posts/prints/`, and save `print_url` on the post.
   - Generating **does not** switch the post's cover on. The author previews it first, then flips `show_print`.
   - Use a plain `def` route so FastAPI runs the CPU work in its threadpool.

### Halftone algorithm

The full code is in [reference/halftone.py](reference/halftone.py). It was tuned on the real posts:

| Step | Value |
|---|---|
| Output | 960×600 RGBA PNG. The ink is in the alpha channel only. |
| Fit | Center cover-crop of the source to 960×600 |
| Invert | `auto`: invert when the mean luminance is under 145 (dark UI screenshots become ink on paper, like a printed negative). `always` / `never` override it. The TanStack bundle treemap needed `never`. |
| Contrast | `autocontrast(cutoff=1)`, then a 1.6px Gaussian blur on the darkness map |
| Screen | 45° dot grid, 9px pitch |
| Dot size | `r = 9 × 0.64 × √(darkness ^ 1.15)`. No dot under 4% darkness, so blank paper stays clean. Drawn at 2× and downsampled for smooth edges. |

## Admin

**Post editor, a "Newspaper cover" section:**
- **Source:** thumbnails of every `<img>` in the post content, plus `cover_image`. Pick one.
- **Invert:** Auto / Always / Never.
- **Generate:** calls the endpoint, then previews the `Print` on paper in light and dark side by side.
- **Show cover:** a switch bound to `show_print`, saved with the post.

**Dashboard:** a switch "Newspaper covers on the site", bound to `covers_enabled`. Show what it does in one line: "Hides every cover without changing posts."

## Frontend data

- `useSiteSettings()`: `queryOptions({ queryKey: ['settings'], queryFn: api.getSettings, staleTime: 5 min })`.
- Prefetch it in the root route's loader, so server-rendered pages already know whether covers are on and nothing pops in.
- `api.generatePrint(postId, sourceUrl, invert)` and `api.updateSettings(body)`.

## Acceptance

- [ ] Generating from a post image shows a preview in the admin and saves `print_url`, but nothing shows on the site until "Show cover" is on.
- [ ] With "Show cover" on, the cover appears in the Latest note card (if it is the newest post), the `/notes` grid, its topic page and the article. It never appears in the landing list.
- [ ] Turning the site-wide switch off hides every cover on next load; turning it on brings back exactly the posts whose switch is on.
- [ ] Covers render in ink in both light and dark.
- [ ] A non-Cloudinary or foreign-cloud `source_url` is rejected.

## Tests

**Backend**
- `test_halftone.py`:
  - output size and mode
  - a white image produces no ink
  - a black image produces ink
  - the `auto` invert threshold
  - `never` keeps a mid-grey image un-inverted
- `test_print_endpoint.py`:
  - admin only
  - rejects foreign URLs
  - stores `print_url`
  - leaves `show_print` unchanged (mock the download and the Cloudinary upload)
- `test_settings.py`: GET is public, PUT is admin only, the default is `true`.

**Frontend**
- `usePrint.test.ts`: the full truth table of site switch × post switch × print present.
