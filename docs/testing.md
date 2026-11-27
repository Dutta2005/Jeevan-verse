# Testing

## Client testing

Tests live in a `__tests__` directory beside the module or feature they cover.
Use `ModuleName.test.ts` for non-React modules and `ComponentName.test.tsx` for
components. A descriptive group name is appropriate when a suite covers related
components together, such as route guards or public pages.

```text
client/
  vite.config.ts                         # Vitest discovery and coverage settings
  src/
    __tests__/                           # App and lazy route registration tests
    api/__tests__/                       # Axios client configuration
    components/
      __tests__/                         # Components directly in components/
      blood bridge/__tests__/            # Request forms, lists, and consent
      chatbot/__tests__/                 # Uploads, sessions, and analysis display
      dashboard/__tests__/               # User dashboard and fetched data
      discussion/__tests__/              # Discussion forms, cards, and details
      errors/__tests__/                  # Error screens
      footer/__tests__/                  # Footer
      landing page/__tests__/            # Landing sections
      layouts/__tests__/                 # Route guards
      navbar/__tests__/                  # User navigation and notifications
      organisation/
        __tests__/                       # Organization landing and logout
        dashboard/__tests__/
        navbar/__tests__/
        post/__tests__/
    hooks/__tests__/
    lib/__tests__/
    pages/
      __tests__/                         # Pages directly in pages/
      account/__tests__/
      organisation/
        __tests__/
        auth/__tests__/
    store/__tests__/                     # Reducers and store configuration
    utils/__tests__/                     # Socket events and navigation config
    test/
      setup.ts                           # Shared cleanup and browser API stubs
      selectOption.ts                    # Real Radix select interaction helper
```

Keep `src/test/` for shared setup and helpers, rather than feature suites. Keep
generated coverage output in `client/coverage/`, which is ignored by Git.

### Commands

Before opening or updating a PR, `npm.cmd run preflight` must pass in both
`client/` and `server/` on the final proposed changes. Do not merge the PR.
Client preflight checks formatting without rewriting files, runs lint and
coverage tests, then builds (including TypeScript checking). Use `format`
separately only when intentionally applying formatting fixes.

Run from `client/`. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run preflight

# One suite without a full coverage report:
npm.cmd exec vitest run src/store/__tests__/authSlice.test.ts
```

`npm test` runs all `src/**/*.test.{ts,tsx}` suites once with V8 coverage. It
writes an HTML report to `coverage/index.html` and a machine-readable summary to
`coverage/coverage-summary.json`. The default environment is Node; DOM suites
declare `// @vitest-environment jsdom` at the top of their file.

### Coverage scope and safeguards

Coverage includes application `.ts` and `.tsx` files, including files no test
imports. The existing exclusions are unchanged: generated-style UI primitives
under `src/components/ui/`, declarations, test files/helpers, and `src/main.tsx`.
The numbers therefore describe this client scope, not the server or the complete
deployed application.

The baseline before expansion was 70 passing tests, 23.39% statements, 17.38%
branches, 26.10% functions, and 23.46% lines. Coverage thresholds now enforce at
least 99% statements, functions, and lines, and 95% branches. These are minimum
floors; 100% remains the target. Do not remove application files from coverage
or add ignore comments merely to satisfy a threshold.

The verified result after the workspace updates and lazy city-data loading is 384
passing tests across 69 suites. `npm.cmd run preflight` passes formatting, lint,
TypeScript checks, tests with coverage, and the production build.

| Metric | Before | After |
| --- | ---: | ---: |
| Statements | 23.39% | 99.22% |
| Branches | 17.38% | 96.27% |
| Functions | 26.10% | 99.64% |
| Lines | 23.46% | 99.74% |

The four uncovered lines are in `PostForm.tsx` (outside-interaction handling),
`DiscussionPost.tsx` (missing ID during deletion), `SomethingWrong.tsx`
(browser reload), and `socket.ts` (defensive timeout clearing).

Tests cover success, loading, empty, validation, and failure states; pagination;
account-specific navigation; socket lifecycle and duplicate events; chat and
upload orchestration; and volunteer consent/contact visibility. API calls are
mocked, using synthetic fixtures. Page orchestration suites sometimes substitute
child components that have their own independent behavior suites.
Additional suites cover account layouts, mobile workspace navigation, legacy
filter URLs, chat history actions, account changes, preview URL cleanup, and
requests settling after their screen unmounts.
Location tests compare every generated Indian state and ordered city list with
the installed source package, and exercise deferred loading, retry, manual city
entry, and state changes while a download is pending.

### Limits

jsdom provides no layout engine or actual navigation/reloads. Setup provides
minimal observer, scrolling, and pointer-capture stubs so real Radix controls can
be exercised. A passing unit suite does not establish responsive layout,
browser navigation/reload behavior, live API contracts, server authorization, or
provider integrations.

Some uncovered paths are defensive or unreachable through normal UI actions.
For example, the socket timeout-clearing branch requires a pending timeout while
the immediately preceding duplicate-event guard is false; the current handler
does not naturally reach that state. Browser reload behavior also needs a real
browser check. Do not manufacture internal state solely to turn these green.

The chat history now uses separate session and options buttons, with confirmed
deletion. Mobile workspace links close the drawer through their click handlers
and retain React Router's active-link styling. The volunteer dialog trigger
uses Radix's `asChild` option so consent actions remain unambiguous.

The production build reports a non-blocking warning for `/grid.svg`. Indian city
names are a 40.45 kB dynamic chunk (18.97 kB gzipped) loaded after state selection; the global
city-data bundle is no longer shipped. These checks do not establish asset
delivery or bundle performance in a deployed browser.

## Server testing

Vitest runs JavaScript tests in Node. Put each `*.test.js` suite in a
`__tests__/` directory beside the server module it covers. The starter suites
exercise Blood Bridge schema validation and controller behavior with synthetic
fixtures and stubbed database calls. Running them requires the server's npm
dependencies and no database connection, service credentials, or running API.

Use Node.js 20.19+ on the 20.x line or Node.js 22.12+. Run from `server/`
after installing dependencies with `npm.cmd ci`.

```powershell
npm.cmd test
npm.cmd run test:watch
npm.cmd run preflight
npm.cmd test -- src/controllers/__tests__/bloodRequest.controller.test.js
```

Server preflight runs `check:syntax` followed by the full Vitest suite. The
syntax check parses `.js`, `.mjs`, and `.cjs` files throughout `server/`,
excluding dependencies, Git metadata, coverage, and build output. It does not
execute the application or load environment files. It is not a linter or a
type checker, and it does not establish live integration correctness. The
server's recursive `build` script is not part of preflight.

For a bug fix, add a case to the closest suite or create a focused suite. Make
the assertion describe the expected behavior and run it against the current
implementation. Confirm the failure reproduces the bug, then fix the production
code. Rerun the case and the server suite. Add a test name filter with
`-t "test name"` after the suite path to run one case.

Keep fixtures synthetic. Stub external services at their calling boundary and
avoid importing the API entry point, which starts the live server and connects
to MongoDB. The starter suites exercise schema validation in memory and
controller behavior in isolation. HTTP routing, real MongoDB operations, and
provider integrations require their own tests.

The expanded server suite has 37 tests across five files. In addition to the
Blood Bridge schema and list-filter tests, it covers:

- User and organization authentication: missing/invalid/expired credentials,
  cookie and header sources, missing accounts, failed account lookups, and
  excluding password/refresh-token fields from database selection.
- Volunteer contact visibility for anonymous viewers, other users, the request
  creator, and the volunteer themself; consent updates affect only the
  signed-in volunteer and reject non-volunteers without saving.
- Account-scoped notification lists, bulk updates/deletes, timestamp filters,
  and query failures.

JWT verification and database calls are stubbed in these tests. They verify
middleware/controller decisions, not cryptographic verification, HTTP cookie
behavior, MongoDB execution, or end-to-end authorization. No backend coverage
percentage has been measured; passing these tests is not complete coverage.

An inspection during test expansion found that the single-notification
mark-read and delete handlers query by notification ID without checking its
owner. Their routes require authentication but do not add record ownership
checks. This remains an unresolved authorization issue, not behavior endorsed
by the new tests. Some validation errors are also returned as HTTP 500 by
existing controller catch blocks; the rejection tests do not certify those
status codes as correct.
