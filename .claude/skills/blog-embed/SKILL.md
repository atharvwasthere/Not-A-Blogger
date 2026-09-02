---
name: "blog-embed"
description: "Author a self-contained interactive HTML visualiser to embed in a Not a Blogger post — a chunking stepper, an algorithm walkthrough, a diagram that changes state, anything with next/prev/play controls. Use when the user says \"make an embed\", \"build a visualiser\", \"interactive diagram for this post\", \"animate this explanation\", \"embed template\", or is writing the HTML that gets uploaded via /embed in the editor. Covers the postMessage protocol the frame must implement, the three sandbox constraints that fail silently, and responsive rules for the ~720px article column."
---

# Blog embed — a visualiser that earns its place on the page

An embed is a standalone HTML document uploaded through the editor and rendered inside a
post as a sandboxed iframe. It has its own scripts, styles and state. **It inherits nothing
from the blog** — not the fonts, not the `prose` typography, not the reader-mode theme.

Start from `template.html` in this directory. It is a working 4-step stepper with the
protocol already wired; open it directly in a browser, confirm it runs, then replace the
visualiser block at the bottom.

Design context lives in `embed-lld.html` (decisions D1–D6), kept locally rather than tracked
in the repo. Read it if you need to know *why* a rule below exists rather than just what it is.

---

## 1. The contract — copy verbatim

Every embed implements three messages. Version field is required; the parent drops anything
without `v: 1`.

```js
// child → parent
{ v: 1, type: 'embed:ready' }
{ v: 1, type: 'embed:size',  height: number }

// parent → child
{ v: 1, type: 'embed:theme', mode: 'default' | 'reader-light' | 'reader-dark' }
```

The child announces itself first — the parent cannot know when a frame has finished booting.
Everything after that is push.

The protocol block in `template.html` is complete. Copy it as-is; do not re-derive it.

**Progressive, not required.** An embed implementing none of this still renders at the node's
480px in whatever colours it shipped with. Build the visualiser first if that's easier, wire
the protocol last.

---

## 2. Three failures that don't announce themselves

These are the ones that look like something else. Get them wrong and you will debug the
wrong thing for an hour.

### Never `100vh` or `height: 100%` on `html`/`body`

The parent sets the frame's height **from the height you report**. Viewport units inside it
are circular: the frame locks at its initial height forever, or oscillates. Content-driven
height only. This presents as "my embed is stuck at 480px" and looks like a protocol bug.

### Measure a wrapper, not the document

`document.documentElement.scrollHeight` is floored at the viewport height. Once the parent
grows the frame, you can never report a smaller number again — the frame ratchets open and
never shrinks. Observe `#root` and report `getBoundingClientRect().height`.

This presents as mysterious dead space below the embed, usually after a step that shortens
the content.

### Storage throws, it does not return null

The frame runs at an opaque origin (`sandbox="allow-scripts"` without `allow-same-origin`).
`localStorage`, `sessionStorage` and `document.cookie` **throw on access** — they don't
return empty. An unguarded read kills the script before your visualiser initialises, and the
frame renders blank with a console error you won't see unless you open the frame's own
context.

Keep all state in memory. There is nothing to persist and nowhere to persist it.

---

## 3. Theme

Drive theming from `[data-mode]` on `<html>`, set by the `embed:theme` message.

**Never use `@media (prefers-color-scheme: dark)`.** That follows the reader's operating
system, not the blog's reader-mode toggle. A reader in reader-light on a dark OS would get a
dark widget sitting on cream paper.

The three palettes, lifted from `frontend/src/styles.css:248,294`:

| Token | `default` | `reader-light` | `reader-dark` |
|---|---|---|---|
| ground | `#ffffff` | `#f8fbe2` | `#0D1117` |
| surface | `#fafafa` | `#eef1cc` | `#161B22` |
| ink | `#18181b` | `#2c2c2b` | `#E5E7EB` |
| muted | `#71717a` | `#6b6b5e` | `#9CA3AF` |
| rule | `#e4e4e7` | `#d4d8a8` | `#30363D` |
| accent | `#1a6b4a` | `#1a6b4a` | `#93c5fd` |

Set `color-scheme` per mode so native controls and scrollbars follow — this matters the
moment you use a range input for a scrubber.

Transition colours over ~0.3s. The parent runs a 0.4s clip-path wipe on toggle; a snap
change underneath it reads as a rendering bug.

---

## 4. Responsive

**The frame's viewport is the article column.** This is the convenient part: plain media
queries inside the frame work exactly as you'd expect, because the frame's own width *is*
the column width. No container queries needed.

| Context | Column width | Frame width |
|---|---|---|
| Desktop | `max-w-3xl` (768) − `px-6` ×2 | **720px** |
| Mobile 390 | 390 − 48 | **342px** |
| Mobile 320 | 320 − 48 | **272px** |

Design to 720 and stay fluid down to 272.

**Height is free.** Narrow viewport → content wraps taller → `ResizeObserver` fires → the
parent grows the frame. You never fight height on mobile as long as rule 2 is respected.

Suggested breakpoints — `≤ 560px` compact, `≤ 380px` tight.

### Rules

- **Touch targets ≥ 44×44px** below 560px. A 7px-padded button is fine with a mouse and
  miserable with a thumb.
- **No hover-only affordances.** Touch has no hover. Anything revealed on hover must also be
  visible at rest or reachable by tap. A tooltip that only exists on hover is invisible to
  half your readers.
- **SVG diagrams:** `viewBox` plus `width: 100%; height: auto`. Never a fixed pixel width.
- **Wide content that genuinely cannot shrink** gets `overflow-x: auto` on its own container.
  Never on `body` — a horizontally scrolling frame inside a vertically scrolling article is
  awful on touch.
- **Type floor:** 12px mono, 13px body. Do not scale type down to make a layout fit; reflow
  the layout instead.
- **Grids:** `repeat(auto-fit, minmax(Xpx, 1fr))` rather than fixed column counts.
- **No `white-space: nowrap`** on anything that can grow.
- `prefers-reduced-motion` **does** work in the frame — it's a user-agent query, unaffected
  by the opaque origin. Respect it on autoplay.

### Testing

Open the file directly and resize the window. Standalone, `parent === window`, so the
messages post harmlessly to self and it defaults to `data-mode="default"`. Check 320, 390,
720. That is the whole test loop — you do not need the blog running.

If a real browser isn't available in your environment to eyeball it, verify the logic with
jsdom instead of skipping verification: load the file with `runScripts: 'dangerously'`, fire
the same click sequence a reader would, and assert on the resulting text content and disabled
states. It won't catch layout bugs, but it catches the more common failure — a JS exception
mid-interaction that silently freezes the widget — cheaply and deterministically. See §7.

---

## 5. Make it worth embedding

An embed that a static image could replace should be a static image. The bar is: **the
reader changes something and sees consequence.** If there is nothing to change, write a
figure instead.

Once it clears that bar, aim high — but in the page's own restrained language: serif body
text, a lot of whitespace, one accent colour. The reference point is an institutional research
deck — Goldman Sachs, McKinsey — not a consumer app. Concretely:

- **Hairlines, not boxes.** Don't wrap every chip, card, or state in its own bordered,
  rounded, filled container — that reads as a UI kit, not a document. Prefer a single thin
  `1px solid var(--rule)` separator between sections (a top or bottom border on the block),
  and let spacing plus typography carry the structure. Reach for a full bordered card only
  when you're grouping content that would otherwise be ambiguous, and even then keep the
  radius near 0 — sharp corners, not rounded chips.
- **One accent colour, spent on state, not decoration.** Active/selected/changed = accent.
  Everything else is ink, muted, or a hairline. Don't tint backgrounds to show state (a
  filled colour block reads as a badge); prefer a text colour change or a 2px underline.
  Status labels are small bold mono text in a colour, not a pill with a background fill.
- **Numbers get a different typeface than labels.** Mono is for identifiers and code-shaped
  data — keys, row names, the literal condition being evaluated (`current.bytes >= target`).
  The numbers themselves — sizes, counts, percentages, anything the reader's eye should land
  on as a *value* — read as a chunky terminal font in mono and look unpolished at display
  size. Give them their own class:
  ```css
  .num{
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter',
                 'Helvetica Neue', Arial, sans-serif;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'ss01' 1;
    letter-spacing: -.01em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ```

  Apply it to the number itself, not its container, so a label like `completed_chunks` can
  stay mono while the `4 / 5` next to it reads smooth. Also set
  `-webkit-font-smoothing: antialiased` on `body` — it's a small thing but it's the
  difference between "rendered" and "designed."
- **Motion encodes the diff.** Going from step 2 to step 3, the thing that *moved* is what
  the reader's eye should follow. Transition the change; never hard-cut between states. This
  is the single highest-leverage choice in the whole visualiser — it's the difference between
  a slideshow and an explanation.
- **Legible at rest.** The first frame, before anyone clicks, must already show what the
  thing does. An embed that opens as an empty stage with a play button explains nothing to
  the 80% who never press it.
- **Real domain labels.** `tok 0-127`, `overlap 32`, `chunk_size=128` — never "Chunk A" and
  "Chunk B". The whole blog is about real systems; the diagrams should be too. Fake labels
  are the fastest way to make a visualiser feel like a tutorial.
- **One bold move.** One accent colour, one motion idea. Everything around it quiet. Two bold
  moves cancel out.
- **Show the tradeoff, not just the mechanism.** The chunking stepper is good when it ends on
  "overlap costs tokens" rather than merely showing that overlap exists. The last frame is
  the argument.

---

## 6. Before upload

- [ ] Opens standalone in a browser and runs
- [ ] No `100vh` / `height: 100%` on root or body
- [ ] `ResizeObserver` watches `#root`, reports `getBoundingClientRect().height`
- [ ] No `localStorage` / `sessionStorage` / `document.cookie` anywhere
- [ ] Theme driven by `[data-mode]`, all three palettes defined, no `prefers-color-scheme`
- [ ] Legible and operable at 320px; touch targets ≥ 44px
- [ ] No hover-only information
- [ ] `prefers-reduced-motion` respected
- [ ] No bordered/filled "card" wrapping every element — hairline separators, sharp corners,
      one accent colour spent on state
- [ ] Display numbers use the `.num` sans/tabular treatment, not raw mono
- [ ] Fonts loaded inside the frame, with a real fallback stack
- [ ] Under 512 KB — images referenced as Cloudinary URLs, never base64-inlined
- [ ] First frame communicates the idea before any interaction

Upload via `/embed` in the post editor. Revisions replace in place at the same id, so the
post never needs re-editing (LLD D4).

---

## 7. Verifying without a browser

Playwright's browser binaries need system libraries that often aren't installable in a
sandboxed shell (no root, no `apt-get`). Don't skip verification because of that — fall back
to `jsdom`, which runs the DOM and your script without needing a renderer.

**Stub `ResizeObserver` first.** jsdom does not implement it (still true in jsdom 27), and
the protocol block calls it at top level. Without the stub it throws
`ReferenceError: ResizeObserver is not defined`, which kills the rest of the `<script>` —
including your visualiser — and you get a guaranteed failure that tells you nothing about
your own code.

```js
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(fs.readFileSync('embed.html', 'utf8'), {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  // jsdom has no ResizeObserver; without this the protocol block throws and
  // takes the visualiser down with it.
  beforeParse(window) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  },
});
const doc = dom.window.document;
const click = id => doc.getElementById(id).dispatchEvent(new dom.window.Event('click', { bubbles: true }));

// drive it the way a reader would, then assert on the result
click('nextBtn');
console.log(doc.getElementById('verdict').textContent);
console.log('errors:', errors); // must be empty
```

Walk every interactive path a reader could take — not just the happy path forward. The one
bug this actually catches in practice: an array/step index that overruns its bounds on the
*last* step (the "reveal" or "done" state), which only throws once you click past the normal
range. `jsdom` won't catch layout or visual issues — still open the file in an actual browser
once before upload if one's available — but it catches the silent-freeze class of bug for
free, and it's the check to run when nothing else is available.
