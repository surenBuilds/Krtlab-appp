# KrtLab Technical Audit — 2026-10-29

## Scope and limits
Reviewed the repository's top-level build/deployment configuration, Firebase initialization, onboarding flow, user-profile synchronization, Firestore rules, Express Gemini routes, and the Vercel Gemini serverless handler. This is a source-code review, not a live penetration test. I did not access production data or deploy Firebase rules.

## Findings

### Critical — authorization policy permits self-assigned roles and shared lesson writes
- `firestore.rules` authorizes writes to a user's own `/users/{userId}` document after checking only a few fields. It does not constrain the `role` field or the set of writable fields. If any feature trusts the stored role, a user may be able to promote their own profile.
- Any authenticated user can create or update any `/lessons/{lessonId}` document. This allows tampering with shared learning content.
- **Mitigation in this PR:** new profile documents must use the Student role; profile updates cannot change the existing role; client writes/deletes to shared lessons are denied. The client lesson store no longer attempts shared lesson writes.
- **Deployment caution:** these Firestore rules are committed but are not deployed automatically. Existing privileged profiles must be audited, and trusted server-side lesson publishing is future work.

### High — unauthenticated Gemini API can incur provider costs
- `api/gemini.js` accepts POST requests without checking Firebase ID tokens, and the handler allows every origin via `Access-Control-Allow-Origin: *`. CORS is not authentication; callers can invoke the endpoint directly.
- Several handlers pass user-provided text to a paid model. There is no shared/global rate limit visible in this handler.
- **Mitigation in this PR:** require a valid Firebase ID token, remove wildcard CORS, reject malformed/oversized bodies, bound mentor history, validate progression feedback against the signed-in UID, and stop returning raw internal error messages to clients. Identity verification fails closed and times out after 8 seconds.
- **Remaining work:** add distributed rate limiting, per-user usage quotas, and cost monitoring before treating this endpoint as fully production-hardened. Firebase identity lookup is performed per request and must be load-tested.

### High — onboarding exposes privileged role selection
- The active onboarding in `src/App.tsx` and the secondary onboarding component previously let a new user choose Student, Teacher, or Admin without a visible approval flow. Public onboarding now defaults to Student and no longer asks for school/institution.
- **Recommendation:** default public signups to Student; assign teacher/admin privileges through a trusted administrative workflow.

### Medium — authentication success is not the same as profile completion
- Google/email auth success is shown before the user profile is necessarily complete. Profile creation/sync relies on the auth-state/profile flow; test new users, returning users, and multiple devices separately.
- The profile hook merges local data into Firestore when local XP is higher. This needs conflict-resolution tests to ensure a stale local profile cannot overwrite other newer fields.

### Critical — production dependency audit is failing
- The new CI gate `npm audit --omit=dev --audit-level=critical` currently fails on the branch.
- The report identifies critical advisories in `protobufjs`, `proxy-addr`, and `websocket-driver` (among additional high/moderate advisories). The lockfile must be regenerated using `npm audit fix` or targeted compatible dependency updates, followed by typecheck/build and a fresh audit.
- **Release blocker:** do not merge or launch publicly while the critical production dependency audit fails.

### Medium — project quality gates are incomplete
- `package.json` has `build` and `lint` scripts but no test script. `lint` runs TypeScript checking; there is no automated test suite configured in the scripts.
- `README.md` still contains generic AI Studio starter text rather than KrtLab setup, deployment, and environment documentation.

### Low — maintainability and diagnostics
- `src/App.tsx` is a large, multi-purpose component; consider splitting route/module responsibilities incrementally.
- The Firebase client performs a connection probe on a timer and ignores failures, which can create noisy or ambiguous diagnostics.

## PR changes
- Hardened the Vercel Gemini API wrapper against malformed and oversized request bodies and added Firebase ID-token verification via Identity Toolkit.
- Bounded mentor history and message fields.
- Removed wildcard CORS headers (same-origin frontend requests do not need them).
- Kept internal provider error details in server logs and returned a generic error to callers.
- Fixed the AI course generator course record, persisted generated course data in the user profile, exposed the builder in desktop/mobile navigation, and expanded the lesson schema/display.
- Added CI to check the Vercel API syntax, run TypeScript checks, audit production dependencies for critical vulnerabilities, and build production artifacts on pull requests.

## Validation status
- Source/config review completed.
- GitHub Actions passed API syntax checking and TypeScript checking on the latest security-gate run. The production build was skipped because the critical dependency audit failed; CI was reordered so the build runs before the audit on the next run. The dependency audit is a release blocker.
- Firestore rule changes are included in this PR but have not been deployed. They need a controlled deployment after reviewing existing roles and verifying the preview environment.
