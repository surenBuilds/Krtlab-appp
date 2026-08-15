# KrtLab — Current State (Verified Audit)

**Audit date:** 2026-08-15
**Branch audited:** `feature/skills-passport-foundation` (HEAD `4efcd51`, working tree clean)
**Method:** Every claim below was produced by running a command against the actual repository filesystem, not from memory or prior reports. Raw command output is quoted where relevant.

---

## 1. Actual Project Architecture

- **Type:** Single-repo full-stack web app. `"name": "react-example"` in `package.json` (project has not been renamed from its scaffold name).
- **Frontend:** React 19 + Vite 6 + Tailwind 4, single-page, **no router library installed**. Navigation is done via component/tab state inside `src/App.tsx` (72KB, monolithic).
- **Backend:** One Express server (`server.ts`, 16KB) serving both API routes and (in production) the built SPA as static files. Dev mode runs Vite in middleware mode inside the same Express process (`npm run dev` → `tsx server.ts`).
- **Build:** `vite build` (frontend) + `esbuild` bundling `server.ts` to `dist/server.cjs` (backend). `npm start` runs `node dist/server.cjs`.
- **Data:** Firebase/Firestore (client SDK `firebase@12`, admin SDK `firebase-admin@14` added this session for server-side writes). Non-default Firestore database ID (`firebase-applet-config.json` → `firestoreDatabaseId`), not `(default)`.
- **AI:** Google Gemini via `@google/genai`, called both from the client (`src/services/geminiService.ts`) and server (`server.ts` routes under `/api/gemini/*`).
- **State/hooks:** `useUserProfile`, `useTranslation`, `LessonContext` — React Context, no Redux/Zustand.

## 2. Existing Modules (verified present under `src/components`)

Learning core: `LearningModule`, `LanguageModule`, `AIMentor`, `QuizMentor`, `FlashcardSystem`, `LearningPaths`, `PracticeLab`, `PracticalScenarioView`, `InteractiveLab`, `InteractiveSim`, `ModulePage`, `VoiceTutor`, `LessonAudioPlayer`.

Gamification: `GamesSection`, `GameCreator`, `games/{GameEngine,SimulationGame,SortingGame,MemoryMatch,ApplicationScenario}`, `DailyChallenge`, `AchievementsList`, `StreakCalendar`, `DisciplineSystem`, `ExerciseTimer`.

Growth-OS layer (spec-aligned): `SkillGraph`, `PersonalLearningProfile` (Skills Passport — rewritten this session to use real computed data), `CareerCenter`, `OrganizationDashboard`, `DeveloperPlatform`, `MonetizationSystem`, `MentorMarketplace`, `CourseMarketplace`, `CertificateGenerator`, `CertificateVerificationPage` (new this session), `GoalDiscovery`, `GoalsSection`, `CommunitySection`, `Dashboard`.

Services (`src/services`): `geminiService.ts`, `adaptiveGameService.ts`, `optimizationService.ts`, `skillsService.ts`, `portfolioService.ts`, `certificateService.ts`, `paymentProviders.server.ts` — the last four added this session.

`src/lib`: includes `firebase.ts` (client init) and `firebaseAdmin.ts` (server-only admin init, added this session).

## 3. Missing Modules (verified absent, not "not yet checked")

- **No test framework or test files anywhere.** `grep`/`find` for `*.test.ts(x)`, `*.spec.ts(x)`, jest/vitest config: zero results. `package.json` has no `test` script. `npm test` fails with `Missing script: "test"`.
- **No routing library.** `react-router-dom` is not in `package.json` dependencies and is not installed in `node_modules`.
- **No deployment config in-repo.** No `Dockerfile`, `railway.json`/`railway.toml`, `render.yaml`, `vercel.json`, or `Procfile` found anywhere in the repo.
- **No CI config.** No `.github/workflows`.
- **No real payment provider integration.** `paymentProviders.server.ts` (added this session) is an abstraction with zero live providers wired in; `MonetizationSystem.tsx` (pre-existing) collects card fields but never charges anything (see Known Bugs).
- **No "Development OS" or "market intelligence" module.** Repo-wide search for these terms (case-insensitive, `.md`/`.ts`/`.tsx`) returns zero matches. These are not concepts that exist in this codebase — flagged explicitly because a prior instruction referenced them and I will not fabricate a status for something that isn't there.

## 4. Current Test Results

```
$ npm run test
npm error Missing script: "test"
```
**No test suite exists. This is not "0 passing" — there is nothing to run.**

## 5. Current TypeScript Result

**Before this session's fix:**
```
$ npm run lint  (= tsc --noEmit)
src/app/AppRouter.tsx(2,71): error TS2307: Cannot find module 'react-router-dom'...
src/app/AppRouter.tsx(3,27): error TS2307: Cannot find module './AppLayout'...
src/app/AppRouter.tsx(4,32): error TS2307: Cannot find module '../features/onboarding/OnboardingPage'...
src/app/AppRouter.tsx(5,33): error TS2307: Cannot find module '../features/dashboard/GrowthDashboard'...
src/app/AppRouter.tsx(6,32): error TS2307: Cannot find module '../features/mentor/GrowthAIMentor'...
src/app/AppRouter.tsx(7,34): error TS2307: Cannot find module '../features/skills/GrowthSkillGraph'...
Exit code: 2  (FAIL)
```
Verified `src/app/AppRouter.tsx` is orphaned: no file under `src/` imports anything from `src/app/`, and `src/main.tsx` (the actual entry point) never references it. It depends on `react-router-dom` (not installed) and four sibling files/directories (`AppLayout`, `features/onboarding`, `features/dashboard`, `features/mentor`, `features/skills`) that do not exist anywhere in the repo. This is leftover scaffold from an abandoned router migration.

**After this session's fix** (`tsconfig.json` now excludes `src/app`, files left on disk, not deleted):
```
$ npm run lint
Exit code: 0, 0 errors  (PASS)
```

## 6. Current Build Result

```
$ npm run build
vite v6.4.1 building for production...
✓ 3042 modules transformed.
dist/index.html                        0.41 kB
dist/assets/index-D-_l9Jd6.css        99.50 kB
dist/assets/purify.es-BgtpMKW3.js     22.77 kB
dist/assets/index.es-B15hylM8.js     159.60 kB
dist/assets/index-CvZyTZnU.js      2,374.93 kB   ← exceeds 500KB chunk-size warning threshold
✓ built in ~17-28s
dist/server.cjs      116.9kb
Exit code: 0  (PASS)
```
One non-fatal esbuild warning: `import.meta.dirname` is empty in the CJS server bundle output (falls back to `__dirname` via `||`, which does exist in CJS, so this does not currently break static-file serving, but it is worth noting as fragile).

**Verified working both before and after the tsconfig fix** — the fix only affects `tsc`/`npm run lint`, not the Vite/esbuild build pipeline (Vite does not typecheck by default).

## 7. Deployment Status

**Not verifiable from this repository.** No deployment manifests exist in-repo (see Missing Modules). Memory of prior sessions references Railway/Render/Vercel deployments for *other* KrtLab-adjacent projects, but nothing in this repo's files confirms where or whether *this* app is currently deployed. I am not asserting a live deployment exists or doesn't — it is simply not verifiable from the filesystem, and per instructions I will not fabricate a status here.

## 8. Market Intelligence Status

**Not present in this codebase.** No module, service, file, or documentation reference to "market intelligence" exists anywhere in the repo (verified by repo-wide search). Not applicable to this audit.

## 9. Development OS Status

**Not present in this codebase.** Same as above — zero references anywhere in `KrtLab-appp`. (Note: Suren has a separate, different project referred to informally as a coding agent in other contexts, but that is a different repository, not something present here.)

## 10. Known Bugs (verified by reading the actual component logic, not just grepping for the word "mock")

A prior report in this conversation claimed several components (`CareerCenter`, `OrganizationDashboard`, `MentorMarketplace`, `CourseMarketplace`, `GameCreator`) were mock/TODO-laden. **Re-verified this session and that claim was mostly wrong** — most of the earlier grep hits were just HTML `placeholder="..."` input attributes, not mock logic. Correcting the record:

1. **`MonetizationSystem.tsx` — fake payment flow (real bug).** `handleCheckout()` collects card number/expiry/CVC into React state, then on submit does not call any payment API — it just sets `updateProfile({ isDemoMode: true })` and shows a Armenian-language "subscription activated" success toast. A user believes they were charged; nothing was charged, and no real subscription record is created anywhere (not Firestore, not the new `payments`/`subscriptions` types added this session). Code comment even says `// Mocking premium state using isDemoMode flag`.
2. **`CourseMarketplace.tsx` — fabricated course catalog and fake "AI generation" (real bug).** `INITIAL_COURSES` is a hardcoded array including a fictional named instructor ("Prof. Levon Sahakyan") with a fabricated 5.0 rating and fabricated enrollment counts. `handleAIGenerateCourse()` does not call Gemini or any backend — it does `setTimeout(...)` + `Math.random()` to fabricate `lessonsCount`/`durationHours` and injects a fake "AI-generated" course into local state only (lost on refresh, never persisted to Firestore). `handleEnroll()` for paid courses (`price > 0`) shows a "purchased" success toast with no real payment.
3. **`CertificateGenerator.tsx` — fixed earlier this session, verified still fixed.** Previously generated a random fake serial number, pointed its QR code at a non-existent `krtlab.edu` domain, and used a scraped image of a real named individual's signature as a fake "Academic Board" signature. Re-checked this audit: confirmed removed, replaced with an honestly-labeled free "achievement record" plus a real backend-gated Verified Certificate request flow.
4. **`server.ts` production static-serving path** uses `import.meta.dirname || __dirname` in code that gets bundled to CJS — `import.meta.dirname` is empty/undefined in CJS per esbuild's own warning, so this silently relies on the `||` fallback. Works today, but fragile if that fallback pattern is ever refactored without re-testing the CJS bundle.
5. **`src/app/AppRouter.tsx`** — dead, non-compiling scaffold (see TypeScript section). Fixed this session via `tsconfig.json` exclude; files still exist on disk and should either be finished (install `react-router-dom` + build the missing files) or deleted outright in a future cleanup — currently just quarantined from type-checking.

## 11. Recommended Next Tasks (priority order, based only on what's verified above)

1. **Fix or remove `MonetizationSystem.tsx`'s fake checkout** — highest priority of the remaining items, since it's user-facing deception about a real (if fictional) money transaction. Either wire it to the real `paymentProviders.server.ts` abstraction added this session, or clearly gate it behind a "Coming Soon" state until a real provider is configured.
2. **Fix or remove `CourseMarketplace.tsx`'s fabricated catalog and fake AI generation** — replace `INITIAL_COURSES` with real Firestore-backed course data (ties into the `courses`/`course_purchases` types already added), and either wire `handleAIGenerateCourse` to a real Gemini call (`geminiService.ts` already has patterns for this) or remove the feature until it can be real.
3. **Add a minimal test setup** (e.g. Vitest, since it integrates cleanly with the existing Vite config) — there is currently zero automated verification of any logic in this ~1MB `src/` tree.
4. **Decide the fate of `src/app/`** — finish the router migration for real, or delete the dead files instead of just excluding them from `tsc`.
5. **Address the Vite chunk-size warning** (2.37MB main bundle) via code-splitting/dynamic imports before this becomes a real mobile-performance problem — flagged as a warning, not yet a hard failure.
