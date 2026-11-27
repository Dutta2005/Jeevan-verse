---
name: vercel-react-best-practices
description: Review or improve React components, hooks, rendering, data fetching, and bundle performance in this Vite client. Use when writing or refactoring React code; select only rules relevant to the change.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# React Best Practices for Jeevan Verse

This entrypoint adapts the bundled Vercel rules to the repository's React +
TypeScript + Vite client. Follow root `AGENTS.md` for stack, product safety,
permissions, and verification.

## Load only what the task needs

Start with the affected component or hook. Use the table below to choose
individual rule files; use `rg` in `rules/` for a more specific issue. Read
additional rules only when the code or performance evidence calls for them.
The compiled [AGENTS.md](AGENTS.md) is an optional reference for broad audits,
not a prerequisite for ordinary React work.

| Task or symptom | Relevant rules |
| --- | --- |
| Independent requests run sequentially | [async-parallel](rules/async-parallel.md), [async-defer-await](rules/async-defer-await.md) |
| Large imports or initial bundles | [bundle-barrel-imports](rules/bundle-barrel-imports.md), [bundle-analyzable-paths](rules/bundle-analyzable-paths.md), [bundle-conditional](rules/bundle-conditional.md) |
| Unnecessary effect runs or stale state | [rerender-dependencies](rules/rerender-dependencies.md), [rerender-functional-setstate](rules/rerender-functional-setstate.md), [rerender-derived-state-no-effect](rules/rerender-derived-state-no-effect.md) |
| Expensive rendering or component identity changes | [rerender-memo](rules/rerender-memo.md), [rerender-no-inline-components](rules/rerender-no-inline-components.md), [rerender-lazy-state-init](rules/rerender-lazy-state-init.md) |
| Event subscriptions or persisted client data | [client-event-listeners](rules/client-event-listeners.md), [client-localstorage-schema](rules/client-localstorage-schema.md) |
| Large lists or frequently updated input | [rendering-content-visibility](rules/rendering-content-visibility.md), [rerender-use-deferred-value](rules/rerender-use-deferred-value.md) |
| Measured cost in data processing | [js-index-maps](rules/js-index-maps.md), [js-set-map-lookups](rules/js-set-map-lookups.md), [js-early-exit](rules/js-early-exit.md) |

## Apply rules to the existing stack

- Use React `lazy` with `Suspense` and dynamic `import()` where deferred loading
  fits the route or interaction. Examples using `next/dynamic` need adaptation.
- Keep fetching and state in the existing Axios, Redux Toolkit, and component
  patterns. A rule mentioning SWR does not authorize adding a dependency.
- Skip Next.js routing, Server Components, Server Actions, server caching, and
  hydration rules for this client-rendered SPA. Server API work follows the
  Express service and middleware patterns in root `AGENTS.md`.
- Read the component API before changing effect dependencies or memoization.
  Preserve request cleanup, event unsubscribe behavior, and account changes.
- Prioritize observed waterfalls, bundle cost, and unnecessary work. Avoid
  speculative memoization, broad rewrites, or micro-optimizations for their
  own sake. Keep loading, empty, and error behavior intact.

For component API design, use `vercel-composition-patterns` when that skill's
trigger applies. For an explicit accessibility or interface audit, use
`web-design-guidelines`; routine React edits do not require the full audit.
