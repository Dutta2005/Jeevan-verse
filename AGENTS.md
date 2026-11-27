# AGENTS.md

Standing instructions for AI coding agents working in this repository. Read
this file before making changes; load supporting documentation only as needed
for the current task.

## What this project is

Jeevan Verse is a community health platform for individuals and health
organizations. It includes Umeed, an AI health assistant; Blood Bridge, a
blood request and volunteer network; health discussions; and organization
profiles and posts. The current product scope and known open questions are in
`docs/prd.md`. The implementation walkthrough is in `walkthrough.md`.

This product handles health-related information. Do not present AI or
community content as diagnosis or professional medical advice. Do not make
claims of medical verification, donor eligibility, or guaranteed matching
unless the feature and its operating process support that claim.

## Tech stack — do not deviate without asking

- Client: React, TypeScript, Vite, React Router, Redux Toolkit, Axios, and
  Tailwind CSS. Keep existing app conventions and dependencies.
- Server: Node.js, Express, and MongoDB through Mongoose.
- Authentication: JWT-based user and organization flows using HTTP-only
  cookies and the existing authentication middleware.
- Real-time events: Socket.IO.
- AI and document processing: Gemini, Pinecone, and PDF parsing through the
  existing service layer.
- File storage and email: Cloudinary and Nodemailer through existing helpers.
- Use the existing API response/error helpers, async wrapper, validation
  patterns, and model/controller/route organization. Do not add a new
  framework, database, state-management library, or service provider without
  a clear requirement and user approval.

## Skills

Repository-specific skills live under `.agents/skills/`. Before starting a
task, check this table and read each matching `SKILL.md`; more than one skill
may apply.

Load each matching skill entrypoint only if it is not already available in
the current context, then read only the rules needed for the change. Use `rg`
to locate relevant rules rather than reading every rule or a compiled skill
`AGENTS.md`. Reuse context unless the files have changed. Local entrypoints
are adapted to this repository; preserve those adaptations during upstream
skill updates.

| When the task involves | Use |
| --- | --- |
| Building a new screen or materially reshaping the visual design | `frontend-design` |
| Writing, reviewing, or refactoring React code; client performance, rendering, or bundle size | `vercel-react-best-practices` |
| Designing reusable component APIs, compound components, or refactoring boolean-heavy components | `vercel-composition-patterns` |
| An explicit UI, accessibility, or web-interface guidelines audit | `web-design-guidelines` |

Skills do not override this file or the user's request. Apply React/Next.js
guidance to this Vite client only where the advice fits React and the existing
architecture; do not introduce Next.js patterns or dependencies into this
project.

For substantial API engineering work, use the relevant installed Postman
skill when available. Postman CLI is installed in this environment. Do not
assume a repo-local Postman skill exists unless it is present in the checkout.

## Product and data rules

1. **Health safety:** Umeed is informational support, not a clinician. Keep
   safety language clear and avoid diagnoses, certainty, or treatment claims.
   Preserve suitable escalation guidance for urgent symptoms.
2. **Sensitive information:** Treat health profiles, chat content,
   prescriptions, contact details, and blood requests as sensitive. Do not
   expose them in logs, error messages, analytics, or unrelated API responses.
   Never read, print, or commit `.env` values or credentials.
3. **Authorization:** Authentication is not authorization. Every new read or
   write must verify that the signed-in user or organization is allowed to
   access the specific record. Reuse `auth.middleware.js`, `org.middleware.js`,
   and established controller checks; do not trust client-supplied ownership
   IDs.
4. **Data integrity:** Keep Mongoose schemas, controller behavior, and client
   expectations aligned. Validate input on the server even when the client
   validates it. Preserve existing enums and ownership/status rules unless a
   product decision explicitly changes them.
5. **User contact and consent:** Blood Bridge contact details and the
   volunteer `canShareDetails` preference must be handled deliberately. Do
   not broaden contact disclosure or send unsolicited messages as a shortcut.
6. **AI and uploads:** Validate file type and size server-side, handle parser
   and provider errors, and avoid retaining or forwarding files beyond the
   existing product behavior. Do not claim a prescription interpretation is
   clinically verified.
7. **Feature claims:** Distinguish implemented behavior from planned or
   unverified claims. In particular, do not describe geolocation matching,
   expert verification, anonymous groups, or moderation coverage as live
   capabilities without confirming implementation and operations.

## Workflow

### 1. Understand

- For feature, entity, screen, or user-flow changes, read the relevant
  sections of `docs/prd.md` and `walkthrough.md`. For instruction-only,
  formatting, or test-only work, read those documents only when product
  behavior or architecture is needed to resolve a question.
- Inspect the existing route, controller, model, service, and client page or
  component before introducing a parallel implementation.
- If requirements for health-data handling, privacy, authorization, or user
  contact are ambiguous, identify the uncertainty and avoid inventing a
  product policy.

### 2. Plan

- For work spanning multiple files or layers, give a short plan before
  editing: the affected areas and how the change will be checked.
- Prefer the smallest change that fully satisfies the request. Avoid
  unrelated refactors and formatting churn.
- Keep existing client/server boundaries: UI in `client/`, API behavior in
  `server/`, and shared product documentation in `docs/`.

### 3. Implement

- Follow the existing flow: client API module/component → Express route →
  controller → service/model as appropriate. Keep business rules out of UI
  components and transport details out of Mongoose models.
- Put reusable external-service logic in `server/src/service/` or the
  existing utility modules rather than duplicating it in controllers.
- Keep route middleware and user/organization role boundaries explicit.
- Reuse existing UI components and styling patterns. Preserve responsive
  behavior, accessible labels, keyboard interaction, and loading, empty, and
  error states.
- Update `docs/prd.md` or `walkthrough.md` only when the requested change
  changes product behavior or makes their descriptions inaccurate.
- Do not add dependencies unless they are needed and fit the existing stack.

### 4. Verify

Do not run tests or verification commands unless the user asks for testing or
verification. A request to fix tests or increase coverage authorizes the
relevant checks throughout that task; do not ask again for each run. For
instruction-only edits, review the changed text and references without
running application checks unless requested.

When checks are requested, choose the scripts appropriate to the change.
Run from `client/`; use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`:

```powershell
# Lint, TypeScript checks, and all tests with coverage
npm.cmd run preflight

# Individual checks, when the full preflight is unnecessary
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test

# TypeScript checks and production bundle
npm.cmd run build
```

Use `preflight`, not its legacy misspelled alias `prefllight`. Avoid rerunning
checks already passed unless subsequent changes or failures justify it.

Keep tests in a `__tests__/` folder beside the module or feature they cover;
reserve `client/src/test/` for shared setup and helpers. See `docs/testing.md`
for placement, commands, and limits. Coverage settings in
`client/vite.config.ts` are authoritative: current floors are 99% statements,
functions, and lines, and 95% branches. Preserve the scope and thresholds;
do not exclude application code or manufacture internal states solely to
raise coverage. Report measured coverage and remaining gaps honestly.

For server changes, inspect `server/package.json` before selecting checks.
It currently declares no test script, and its `build` script calls itself;
do not run that recursive script. Do not claim tests passed if none were
run. Report missing configuration or external-service limits plainly.

### 5. Review

- Review the diff for accidental changes, exposed secrets, authorization
  gaps, and inconsistent client/server assumptions.
- For UI work, inspect the changed screen at the relevant viewport when
  browser tooling is available.
- Preserve unrelated pre-existing workspace changes. Do not revert files
  merely because they are outside the task.

### 6. Report

End with a concise summary of:

- What changed and which files.
- Checks run and their results, or that checks were not requested/run.
- Any unresolved product or implementation question and any material limit
  on verification.

## Repository layout

```text
AGENTS.md
.agents/skills/             repo-specific agent skills, when present
docs/prd.md                 product requirements and open decisions
walkthrough.md              implementation and architecture walkthrough
client/                     React + TypeScript + Vite application
  src/api/                  Axios API client
  src/components/           shared and feature UI
  src/pages/                routed screens
  src/store/                Redux Toolkit state
server/                     Express + MongoDB API
  api/                      server entry point
  src/routes/               API route declarations
  src/controllers/          request handling and authorization
  src/models/               Mongoose schemas
  src/service/               business and external-service integrations
  src/middlewares/          authentication and upload middleware
  src/utils/                shared server helpers
```

## Reference docs

- `docs/prd.md` — product scope, requirements, safety, and open decisions
- `walkthrough.md` — implementation, architecture, routes, and screens
- `docs/testing.md` — client test structure, coverage scope, and check commands
- `Readme.md` — setup and developer quick start

When repository documentation conflicts with the current code, inspect both
and call out the mismatch. Treat documentation as product intent and code as
evidence of what is currently implemented; do not silently turn an
unverified claim into a shipped requirement.
