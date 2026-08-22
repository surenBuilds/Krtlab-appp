# KrtLab Agent Work History

This document records engineering work history and agent task executions for
the KrtLab (Կրթլաբ) project.

## How to read this document
Every claim below is tagged with a confidence source:
- **VERIFIED** — checked directly against the actual repository content
  (file existence, grep, or code read) at the commit cited.
- **INFERRED** — a reasonable conclusion from verified evidence, but not
  itself directly checked (e.g. "X likely handles Y because it's the only
  file that imports Z").
- **UNKNOWN** — not yet checked either way; do not treat as fact.
- **HISTORICAL** — a claim a past entry made that has since been checked and
  is recorded here for traceability, not as current truth.

**Evidence hierarchy for this project** (see also
`surenBuilds/suren_coding_agent`'s `memory/krtlab/decisions.md`):

```
Repository / runtime evidence
        ↓
Verified inspection (this document, architecture.md)
        ↓
Architecture / decisions (decisions.md)
        ↓
Agent memory
        ↓
Agent assumptions
```

**Invariant: no memory claim in this document, architecture.md, decisions.md,
or agents.md may override directly verified repository evidence.** If a claim
here conflicts with what you actually find in the repo, the repo wins — update
this document, don't trust the old entry.

---

## HISTORICAL — correction record (2026-08-22)

An earlier version of this file, added in commit `51ff2a8` ("KrtLab:
synchronize latest workspace implementation"), stated:

> Project: KrtLab / Կրթլաբ (React 19, TypeScript, Vite, Tailwind CSS,
> **Supabase**, Vercel)
>
> Analyzed core architecture, component modules (`src/components/AiMentor.tsx`,
> `src/lib/persistence.ts`, `src/lib/progress.ts`)

**This was checked against the actual repository at commit `f325e00` and found
to be wrong on every specific claim:**

| Claim | Status | Evidence |
|---|---|---|
| Supabase is part of the stack | **FALSE — RETRACTED** | `grep -rli supabase` across all `.ts`/`.tsx`/`.json` in the repo (excluding `node_modules`) returns **zero matches**, checked at commit `f325e00`. |
| `src/components/AiMentor.tsx` exists | **FALSE (wrong path)** | File does not exist. The real file is `src/components/AIMentor.tsx` (capital "AI") — VERIFIED to exist at commit `f325e00`. |
| `src/lib/persistence.ts` exists | **FALSE — RETRACTED** | File does not exist anywhere in the repository. No file by this name or equivalent single-purpose "persistence manager" was found. |
| `src/lib/progress.ts` exists | **FALSE — RETRACTED** | File does not exist. Progress-related logic appears to live in `src/hooks/useUserProfile.tsx` and `src/hooks/useGrowthProfile.ts` instead (INFERRED from filenames/grep for "progress" — not yet read in full, so treat their exact responsibilities as UNKNOWN until inspected). |

These false claims also appeared in `surenBuilds/suren_coding_agent`'s own
`memory/krtlab/architecture.md` and `known-issues.md` and have been corrected
there as well (see that repo's `memory/krtlab/decisions.md` for the
corresponding decision record). The root cause in both places was the same:
a claim written without tracing it against actual repository content.

---

## VERIFIED — current architecture facts (as of commit `f325e00`)

- **Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, Express server
  (`server.ts`) — VERIFIED via `package.json` and direct file listing.
- **Persistence**: Firebase/Firestore + LocalStorage. `src/lib/firebase.ts`
  exists and is imported by `src/hooks/useLessonStore.ts`,
  `src/hooks/useUserProfile.tsx`, and `src/components/CommunitySection.tsx` —
  VERIFIED via `grep -rl "from 'firebase"`.
- **No Supabase** anywhere in the repository — VERIFIED, see table above.
- **AI Mentor component**: `src/components/AIMentor.tsx` — VERIFIED to exist
  (file listing). Its actual implementation/behavior has not been read in
  full as part of this correction pass — treat internals as UNKNOWN until
  inspected.
- **AI Learning Engine contracts and validation**: see
  `server/schemas/aiResponses.ts` and `server/utils/validateAIResponse.ts`,
  added in PR #2 (`harden-ai-output-validation` branch). The real
  `generateLessonContent` / `generatePracticeLabTask` response shapes are
  documented there with file-path citations.

## UNKNOWN — not yet verified, do not assume
- Exact responsibilities of `useUserProfile.tsx` vs `useGrowthProfile.ts` for
  progress/streak tracking.
- Full internal behavior of `AIMentor.tsx`.

---

## Completed Work Items (VERIFIED against actual commits)
1. **AI Learning Engine output validation hardening** — Zod schemas + validation
   pipeline added for `generateLessonContent`, `generatePracticeLabTask`,
   `extractTermsFromLesson`, `analyzeProgress`. See PR #2
   (`harden-ai-output-validation` → `main`). 18 vitest tests passing, `tsc`
   clean, build succeeds — verified directly, not merely claimed.
2. **package-lock.json restoration** (commit `f325e00`) — the lockfile was
   deleted directly on `main` by commit `51ff2a8` with no review; restored
   from the current `package.json`. See `suren_coding_agent`'s
   `memory/krtlab/decisions.md` for the resulting protected-branch approval
   policy change.
3. **This document's correction** (commit that introduces this version) —
   see the HISTORICAL section above.
