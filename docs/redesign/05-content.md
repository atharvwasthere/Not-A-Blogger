# PR 5 · Content work in the admin (no code)

## Why

Several things that look like design problems on the live site are data problems. They are fixed in the admin, after PRs 2–4 give the admin the fields.

## Topics (after PR 2)

Today seven of the eight posts have no tags and the bulk-download post has ten technology keywords, so the old sidebar listed one post's stack with every count at 1. Tags become **topics**: a handful of themes. Suggested mapping, which is the author's call:

| Post | Topics |
|---|---|
| How I Designed a Bulk-Download System That Could Actually Scale | distributed systems |
| The Other Half of Caching | distributed systems |
| The click that did nothing (sometimes) | debugging |
| The billing page took 4 seconds to show two text fields | debugging, performance |
| Optimizing My TanStack Start Bundle | performance |
| Why does macOS need a Linux VM to run a 'Linux' container? | under the hood |
| Turns Out Networking Class Was Worth It | under the hood |
| How I Spent 30 Minutes Configuring a Tool I Could Have Downloaded in 30 Seconds | tooling |

Remove the keyword tags (`aws lambda`, `s3`, `sqs`, `dynamodb`, `dynamodb streams`, `eventbridge pipes`, `streaming`, `concurrency`, `system design`).

## Excerpts (any time)

Excerpts are typed by hand (`blogs.excerpt`). Three are broken:

| Post | Problem |
|---|---|
| Bulk-download system | Ends mid-quote: `…could point at and say "` |
| Networking class | Starts with a section heading glued on ("The Firewall Didn't Know Who It Was Messing With TL;DR:") and is cut mid-word ("pushin") |
| (check all) | Every excerpt should be one to three whole sentences |

## Article extras (after PR 3)

- **Based on** for "The Other Half of Caching": *Scaling Memcache at Facebook*, by "Nishtala et al. · NSDI ’13", https://research.facebook.com/publications/scaling-memcache-at-facebook/
- **References** for the bulk-download post, each with a note in the author's own words:
  1. S3 zipper challenge (dev.to, AWS Builders): why it matters, STORE mode
  2. Zipping 15GB of S3 files in 6s (dev.to, AWS Builders): the UploadPartCopy follow-up
  3. archiver (npm): what V3 streams every file through

## Covers (after PR 4)

Suggested source image per post, all already inside the posts:

| Post | Source | Invert |
|---|---|---|
| Bulk-download system | The architecture diagram on its cover image, cropped right of the title (the post's only inline image is a meme) | auto |
| The Other Half of Caching | The diagram half of its cover image | auto |
| The click that did nothing | "How a click went missing" diagram | auto |
| The billing page took 4 seconds | DevTools timing waterfall | auto |
| Optimizing My TanStack Start Bundle | Bundle treemap | never |
| macOS needs a Linux VM | "Shared VM vs per-VM" sketch | auto |
| Networking class | Azure VPN connect screen | auto |
| 30 minutes on a tool | RTK / Caveman flow diagram | auto |

The first two need a crop that the admin does not offer; upload the cropped image first, then pick it as the source.
