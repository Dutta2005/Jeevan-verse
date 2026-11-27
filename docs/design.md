# Jeevan Verse — Design Guide

The visual language, tokens, screen patterns, and interaction guidance for
Jeevan Verse. Read this alongside `AGENTS.md` and `docs/prd.md` before making
substantial UI changes.

**Status:** Adapted to the current repository; some screens still use
different legacy styles.  
**Last updated:** 26 November 2026

## 1. What the design is for

Jeevan Verse helps people find health information, connect with community
support, coordinate blood requests, and discover health initiatives. The UI
must make sensitive and potentially urgent information easy to understand
without feeling alarming or making promises the service cannot keep.

The audience includes people using phones as well as desktop browsers, users
with different levels of health literacy, individual community members, and
health organizations.

The experience should feel **warm, clear, and trustworthy**. Use the brand's
red as a recognizable anchor, blue for supporting actions and links, and teal
for community and positive support. Keep information readable and calm. Use
decorative gradients primarily for public-facing feature storytelling, not
for dense forms or health information.

## 2. Principles

1. **Clarity before decoration.** State what a page or action does in plain
   language. Avoid dense promotional copy around forms and urgent requests.
2. **Health content needs context.** Distinguish AI responses, community
   posts, organization content, and official guidance. Do not imply a
   diagnosis, professional review, donor eligibility, or guaranteed outcome.
3. **Urgency is explicit.** Blood request urgency and status use text labels
   alongside color or icons. Color alone never carries meaning.
4. **One obvious next step.** Give each screen one primary action. Secondary
   actions remain visible but visually quieter.
5. **Consistent surfaces.** Use page backgrounds, bordered surfaces, and
   spacing consistently. Reserve cards for distinct content groups; avoid
   wrapping every row in its own card.
6. **Mobile is a first-class layout.** Forms, navigation, tabs, and request
   actions must remain usable on narrow screens and with touch.
7. **Respect sensitive information.** Do not put private profile, contact, or
   health details in decorative previews, notification snippets, or public
   content without a clear product reason.

## 3. Visual language

### 3.1 Color

The current palette is defined in `client/tailwind.config.js`. Use the named
Tailwind colors already configured rather than introducing unrelated brand
colors in individual components.

| Token | Current value | Use |
| --- | --- | --- |
| `primary` | `#bf2231` | Brand emphasis and primary actions |
| `secondary` | `#3498db` | Supporting actions, links, and selected navigation |
| `accent` | `#1abc9c` | Positive community emphasis and the Jeevan wordmark |
| `light.bg` | `#f4f9f4` | Light page background |
| `light.text` | `#2c3e50` | Main light-theme text |
| `dark.bg` | `#222222` | Dark page background |
| `dark.text` | `#e0e6ed` | Main dark-theme text |

The current theme also uses neutral Tailwind grays in controls and content.
Prefer the configured `primary`, `secondary`, `accent`, `light.*`, and
`dark.*` names, plus existing neutral classes used by the surrounding screen.
Avoid adding new one-off hex values. If a recurring semantic color is needed,
add a named theme token in `tailwind.config.js` and use it consistently.

Guidance:

- Keep primary actions primarily red, with readable foreground text.
- Use blue and teal as supporting colors; do not apply all three brand colors
  to every component.
- Use red for blood-related emphasis only when it communicates the feature or
  a true warning. Do not make every Blood Bridge element look like an error.
- Use `destructive` or red styling only for destructive or genuinely urgent
  states; pair it with a clear label.
- Check contrast in both themes. The light and dark theme tokens are not
  interchangeable, and dark mode should not be implemented by merely dimming
  light surfaces.
- Existing landing-page gradients and blurred color washes are decorative
  exceptions. Do not extend them into forms, chat messages, or data-heavy
  screens.

### 3.2 Typography

The default typeface is **IBM Plex Sans**, configured as `font-ibm` in
`client/tailwind.config.js` and applied to the body. The **Samarkan** face is
available as `font-samarkan` and is used as a distinctive brand accent in the
Jeevan wordmark. Keep Samarkan to brand lettering; use IBM Plex Sans for all
functional content.

| Role | Guidance | Typical use |
| --- | --- | --- |
| Page title | `text-2xl` to `text-4xl`, semibold or bold | Main page heading |
| Section heading | `text-lg` to `text-2xl`, semibold | Page sections and feature panels |
| Body | `text-sm` to `text-base`, normal leading | Explanations, posts, chat |
| Supporting text | `text-sm` with a muted neutral | Dates, helper text, metadata |
| Compact label | `text-xs` to `text-sm`, medium | Badges and field labels |

Use sentence case. Keep paragraphs short, left aligned, and comfortably
readable. Avoid very large headings on utility pages; the oversized display
type is best reserved for the public landing hero.

### 3.3 Spacing, surfaces, and shape

- Use Tailwind's spacing scale. Give page content consistent horizontal
  padding (`px-4` on phones, increasing to `px-6` or a centered container on
  wider screens).
- Separate major page sections with generous vertical spacing. Keep related
  form fields and metadata closer together.
- Use the existing radius scale configured through `--radius` (currently
  `0.5rem`) and the shadcn component patterns already in the project.
- Prefer a quiet border and surface contrast over a heavy shadow. Use stronger
  elevation for overlays, menus, and dialogs that float above the page.
- Use list rows with dividers for repeated posts, requests, notifications,
  or session entries when they belong to one continuous list.
- Keep content widths appropriate to the task: narrow for discussion reading
  and forms, wider for dashboards and multi-column organization views.

### 3.4 Icons and imagery

- Use `lucide-react` for interface icons, consistent with current components.
- Icons support text; do not use an unfamiliar icon as the only label for a
  key action. Icon-only controls need an accessible name and a visible focus
  state.
- Use health, blood, and organization imagery only when it supports the
  content. Avoid imagery that implies clinical endorsement or a guaranteed
  outcome.
- Keep avatars and uploaded prescription previews private to the relevant
  authenticated context.

### 3.5 Motion

Motion should confirm an interaction, not compete with health content.

- Use short transitions for hover, focus, tab, and menu state changes.
- Use existing Motion components only where the screen already benefits from
  them; do not add animation dependencies for simple transitions.
- Avoid pulsing or looping motion on urgent blood requests, warnings, or
  medical advice.
- Respect `prefers-reduced-motion` for non-essential transitions and animated
  content.

## 4. Shared layout and navigation

The app has a shared top navigation bar in `client/src/components/navbar/`
and a separate organization navigation experience. Preserve those role
boundaries and existing route behavior.

### Desktop

- Keep the Jeevan Verse wordmark at the left, primary destinations in the
  center where space allows, and account actions/notifications at the right.
- Use the active route to distinguish the selected destination with a clear
  color and/or weight change.
- Center page content in a readable max-width container. Dashboards may use
  multiple columns when the content benefits from comparison.
- Keep navigation visible without obscuring page headings or controls.

### Mobile

- Collapse primary navigation into the existing sidebar/menu pattern.
- Ensure menu items, tabs, form controls, and primary actions have comfortable
  touch targets (aim for at least 44px for key controls).
- Stack multi-column content into a single readable column. Keep primary
  actions reachable without horizontal scrolling.
- Check that fixed or sticky navigation does not cover focused fields or the
  final item in a scrollable list.

### Forms and overlays

- Group fields by purpose and use visible labels. Placeholder text is not a
  substitute for a label.
- Keep submit actions easy to find. Show pending state only while work is in
  progress and prevent accidental duplicate submission where appropriate.
- Place validation feedback beside the relevant field and preserve entered
  values after recoverable errors.
- Use the existing dialog, alert-dialog, sheet, dropdown, and toast
  components. Confirm destructive actions with an explicit description.
- For a failed network or provider operation, show a useful retry path without
  exposing internal errors or sensitive data.

## 5. Screen patterns

These patterns adapt the current screens. They are consistency guidance, not
a claim that every detail is already implemented.

### 5.1 Public landing page

The landing page introduces Jeevan Verse and its four main experiences: Umeed,
Blood Bridge, Chit Chat, and organization campaigns.

- Keep the brand hero prominent, with a short value statement and clear
  registration and sign-in actions.
- Use the current red-to-blue-to-teal brand treatment sparingly in the hero.
- Give each feature section a clear title, concise explanation, and a single
  route into the feature.
- Keep the organization entry point visible without competing with user
  registration.
- Provide a responsive footer and avoid relying on animation to reveal
  essential information.

### 5.2 Individual dashboard

The current dashboard greets the signed-in user and places personal details
beside recent organization posts on wider screens.

- Lead with a useful greeting or short dashboard title.
- Keep profile information concise and make the next product action easy to
  find.
- Present recent posts as a scannable feed with source and date context.
- On phones, stack profile details and recent content in a logical order.
- Define explicit loading, empty, and failure states; an empty feed should
  explain how to discover more content.

### 5.3 Umeed chat

The chat screen combines conversation history, messages, prescription upload,
and behavior insights.

- Keep the active conversation and message composer visually distinct.
- Differentiate user and assistant messages by alignment and surface, while
  preserving readable contrast and sufficient text width.
- Show attachment name/type and a clear upload or analysis state. Provide a
  removal action before sending when the user can still change the selection.
- Place health-safety context where users can see it before relying on the
  response. Do not style assistant content as a clinician's note.
- Keep the composer reachable on mobile and ensure the on-screen keyboard
  does not hide the send action.
- Session loading, empty conversation, provider failure, upload failure, and
  behavior-insight loading/empty states must be explicit.

### 5.4 Blood Bridge

The current screen uses tabs for donor/request experiences, a request form, a
request list, and the user's own requests.

- Identify the page and the meaning of each tab before the user enters a form.
- Make blood group, urgency, location, request status, and next action easy to
  scan in each request.
- Pair urgency/status colors with text labels. Keep closed or completed
  requests visually distinct from active needs.
- Separate request creation from browsing active requests so the page does
  not overwhelm the user with competing actions.
- Make privacy and contact-sharing choices understandable at the point of
  volunteering.
- Include empty, loading, retry, and no matching request states.

### 5.5 Chit Chat discussions

The discussion list and detail screens should support reading first and
participation second.

- Use a readable narrow content column for post bodies and comment threads.
- Show author and time context without implying medical credentials unless
  verified by a real process.
- Keep post creation and comment actions visible to eligible users.
- Label content as community discussion where health advice may be mistaken
  for professional guidance.
- Provide clear pagination or loading feedback, plus empty and retry states.

### 5.6 Organization experience and campaigns

Organizations have their own login, profile, dashboard, and post publishing
flow.

- Make it clear when someone is viewing or editing as an organization.
- Keep organization identity attached to published content.
- Use campaign-style imagery and color to support information, not obscure
  dates, eligibility, location, or action details.
- Keep publishing forms organized, with image/upload feedback and validation
  that does not discard a draft after a recoverable error.

### 5.7 Authentication and notifications

- Keep user and organization authentication visually related but clearly
  identified so users choose the correct account flow.
- Use focused forms with explicit labels, concise error messages, and pending
  feedback.
- In notification lists, identify the event type, relevant post/request, and
  time. Do not expose private details in a preview unless the recipient is
  authorized to see them.
- Include an understandable no-notifications state and a recovery path when
  live updates are unavailable.

## 6. Component and interaction conventions

- Reuse the existing components in `client/src/components/ui/` for buttons,
  inputs, dialogs, tabs, alerts, badges, avatars, and other common controls.
- Prefer one primary button per local action group. Use outline, ghost, or
  text-style actions for secondary controls where the existing component
  variants support them.
- Keep status badges short and pair color with words.
- Use toast notifications for brief outcomes, not for information users need
  to read or act on later.
- Buttons must communicate disabled, loading, hover, focus, and pressed
  states. Do not remove the browser-visible keyboard focus indicator.
- Use semantic headings in order and semantic buttons/links for actions and
  navigation.

## 7. Accessibility and responsive review

- Use meaningful labels, accessible names, and keyboard-operable controls.
- Ensure text and control contrast in both light and dark themes.
- Do not convey urgency, status, or selection by color alone.
- Announce validation errors and important asynchronous updates to assistive
  technology where appropriate.
- Check layouts at narrow phone widths, tablet widths, and desktop widths.
  Avoid clipped text, horizontal page scrolling, and controls hidden behind
  sticky elements.
- Respect reduced-motion preferences and avoid auto-playing attention-
  seeking animation.

## 8. Implementation notes

- Tailwind theme configuration lives in `client/tailwind.config.js`.
- Global CSS and the `font-ibm` body style live in `client/src/index.css`.
- Global app layout styles live in `client/src/App.css`.
- Shared shadcn-style primitives live in `client/src/components/ui/`.
- The app shell and shared navigation live in `client/src/App.tsx` and
  `client/src/components/navbar/`.
- Use the configured `@` alias for client source imports where consistent
  with neighboring files.
- Some existing screens contain one-off gray, red, gradient, and opacity
  classes. When updating a screen, follow this guide and the local component
  patterns; avoid expanding style inconsistency with new one-off values.

## 9. Design review checklist

- Is the page purpose and primary action clear at first glance?
- Is health information framed accurately and safely?
- Are private details shown only in the right authenticated context?
- Are color, spacing, type, and surfaces consistent with this guide and the
  neighboring screen?
- Do loading, empty, validation, error, and success states make sense?
- Does the flow work by keyboard and at mobile widths?
- Are color and motion still understandable and calm in both themes and with
  reduced motion enabled?
