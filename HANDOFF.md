# HANDOFF — KrtLab Repository Audit + Fix Session

**Date:** 2026-08-15
**Branch:** `feature/skills-passport-foundation`
**Base commit before this session's audit:** `4efcd51`

This file only claims what was directly verified against the repository filesystem this session. See `CURRENT_STATE.md` for the full audit that preceded these changes.

---

## What Changed

### 1. Fixed: TypeScript validation was failing (exit code 2)
`src/app/AppRouter.tsx` is dead, orphaned scaffold — verified no file imports anything from `src/app/`, and it depends on `react-router-dom` (not installed) plus four sibling files/directories that don't exist anywhere in the repo (`AppLayout`, `features/onboarding/OnboardingPage`, `features/dashboard/GrowthDashboard`, `features/mentor/GrowthAIMentor`, `features/skills/GrowthSkillGraph`). This alone made `npm run lint` (`tsc --noEmit`) fail with 6 errors.

**Fix:** added `"exclude": ["node_modules", "dist", "src/app"]` to `tsconfig.json`. Files left on disk, not deleted — either finish the router migration later (install `react-router-dom` + build the missing files) or delete `src/app/` outright in a future cleanup.

### 2. Fixed: `MonetizationSystem.tsx` — fake payment checkout (real bug, not a mock report exaggeration)
Previously: the "Upgrade to Premium" modal collected card number/expiry/CVC into React state, and on submit did **not** call any payment API — it just set `updateProfile({ isDemoMode: true })` locally and showed an Armenian "subscription activated successfully" toast. A user would believe they were charged real money; nothing was ever charged, and no subscription record existed anywhere (not Firestore, not any backend).

Also fixed in the same pass: a hardcoded fake creator payout balance ("$340.50") with no backing data anywhere in the codebase — replaced with an honest `$0.00` + "no real payout tracking yet" label, per the project's own spec principle of never displaying fabricated revenue.

**Fix, concretely:**
- Removed all card-number/expiry/CVC fields and the fake success path from `src/components/MonetizationSystem.tsx`.
- Added `src/services/subscriptionService.ts` (client) — calls the backend, never activates a plan locally.
- Added `POST /api/subscriptions/checkout` to `server.ts` — auth-verified (Firebase ID token), attempts a real checkout via the existing `paymentProviders.server.ts` abstraction. Since no payment provider is actually configured yet, it returns an honest `paymentAvailable: false` + explanatory message — it does **not** fake a successful checkout.
- Added a minimal `Subscription` type to `src/types.ts` for when this is wired to real persistence.

## Files Changed

```
 M server.ts                              (+36 lines: /api/subscriptions/checkout endpoint)
 M src/components/MonetizationSystem.tsx  (full rewrite: removed fake checkout, fake balance)
 M src/services/certificateService.ts     (no functional change — cleanup from a mid-session slip)
 M src/types.ts                           (+Subscription type)
 M tsconfig.json                          (+exclude src/app)
 A CURRENT_STATE.md                       (new — full verified audit)
 A HANDOFF.md                             (this file)
 A src/services/subscriptionService.ts    (new — honest checkout client)
```

## Tests Run

**No test suite exists in this repository** (verified: `npm test` → `Missing script: "test"`, no `*.test.ts(x)`/`*.spec.ts(x)` files found anywhere, no jest/vitest config). This was true before this session and is still true after — I did not add a test framework, because that would have been a separate, larger, unrequested change. It is the #1 recommended next task (see below).

## Exact Results

```
$ npm run lint    (tsc --noEmit)
Exit code: 0
0 errors, 0 warnings

$ npm run build   (vite build + esbuild server bundle)
Exit code: 0
✓ 3042 modules transformed, built in ~15-17s
dist/server.cjs written (118.1kb)
1 non-fatal esbuild warning: import.meta.dirname is empty in CJS output
  (falls back to __dirname via `||`, which works, but is fragile — see below)
```

Both checked **before and after** every change in this session — confirmed neither regressed.

## Remaining Problems (verified, not speculative)

1. **`CourseMarketplace.tsx` still has fabricated data** — a hardcoded course catalog including a fictional instructor ("Prof. Levon Sahakyan") with a fabricated 5.0 rating, and an "AI Generate Course" button that does not call Gemini or any backend — it fakes generation with `setTimeout()` + `Math.random()` and never persists the result (lost on refresh). **Not fixed this session** — flagged in `CURRENT_STATE.md` as the next highest-priority item after what was completed here.
2. **No test suite** — zero automated verification exists for any of the ~1MB `src/` tree.
3. **No deployment config in-repo** — no Dockerfile/railway.json/render.yaml/vercel.json/Procfile found. Deployment status is not verifiable from the filesystem.
4. **`src/app/`** is quarantined from type-checking but still physically present and still broken if anyone tries to build on it — needs a real decision (finish or delete).
5. **esbuild warning**: `import.meta.dirname || __dirname` in `server.ts`'s static-file-serving path is fragile in the CJS bundle output (works today only because of the `||` fallback).
6. **2.37MB main JS chunk** — Vite build warns this exceeds the 500KB recommended chunk size; not yet code-split.
7. **Payment provider is genuinely not configured** — both the certificate flow (from the prior session) and the new subscription flow are real, honest, working *up to* the point of needing a live payment provider (Stripe, Idram, Ameriabank, etc.). Suren needs to choose a provider and supply API keys before either flow can complete a real transaction. Until then, both correctly tell the user payment isn't available yet instead of faking success.

## Exact Next Recommended Task

**Fix `CourseMarketplace.tsx`'s fabricated course catalog and fake AI-generation button**, using the same pattern applied to `MonetizationSystem.tsx` and `CertificateGenerator.tsx` in this session and the prior one: replace the hardcoded fictional catalog with real Firestore-backed course data (the `courses`/`course_purchases` types already exist from the earlier Skills Passport foundation work), and either wire `handleAIGenerateCourse` to a real Gemini call (there's already a working pattern for this in `src/services/geminiService.ts` and in `server.ts`'s existing `/api/gemini/*` routes) or remove the fake-generation feature entirely until it can be real.
