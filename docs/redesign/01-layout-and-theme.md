# PR 1 · Colour system, theme toggle, layout and landing page

## Why

- The live site's colours come from two places: shadcn variables (`bg-background`, `text-muted-foreground`) and hard-coded Tailwind greys (`text-zinc-900`). There is no single place to change a colour.
- Dark mode does not exist. `.dark` variables are defined in `styles.css` but nothing ever sets the class.
- Reader mode (a floating button on posts with three themes: white, green "reader light", dark) was a workaround for the missing dark mode. A site-wide light/dark toggle replaces it.
- The landing page puts "Why does this blog exist?" above every post, the sidebar lists ten one-post keyword tags as Topics, and on a phone the first post starts 1.7 screens down.

## 1. Colour tokens

Create `frontend/src/styles/tokens.css`. This is the only file that contains colour values.

```css
/* Paper and ink. Every text colour passes WCAG AA (4.5:1) on every surface it is used on; see the table below. */
:root {
  color-scheme: light;
  --paper: #fbfaf6;   /* page background */
  --card: #fffefb;    /* cards, inputs */
  --wash: #f3eee5;    /* icon tiles, code blocks, quotes */
  --rule: #e6dfd3;    /* borders, dividers */
  --ink: #1b1915;     /* titles, buttons, links */
  --body: #4a453f;    /* article text */
  --soft: #625b53;    /* dates, meta, captions */
  --faint: #a39c93;   /* decoration only: dots, placeholder text. Never readable text */
  --label: #7a5332;   /* section labels, code keywords */
  --select: #eadfcb;  /* text selection */

  --tint-debugging: #e6dcbc;
  --tint-distributed-systems: #e4e1db;
  --tint-performance: #ede6d4;
  --tint-under-the-hood: #ded9cc;
  --tint-tooling: #e9e2d1;
  --tint-default: #e9e2d1;

  --mark-green: #dceed3;
  --mark-yellow: #f5ecc4;
  --mark-blue: #dae6f4;

  --code-keyword: #7a5332;
  --code-string: #4c662b;
  --code-number: #9a4226;
  --code-comment: #625b53;
}

.dark {
  color-scheme: dark;
  --paper: #14120f;
  --card: #1a1714;
  --wash: #221e1a;
  --rule: #302a24;
  --ink: #ede8e0;
  --body: #bfb7ac;
  --soft: #9a9186;
  --faint: #6b635a;
  --label: #d4a97f;
  --select: #3a3026;

  --tint-debugging: #2b2619;
  --tint-distributed-systems: #22201c;
  --tint-performance: #28231b;
  --tint-under-the-hood: #24211b;
  --tint-tooling: #27221a;
  --tint-default: #27221a;

  --mark-green: #253822;
  --mark-yellow: #3a3219;
  --mark-blue: #1e2d3f;

  --code-keyword: #d4a97f;
  --code-string: #afc38e;
  --code-number: #e39a7d;
  --code-comment: #9a9186;
}
```

Contrast, computed from these exact values (WCAG ratio, 4.5 needed for text):

| Text colour | paper | card | wash | lowest topic tint | marks |
|---|---|---|---|---|---|
| ink (light / dark) | 16.8 / 15.3 | 17.4 / 14.6 | 15.2 / 13.6 | 12.5 / 12.4 | ≥ 13.9 / ≥ 10.3 |
| body | 9.1 / 9.4 | 9.4 / 9.0 | 8.2 / 8.3 | 6.7 / 7.6 | ≥ 7.5 / ≥ 6.3 |
| soft | 6.4 / 6.0 | 6.6 / 5.8 | 5.8 / 5.3 | 4.75 / 4.9 | not used |
| label | 6.5 / 8.7 | 6.7 / 8.3 | 5.8 / 7.7 | 4.8 / 7.0 | not used |
| code colours on wash | ≥ 5.6 / ≥ 5.3 | | | | |
| faint | 2.6 / 3.2 | fails: decoration only | | | |

### Wire the tokens into Tailwind and shadcn

In `styles.css`: `@import "./styles/tokens.css";`, then add the tokens to `@theme inline` so classes exist:

```css
@theme inline {
  --color-paper: var(--paper);
  --color-card: var(--card);
  --color-wash: var(--wash);
  --color-rule: var(--rule);
  --color-ink: var(--ink);
  --color-body: var(--body);
  --color-soft: var(--soft);
  --color-faint: var(--faint);
  --color-label: var(--label);
  /* keep the existing radius and shadcn entries below */
}
```

Point the existing shadcn variables at the new tokens so components that still use them follow the theme, and delete the old `oklch` values in `:root` and `.dark`:

```css
:root, .dark {
  --background: var(--paper);
  --foreground: var(--ink);
  --card-foreground: var(--ink);
  --popover: var(--card);
  --popover-foreground: var(--ink);
  --primary: var(--ink);
  --primary-foreground: var(--paper);
  --secondary: var(--wash);
  --secondary-foreground: var(--ink);
  --muted: var(--wash);
  --muted-foreground: var(--soft);
  --accent: var(--wash);
  --accent-foreground: var(--ink);
  --border: var(--rule);
  --input: var(--rule);
  --ring: var(--soft);
}
```

On public pages, replace hard-coded `text-zinc-*`, `bg-zinc-*`, `border-zinc-*` and the hex colours in `MainLayout`, `IdentitySidebar`, `SubscribeForm`, `BlogItem`, `BlogList`, `series/$slug.tsx`, `about/index.tsx`, `NotFound`, `Unauthorized`, `DefaultCatchBoundary` with the token classes. The admin may keep its current classes.

### Prose, highlights, code

- `.prose` body text uses `var(--body)`, headings and `strong` use `var(--ink)`, links use `var(--ink)` underlined with `text-decoration-color: var(--faint)`.
- Blockquote: `background: var(--wash); border-left: 3px solid var(--rule); color: var(--ink)`. Remove the hard-coded Notion colours.
- Inline code: `background: var(--wash); border: 1px solid var(--rule); color: var(--ink)`.
- Code blocks (`.notion-code-block`): `background: var(--wash); border: 1px solid var(--rule)`. Replace the "GitHub Dark, always active" hljs palette with the token palette: keywords and built-ins `var(--code-keyword)`, strings `var(--code-string)`, numbers and literals `var(--code-number)`, comments `var(--code-comment)` italic, titles and everything else `var(--ink)`.
- `::selection { background: var(--select); }`
- **Highlights.** Post HTML carries inline highlight colours from the editor, for example `<mark data-color="#bbf7d0" style="background-color: rgb(187, 247, 208)">`. Inline styles win over classes, so map them with `!important`:

```css
.prose mark { color: var(--ink); background: var(--mark-yellow) !important; padding: 0 2px; border-radius: 2px; }
.prose mark[data-color="#bbf7d0" i] { background: var(--mark-green) !important; }
.prose mark[data-color="#bfdbfe" i] { background: var(--mark-blue) !important; }
.prose mark[data-color="#fef9c3" i] { background: var(--mark-yellow) !important; }
```

## 2. Theme toggle

`theme/ThemeProvider.tsx` and `theme/useTheme.ts`:

```ts
type Theme = 'light' | 'dark'
// useTheme() returns:
{ theme: Theme, toggle: () => void, embedMode: 'default' | 'reader-dark' }
```

- Initial theme: `localStorage['nab-theme']` if set, otherwise `prefers-color-scheme`. Wrap every `localStorage` access in try/catch.
- Applying a theme sets or removes the `dark` class on `<html>`.
- **No flash on load.** Add an inline script to the head in `__root.tsx`, before any CSS paints, that reads the same key and media query and sets the class. The provider reads the class it finds instead of recomputing.
- `embedMode` maps the theme onto the names the interactive embeds already understand: light → `'default'`, dark → `'reader-dark'`. Existing visualisers keep working with no change.

## 3. Remove reader mode

In `routes/blog/$slug.tsx` delete `ViewMode`, `MODE_CONFIG`, `ReaderModeToggle`, the wipe overlay and its state (`isTransitioning`, `wipePhase`, `wipeDirection`, `overlayColor`, `nextMode`, `getClipPath`, `getInitialClipPath`). The embed theme effect reads `useTheme().embedMode` instead of `viewMode`:

```ts
const { embedMode } = useTheme()
const embedModeRef = useRef(embedMode)
useEffect(() => { embedModeRef.current = embedMode }, [embedMode])
// on 'embed:ready': postTheme(frame, embedModeRef.current)
// when embedMode changes: post it to every frame (same as today's viewMode effect)
```

In `styles.css` delete every `.reader-light` and `.reader-dark` rule.

## 4. Layout

Replace `MainLayout`'s `showSidebar` boolean with a variant:

```tsx
<MainLayout variant="browse">  {/* rail + nav: home, notes, topics */}
<MainLayout variant="read">    {/* nav with the wordmark, single column: articles, about, series */}
```

### `SiteNav` (top nav, every page)

| Left | Right |
|---|---|
| "Not a Blogger." wordmark (only in `read` variant), **Notes** (`/`, active on `/` and `/notes`), **Topics** (`/topics`, added in PR 2; render the link only once the route exists) | Search button showing a magnifier and `⌘ K`, theme toggle (sun / moon) |

No About link in the nav. Active tab: ink text, weight 500, 2px ink underline on the nav's bottom border. Inactive: soft. Height 72px on desktop, 50px on phones.

**Search button.** The `CommandPalette` keeps its ⌘K shortcut and also opens from the button. Share the open state through a small context (`shared/search/CommandPaletteProvider.tsx`, `useCommandPalette()` returning `{ open, setOpen }`), mounted once in `__root.tsx`. Do not pass setters through props.

### `IdentityRail` (replaces `IdentitySidebar`, `browse` variant, ≥ md)

Top to bottom, 300px wide on desktop, sticky and scrollable if taller than the viewport:

1. "Not a Blogger." in Geist Serif, 58px, line height 0.95.
2. "I break systems so you don’t have to." Inter 17px, ink.
3. Divider.
4. Label `WHY THIS BLOG EXISTS`, then: "Built instead of publishing on Hashnode to experiment with TanStack Start and keep long-form writing separate from my portfolio." (Inter 14px, soft), then a link "About this site →" to `/about`.
5. Divider.
6. `SubscribeForm`, unchanged behaviour and animation, restyled with tokens.
7. Social links (GitHub, X, LinkedIn).
8. Footer: "© 2026 Not a Blogger. Built by Atharv Singh." in mono 12px, soft.

Remove `TopicsBlock` and `CircuitPulse` from the rail. Delete `CircuitPulse.tsx`, `CtaBanner.tsx` and the unused `Header.tsx` if nothing else imports them.

Check the rail at 1440×900, 1280×768 and 1280×700: nothing may be cut off; if it is taller than the viewport it scrolls.

### Phones (< md)

- The rail is hidden.
- `PhoneHeader`: wordmark on the left, search and theme buttons on the right.
- `SiteNav` below it shows only the Notes and Topics tabs.
- On the home page only, after the posts: the "Why this blog exists" block, Subscribe, socials and footer. The reader sees a post first.

## 5. Landing page (`routes/index.tsx`)

Label style everywhere: JetBrains Mono 12px, weight 500, letter-spacing 0.14em, uppercase, `text-label`.

1. **LATEST NOTE** → `LatestNote` card for the newest post. Card: `bg-card`, 1px `border-rule`, radius 14px. Desktop grid `150px | 1.6fr | 1fr`:
   - post icon (`icon_url`) at 104px
   - title in Geist Serif `clamp(30px, 3cqi, 40px)`, then the mono meta line `SEP 1, 2026 · 17 MIN READ`
   - excerpt in mono 14px / 1.8, clamped to 7 lines, then "Read note →" bottom right

   The whole card links to the post. (PR 4 swaps the icon for the newspaper cover when covers are on.)
2. **RECENTLY PUBLISHED** → every other post as `NoteRow`, in two columns on desktop and one on phones. Row: a 44px icon tile (`bg-wash`, `border-rule`, radius 10, icon 26px), the title in Inter 15.5px ink, and the meta line `Jul 8, 2026 · 13 min read` in 13.5px soft.

Remove `CtaBanner` ("Why does this blog exist?") from the landing page. Keep the typed "admin" easter egg. Keep `?tag=` filtering working until PR 2 replaces it.

## Acceptance

- [ ] No hex colour values outside `styles/tokens.css` on public pages; `grep -rn "zinc-" frontend/src/routes frontend/src/shared frontend/src/features/blog` returns nothing.
- [ ] Theme toggle switches every public page; the choice survives a reload; no light flash when loading in dark.
- [ ] An existing embed (bulk-download post) switches theme with the toggle, without reloading.
- [ ] Reader mode button and its CSS are gone.
- [ ] Highlights in "The Other Half of Caching" keep green, yellow and blue, and do not glare in dark.
- [ ] Phone (375px): the latest post card is visible without scrolling past the identity block.
- [ ] Rail fits or scrolls at 1280×700.

## Tests

- `theme/useTheme.test.ts` (jsdom): defaults to the system preference; `toggle()` flips the `dark` class and persists; `embedMode` maps light → `default`, dark → `reader-dark`; works when `localStorage` throws.
- Existing vitest and `tsc` stay green, and `npm run build` passes.
