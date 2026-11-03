# PR 2 · Notes archive and Topics

## Why

- Topics move from the sidebar into the top nav, as pages with their own URLs, so a topic can be shared and browsed. Today a tag only filters the home list in place (`/?tag=`).
- The landing page shows the latest post and a compact list. The full archive needs its own page: that is where the newspaper grid lives (covers arrive in PR 4).

## Data

No backend change. **Topics are the existing `tags` column.** The schema lowercases tags (`normalize_tags`), so the UI derives labels and slugs:

```ts
// theme/topics.ts
export const topicLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1) // "distributed systems" -> "Distributed systems"
export const topicSlug = (tag: string) => tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const topicTint = (tag: string) => `var(--tint-${topicSlug(tag)}, var(--tint-default))`
export const groupByTopic = (posts: Post[]) => /* Map<tag, Post[]>, sorted by post count desc, then name */
```

`topicTint` returns a CSS variable reference, never a colour value. A topic without its own tint falls back to `--tint-default`.

## Routes

### `/notes` (`routes/notes/index.tsx`, `browse` layout)

- Label `NOTES`, then the heading "Everything, newest first" in Geist Serif 46px.
- Every published post as a `NoteCard` in a newspaper grid: CSS columns, 3 on wide screens, 2 under ~1180px of content width, 1 on phones; `break-inside: avoid`.

`NoteCard`, one per post, linking to the post:
- background `topicTint(firstTag)`, radius 4px, padding `16px 18px 22px`
- the date in mono 12.5px uppercase, ink (`SEP 1, 2026`)
- the title in Geist Serif 27px / 1.15, ink
- the topics in mono 12px uppercase, body colour (`DISTRIBUTED SYSTEMS`)
- *(PR 4: the cover goes here)*
- the excerpt in Newsreader 17px / 1.5, ink

The landing page's "Recently published" gets its "View all notes →" link to `/notes`.

### `/topics` (`routes/topics/index.tsx`, `browse` layout)

- Label `TOPICS`, then the heading "What I write about".
- One row per topic, separated by `border-rule`. Desktop grid `260px | 1fr`:
  - left: the topic name in Geist Serif 30px, linking to its page, with the count below it in mono uppercase, soft (`2 NOTES`)
  - right: that topic's posts as `NoteRow`s

### `/topics/$topic` (`routes/topics/$topic.tsx`, `browse` layout)

- The label is a link `TOPICS /` back to the index, then the heading is the topic label.
- Its posts as the `NoteCard` grid.
- Unknown topic → the existing `NotFound`.
- `head`: title `Debugging — Not a Blogger`, plus a description.

### Redirect old links

`/?tag=debugging` → `/topics/debugging` (`redirect` in the index route's `beforeLoad`). Remove the in-place filter UI from `routes/index.tsx`.

### Nav and search

- `SiteNav` shows **Topics**; it is active on `/topics` and `/topics/*`.
- Make `CommandPalette` items show topic labels via `topicLabel`.

## Acceptance

- [ ] `/notes` lists all published posts newest first, in the tinted grid; 3 / 2 / 1 columns at desktop, narrow desktop and phone.
- [ ] `/topics` lists every topic with its posts; each topic links to `/topics/<slug>`.
- [ ] `/?tag=x` redirects to `/topics/x`.
- [ ] A topic with no tint of its own renders with `--tint-default`.
- [ ] All three pages work in light and dark.

## Tests

- `theme/topics.test.ts`: label, slug (spaces, punctuation, case), `groupByTopic` ordering, tint fallback string.
- Route smoke tests where the project already has them; otherwise `tsc` and build.
