# KrtLab Growth OS — Product & Technical Blueprint

## Product definition

KrtLab is a Personal & Professional Growth Operating System. Its core loop is:

**Goal → AI-generated roadmap → structured learning → evidence-based assessment → qualification → knowledge marketplace / opportunity marketplace → career feedback loop.**

The platform must not be treated as a collection of disconnected pages. Every module consumes and updates the same learner profile, skills graph, learning evidence, and career preferences.

## 1. Primary user journeys

### 1.1 Goal to roadmap
1. A learner tells the AI Mentor a concrete goal (for example, "become a UI/UX designer").
2. The Mentor asks for missing context: current level, available time, language, preferred learning format, and target timeframe.
3. The roadmap generator creates ordered milestones. Each milestone contains:
   - target competencies and observable skill criteria;
   - recommended KrtLab courses and external resources;
   - practice tasks and portfolio projects;
   - estimated effort and prerequisites;
   - assessment method and completion criteria.
4. The learner reviews and accepts the roadmap. The roadmap is versioned so AI revisions do not silently erase progress.

### 1.2 Learning and progress evaluation
1. Courses are mapped to explicit skills and learning outcomes.
2. Lessons, quizzes, assignments, and projects produce evidence records.
3. The AI Mentor reviews submitted evidence against a rubric, explains strengths and gaps, and recommends the next activity.
4. AI feedback is advisory. High-impact qualification decisions require defined rubrics and, where appropriate, human review.
5. Learners can see why a skill level was assigned and what evidence supports it.

### 1.3 Qualification
1. A professional pathway defines required skills, minimum proficiency, and required portfolio evidence.
2. Completion is based on demonstrated competencies—not merely watching lessons or clicking "complete".
3. On successful assessment, KrtLab can issue a verifiable KrtLab certificate/profile credential with an ID, issue date, pathway, criteria, and evidence summary.
4. Credentials must clearly state that they are KrtLab-issued; they must not imply government or third-party accreditation unless formally obtained.

### 1.4 Knowledge marketplace
Learners who have sufficient evidence can publish:
- paid or free courses;
- mentoring sessions;
- workshops and learning materials;
- professional services (as a later extension).

A course listing should include instructor profile, learning outcomes, level, prerequisites, curriculum, format, language, price, refund/cancellation terms, reviews, and moderation status. Course publication should require content review and clear ownership/licensing declarations.

### 1.5 Opportunity marketplace
Organizations and verified recruiters can publish:
- jobs;
- internships and apprenticeships;
- volunteer roles;
- project-based work and short-term collaborations.

Each listing should include organization verification, role type, location/remote policy, age or eligibility requirements where relevant, compensation (or clearly marked unpaid status), required skills, application deadline, and application method.

The AI Mentor recommends opportunities by comparing verified profile skills and evidence with listing requirements. It must explain match reasons and missing skills; match scores are guidance, not guarantees of hiring.

## 2. Core product modules

1. **AI Mentor** — goal intake, clarifying questions, roadmap generation, progress coaching, opportunity matching.
2. **Growth Dashboard** — goals, roadmap milestones, learning activity, skill progression, evidence, and next actions.
3. **Learning Studio** — courses, lessons, quizzes, assignments, projects, and feedback.
4. **Skills Graph** — normalized skills, proficiency levels, prerequisites, and evidence links.
5. **Qualification Center** — pathway criteria, assessments, human review where required, credential issuance and verification.
6. **Knowledge Marketplace** — instructor onboarding, course creation, publishing, discovery, enrollment, reviews, and payments.
7. **Opportunity Marketplace** — organization onboarding, listings, search, recommendations, applications, and application tracking.
8. **Professional Profile** — portfolio, projects, credentials, experience, preferences, and visibility controls.
9. **Organization Workspace** — organization verification, team roles, listing management, candidate review, and analytics.
10. **Platform Administration** — moderation, reports, disputes, credential revocation, audit logs, and abuse prevention.

## 3. Shared domain model

The implementation should converge on these domain entities (names are conceptual; adapt to existing TypeScript conventions):

- UserProfile: identity, locale, age/eligibility settings, privacy preferences, career preferences.
- Goal: owner, description, target role/outcome, status, target date.
- Roadmap: goal, version, status, generated rationale, milestones.
- RoadmapMilestone: ordered learning outcomes, required skills, course/resource references, tasks, assessment criteria.
- Skill: canonical skill ID, label, category, prerequisites.
- SkillEvidence: owner, skill, source type, source ID, rubric, reviewer/AI metadata, evidence URL/reference, timestamp.
- Course: instructor, curriculum, outcomes, mapped skills, price, language, publication/moderation status.
- Enrollment: learner, course, progress, assessment state.
- Assessment: rubric, submission, score/feedback, reviewer, status.
- Credential: issuer, recipient, pathway, criteria version, evidence references, verification ID, revocation status.
- Organization: legal/display identity, verification state, members and roles.
- Opportunity: organization, type, requirements, eligibility, compensation, location, deadline, status.
- Application: applicant, opportunity, submitted profile/evidence, status, timestamps.
- MentorRecommendation: user, recommended opportunity/course, match rationale, missing skills, model/version metadata.

Every user-owned record must have explicit ownership and access rules. Marketplace records need publication/moderation state and organization/instructor ownership. Do not rely on client-side role checks for authorization.

## 4. AI Mentor contract

AI output must be structured and validated before it is saved. The roadmap response should contain:
- goal summary and assumptions;
- clarification questions if required information is missing;
- ordered milestones;
- skill IDs and measurable proficiency criteria;
- course/resource recommendations;
- practical deliverables;
- assessment rubrics;
- estimated effort and dependencies.

The Mentor must distinguish verified user evidence from self-reported skills. It must never fabricate course availability, job listings, employer endorsements, certificates, or match results. Recommendations should include an explanation and confidence/limitations.

## 5. Data, security, and trust requirements

- Keep model/API secrets on trusted server routes; never expose provider keys in the browser.
- Enforce Firestore authorization and validation server-side/rules-side. Users may edit only their own profile and submissions; they may not grant themselves instructor, recruiter, organization-admin, or platform-admin privileges.
- Organization and instructor verification must be a controlled workflow.
- Public profiles and applications require explicit visibility/consent settings.
- Store only necessary personal data. Do not expose private contact details in public listings.
- Add moderation, reporting, rate limiting, audit trails, and abuse controls before opening public posting.
- For minors, enforce age-appropriate eligibility, privacy, guardian/consent and safeguarding requirements where legally required. Do not recommend restricted or unsafe work.
- Payments, refunds, tax, and marketplace payouts require a compliant provider and jurisdiction-specific review before enabling real transactions.
- AI assessments should be explainable and appealable; do not use automated match scores as the sole basis for consequential decisions.

## 6. Delivery roadmap

### Phase 0 — Foundation and audit
- Confirm the active application entry point and retire duplicate/unused navigation paths safely.
- Define shared domain types and data ownership.
- Audit authentication, Firestore rules, server routes, localStorage migration, and current AI Mentor flows.
- Add build/typecheck/test scripts and baseline tests.

### Phase 1 — Goal-to-roadmap MVP
- Goal intake conversation.
- Structured AI roadmap generation and persistence.
- Roadmap dashboard with milestone progression.
- Course-to-skill mapping and learner evidence records.

### Phase 2 — Learning intelligence
- Assignments/projects and rubric-based assessment.
- Skill graph and explainable progress feedback.
- Adaptive Mentor recommendations.

### Phase 3 — Qualification
- Professional pathway definitions.
- Evidence-based assessments and review workflow.
- Verifiable KrtLab credentials.

### Phase 4 — Marketplaces
- Course/instructor marketplace with moderation.
- Organization verification and opportunity listings.
- Applications and candidate pipeline.
- Skill/evidence-based opportunity recommendations.

### Phase 5 — Scale and monetization
- Payments and payouts after compliance review.
- Reviews, dispute handling, analytics, anti-fraud.
- Localization, accessibility, performance, and external integrations.

## 7. Non-negotiable implementation principles

1. One shared learner profile and skills/evidence model across all modules.
2. No fake marketplace data or success messages for actions that were not actually persisted.
3. No qualification based only on course completion.
4. No public employer or instructor posting without authorization and moderation.
5. No destructive schema migration without backup, migration tests, and rollback plan.
6. Build each phase as a working vertical slice; do not replace the active app router wholesale before feature parity is demonstrated.
