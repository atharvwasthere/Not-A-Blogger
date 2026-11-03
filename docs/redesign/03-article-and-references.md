# PR 3 · Article page: share, "Based on", References

## Why

- **Copy link / Share.** Most readers arrive on an article from a shared link, and sharing it onward is the one action they take. One quiet button, no icon row.
- **"Based on".** The paper series ("I shipped X, then read the paper that invented it") is built around one source. The reader should see that source before reading a word, instead of finding it buried in paragraph four.
- **References.** For the reader who has finished and wants more. A plain list of the links already in the text would be a copy, so every reference carries one line from the author on why it is worth the reader's time. **A link without a note does not belong here** and stays in the text.

## 1. Article header (`routes/blog/$slug.tsx`, `read` layout)

```
SEP 1, 2026 · 17 MIN READ · Updated Sep 8                  🔗 Copy link
How I Designed a Bulk-Download System That Could Actually Scale
BASED ON  Scaling Memcache at Facebook  Nishtala et al. · NSDI ’13     ← paper posts only
──────────────────────────────────────────────────────────────────
article…
```

- Meta line: mono 13px uppercase, soft. "Updated …" in italic, no uppercase, shown when the update is a day or more after publishing.
- Title: Geist Serif `clamp(36px, 6cqi, 56px)`, ink.
- Column: 680px.
- Keep all existing SEO `head` tags exactly as they are.

### `CopyLinkButton` + `useShare()`

```ts
// features/blog/hooks/useShare.ts
const { mode, share } = useShare(url, title)
// mode: 'share' when navigator.share exists and the pointer is coarse (phones), otherwise 'copy'
// share(): Promise<'done' | 'cancelled'>; copy uses navigator.clipboard, with a text-selection fallback
```

Label: "Copy link" with a link icon, or "Share" with a share icon. The animation copies `SubscribeForm` (motion/react, `AnimatePresence mode="wait"`):

1. The label slides up and out: `y: 0 → -20`, opacity → 0.
2. The icon flies right: `x: +70`, scale → 0.5, opacity → 0, over 0.65s, ease-in-out (the envelope's move).
3. "✓ Copied" / "✓ Shared" pops in: scale 0.5 → 1 with a slight overshoot.
4. After 1.5s it shrinks out and the label rises back in from `y: 20`.

Rules:
- The button keeps a fixed width (min 92px), so the date line never shifts while it animates.
- If the share sheet is cancelled, go straight back to the label with no success state.
- With `prefers-reduced-motion`, swap states instantly.
- Announce "Link copied" through an `aria-live="polite"` region.

## 2. "Based on"

**Backend**
- New nullable JSONB column `blogs.based_on`, with an alembic migration.
- Schema:

```python
class BasedOn(BaseModel):
    title: str = Field(..., min_length=2, max_length=300)
    by: Optional[str] = Field(None, max_length=200)   # "Nishtala et al. · NSDI ’13"
    url: HttpUrl
```

- Add `based_on: Optional[BasedOn] = None` to `PostInput` and to `PostOutput`/`PostSummary`, and to the frontend `Post` type.
- MCP `create_draft` / `update_draft` accept an optional `based_on`.

**Admin (`PostEditor`)**
- An optional section "Based on (research paper)" with title, by and link inputs.
- An empty title saves `null`.

**Article**
- `BasedOn` renders only when `post.based_on` is set:
  - the label `BASED ON` in mono 11px soft
  - the title as an italic Newsreader 19px link, ink, underlined in `--rule`
  - `by` in mono 12px soft
- A bottom border separates it from the article.

## 3. References

### HTML contract

Post content stores references as HTML that the editor, the MCP agent and the article page all agree on. It must read correctly with no JavaScript (a heading and a list):

```html
<section data-references="">
  <h2>References</h2>
  <ol>
    <li data-kind="article">
      <a href="https://dev.to/aws-builders/s3-zipper-challenge-a-parallel-zip-assembly-that-beats-the-single-lambda">S3 zipper challenge: a parallel zip assembly that beats the single Lambda</a>
      <span data-source="">dev.to · AWS Builders</span>
      <p data-note="">Read this for STORE mode: when the archive layout is fixed in advance, you can build the zip in parallel.</p>
    </li>
    <li data-kind="package">
      <a href="https://www.npmjs.com/package/archiver">archiver</a>
      <span data-source="">npm package</span>
      <p data-note="">What V3 streams every file through on its way into the multipart upload.</p>
      <code data-install="">npm i archiver</code>
    </li>
  </ol>
</section>
```

Kinds: `article`, `paper`, `repo`, `package`.

### Editor node (`features/editor/extensions/References.ts`)

Model it on `Embed.ts`:
- An atom block node `references` with one attribute, `items: Reference[]`, parsed from and rendered to the contract above.
- Inserted with the slash command `/references`. **One per post**: if the post already has one, the command scrolls to it and opens it.
- New references are appended at the end of the post.
- Node view: a card listing the items, with Add, Edit, Remove and drag-to-reorder. Editing an item shows inline fields:
  - **URL** first. Pasting it detects the kind and pre-fills the rest.
  - **Kind** (editable)
  - **Title**
  - **Source line**
  - **Note** (required: Save stays disabled until it has text)
  - **Install** (package only)

```ts
// features/editor/extensions/referenceKind.ts
detectReference(url) -> { kind, source, install? }
// github.com/<o>/<r>           -> repo,    source "github · <o>/<r>"
// npmjs.com/package/<p>        -> package, source "npm package",  install "npm i <p>"
// pypi.org/project/<p>         -> package, source "PyPI package", install "pip install <p>"
// arxiv.org, usenix.org, dl.acm.org, acm.org, ieeexplore.ieee.org, research.* -> paper, source = host
// anything else                -> article, source = host without "www."
```

### Article rendering

After the post HTML mounts, enhance `section[data-references]`, the same way embeds and code highlighting are handled today:
- Replace its `h2` with a full-width button: `REFERENCES` in mono 12px, weight 500, letter-spacing 0.12em, ink; a hairline filling the remaining width; and a chevron at the end.
- **Collapsed by default.** Opening animates `grid-template-rows: 0fr → 1fr` over 0.4s, and the list fades and lifts in (`translateY(-8px) → 0`). The chevron rotates 180°.
- While closed, the list has the `inert` attribute so its links cannot be tabbed to.
- Without JavaScript, the list is simply shown open.

Each item:

```
[1]  ▤  S3 zipper challenge: a parallel zip assembly that beats the single Lambda     ← Newsreader 19px ink (italic for papers)
        dev.to · AWS Builders                                                         ← mono 12.5px soft
        │ Read this for STORE mode: when the archive layout is fixed in advance…      ← Newsreader italic 17px body, 1px rule on the left
        $ npm i archiver                                              [copy]          ← packages only, mono on wash
```

- The number is mono 12px soft. The glyph is 16px soft and differs by kind (document, paper, branch, box).
- Items are separated by `border-rule`.
- The install line's copy button reuses `useShare`'s clipboard path.

### MCP (`backend/mcp_server/server.py`)

- Add `"section"` to `EDITOR_TAGS`.
- In `_EditorHTMLCheck`, accept `section[data-references]` and check the contract:
  - every `li` has `data-kind` set to one of the four kinds
  - every `li` has exactly one `a[href]`
  - every `li` has a non-empty `p[data-note]`
  - otherwise raise "Each reference needs a link and a note".
- Document the contract in `INSTRUCTIONS`, with the example above.

## Acceptance

- [ ] Copy link copies the canonical post URL and animates. On a phone it opens the share sheet. Cancelling the sheet returns to the label without "Shared".
- [ ] "Based on" shows on a post that has it and is absent everywhere else.
- [ ] `/references` inserts one block; a second `/references` focuses the existing one.
- [ ] A saved post reopens in the editor with every reference intact (round trip).
- [ ] On the article, References starts closed, opens and closes with the animation, and its links cannot be tabbed to while closed.
- [ ] An MCP draft containing a valid references block is accepted; one with a missing note is rejected with a clear message.

## Tests

**Backend**
- `based_on` validation: http(s) only, title length, `null` clears it.
- The migration upgrades and downgrades.
- MCP accepts a valid references block and rejects a missing note, a bad kind or a missing link.

**Frontend**
- `References.test.ts`: round trip through saved HTML, modelled on `Embed.test.ts`.
- `referenceKind.test.ts`: every row of the detection table.
- `useShare.test.ts`: chooses copy vs share; a clipboard failure falls back; a cancelled share returns `'cancelled'`.
