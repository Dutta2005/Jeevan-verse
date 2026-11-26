---
name: frontend-design
description: Design a new screen or materially reshape an existing interface with intentional typography, layout, color, and interaction. Use the product context and existing design system; routine logic fixes do not need a visual redesign.
license: Complete terms in LICENSE.txt
---

# Frontend Design

Build an interface whose visual choices follow its product, audience, and primary task. Ground decisions in the user's brief and existing screens; do not invent client history, preferences, or past rejected designs.

## Ground your designs in the subject matter

For Jeevan Verse, use the relevant product and screen context from root `AGENTS.md`, `docs/prd.md`, and `walkthrough.md`. Preserve existing components, tokens, dependencies, and brand conventions unless a redesign is requested. For another product, establish the subject and audience from available context. Ask only when a missing decision materially changes the result; otherwise state a reasonable assumption and continue.

## Design principles

For web designs, the hero is the first thing viewers will see. Open with the most characteristic thing in the subject's world, in the form that is most appropriate: a headline, an image, an animation, a live demo, an interactive moment, or other treatments. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the default treatment, so only use it if that's truly the best option.

Typography carries the personality of the page. You don't need a different typeface for display or headline text and body content: use one family or two, and if two, make them clearly distinct.

Choose your typefaces deliberately, not the default families you would reach for on any other project, and set a clear type scale following the default guidance of The Elements of Typographic Style with intentional weights, widths, and spacing. When type is used as a headline or visual element, use the type treatment itself as an active part of the design, not a neutral delivery vehicle for the content.

Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths; give serif body text slightly more line-height than a sans-serif.

Avoid these default typographic treatments; they are the commonest tells of a generated page:
- Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color.
- Using all caps for labels.
- Adding unnecessary typographic labels above content.

Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a stepped process or a timeline. Before adding numbered markers, check the content really is a sequence.

Use non-user-triggered motion sparingly and deliberately, only to draw attention. A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects; fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy and placeholder content. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: plan, review against the brief, build, critique

For a new screen or substantial redesign, describe a compact direction before coding: the primary action, content hierarchy, layout, typography, and palette. Reuse the existing token system where it fits. Wireframes or references are useful when they resolve a real layout decision; they are not required for small changes.

Review the direction against the brief. Let content and task priority determine grouping, density, alignment, and emphasis. Gradients, badges, cards, and unusual fonts should serve the requested direction; the user's explicit aesthetic preferences take priority. Revise choices that add decoration without improving comprehension or the intended character.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This can happen often with padding/margin between sections.

## Restraint and self-critique

Give the screen a focal point and cut decoration that does not serve the brief. Preserve mobile layouts, keyboard access, visible focus, labels, contrast, reduced motion, and loading, empty, and error states. Review relevant viewports when browser tooling is available; report any limits on visual inspection. Run application checks only as authorized by root `AGENTS.md` and the user's request.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.

Use actual product capabilities and appropriate health-safety language. Mark invented sample content as such; do not turn placeholders into feature claims.
