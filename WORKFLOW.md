# Publishing workflow: Claude → GitHub → Netlify

```
 ┌──────────────┐  edit content/*.json   ┌──────────────┐  git push main   ┌──────────────┐  webhook   ┌───────────────────────────┐
 │ Claude       │ ─────────────────────▶ │ local check  │ ───────────────▶ │ GitHub repo  │ ─────────▶ │ Netlify build             │
 │ (chat or     │                         │ build.js +   │                  │ coderepo139/ │            │ node build.js             │
 │  scheduled   │                         │ check.js     │                  │ aipromptHindii│            │ && node scripts/check.js  │
 │  task)       │                         └──────┬───────┘                  └──────┬───────┘            └────────────┬──────────────┘
 └──────────────┘                                │ ✗ fails → nothing pushed        │ GitHub Action                  │ ✓ passes → live in ~1 min
                                                 ▼                                 ▼ "Site check" ✓/✗               │ ✗ fails → old version stays live
                                          fix and retry                    visible on every commit/PR               ▼
                                                                                                         aiprompthindi.netlify.app
```

Three gates protect the live site: the local check before pushing, the GitHub Action on every commit, and the same check inside the Netlify build. A failed Netlify build never replaces the live site — the previous good deploy keeps serving.

## Day-to-day: publish a change
1. Edit or add files in `content/` (new post: copy `templates/post.json` to `content/<slug>.json`; the slug must match the file name).
2. Run `scripts/publish.sh "Add: <slug>"`. It builds, runs the check, commits and pushes to `main`. If the check fails, nothing is pushed.
3. Netlify builds automatically. The site updates in about a minute.

## Fast path: a new AI photo trend (live in 24–48 h)
1. Spot the trend (Instagram Reels, Google Trends "Rising", Ubersuggest autocomplete).
2. `node scripts/new-trend.js <slug> "<Trend name>" "keyword 1, keyword 2"` → creates `content/<slug>.json` dated today with `"trend": true`.
3. Replace every `TODO` (title, description, intro, 6–12 prompts ending in the face line). `check.js` refuses to publish while any `TODO` is left.
4. `scripts/publish.sh "Trend: <slug>"`. The page appears with a 🔥 badge at the top of the home page and `/prompts/`.
5. When the trend fades (2–4 weeks), delete `"trend": true`; the page stays in the normal gallery.

## Seasonal pages
Publish festival pages 3–5 weeks before the date (never later than 10 days). Christmas and New Year 2027 were written on 14 Nov and go live from 15 Nov.

## Review before going live (optional)
- `scripts/publish.sh "Draft: <slug>" --branch draft/<slug>` pushes to a branch.
- Open a pull request on GitHub → Netlify posts a **deploy preview** link on the PR.
- Merge the PR → `main` deploys to the live site.

## Scheduled posts
A post with a future `date` is skipped by the build. To make it appear on that day without a new commit, add a Netlify **build hook** (Project configuration → Build & deploy → Build hooks) and call it daily, or just let the next publishing run rebuild the site.

## Scheduled runs and GitHub access
Scheduled runs clone and push with plain `git` — the session's git proxy authenticates them (verified 22 Oct 2026). They have no `add_repo` tool and `gh` is not logged in; neither is needed. The proxy refuses deleting remote branches, so runs never create test branches.

A scheduled task only gets GitHub access if it was created after the repo was attached to the conversation that created it. The first daily and weekly tasks (21 Oct) predated that, so the 23 Oct run's push was denied ("not in this session's authorized repository set"). Both were recreated on 23 Oct and the old ones disabled. If a run reports **PUSH FAILED**, the work is saved under `site/` in the Project. Apply it with `git am` from a chat session, then recreate the task from that chat.

## Rolling back
- Netlify: Deploys → pick an earlier deploy → **Publish deploy** (instant).
- Git: `git revert <commit> && git push` (permanent fix; Netlify redeploys).

## One-time setup (owner)
1. GitHub: repo `coderepository139/aipromptHindii` exists, and the Claude GitHub app has access to it (github.com/settings/installations → Claude → Configure → Repository access).
2. Netlify: app.netlify.com/projects/aiprompthindi → Project configuration → Build & deploy → **Link repository** → GitHub → `aipromptHindii`, branch `main`. Leave build settings empty — `netlify.toml` provides them.
3. Optional: Netlify → Environment variables → `GA4_ID`, `GSC_TOKEN`, and `SITE_URL` once a custom domain is connected.

## Where the source lives
- **GitHub repo** (github.com/coderepository139/aipromptHindii) is the source of truth for the site. Status: connected to Netlify, auto-deploys on every push to `main` (verified 22 Oct 2026).
- The claude.ai Project ("blog post") keeps a mirror under `site/` as a backup and for scheduled runs; keep it in sync after each publish.
