---
target: teawinai/frontend/src/pages/Home.jsx
total_score: 19
p0_count: 0
p1_count: 3
timestamp: 2026-06-01T15-57-18Z
slug: teawinai-frontend-src-pages-home-jsx
---
# Home.jsx Design Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Submit loading state exists, but category loading and empty states are invisible. |
| 2 | Match System / Real World | 2 | The hero and CTA language feel like heritage tourism instead of practical local planning. |
| 3 | User Control and Freedom | 2 | Users can change fields, but there is no clear reset or clear-planner action. |
| 4 | Consistency and Standards | 2 | The glassy booking-card treatment drifts from the flatter Teawinai product system. |
| 5 | Error Prevention | 2 | Required fields are validated, but district/subdistrict optionality is unclear. |
| 6 | Recognition Rather Than Recall | 2 | Options are visible, but disabled dependent selects lack explanation. |
| 7 | Flexibility and Efficiency | 1 | The page offers one rigid planning path; nav search is separate from planner intent. |
| 8 | Aesthetic and Minimalist Design | 2 | Attractive but busy: hero, nav search, auth CTAs, chips, and planner compete. |
| 9 | Error Recovery | 2 | Inline errors exist, but submit failure is generic and duplicated by toast. |
| 10 | Help and Documentation | 1 | No contextual guidance for budget, category choice, or location depth. |
| **Total** | | **19/40** | **Poor: major UX and product-fit improvements needed** |

## Anti-Patterns Verdict

This does not look like a throwaway AI page, but it has moderate AI/product-slop risk. The biggest tells are not technical decoration alone; they are tonal. "The Emerald of Isan," "Plan My Heritage Trip," the cinematic hero, emoji category chips, and the translucent booking card push the page toward a packaged tourism or booking-widget mood. Teawinai should feel like a trustworthy local guide console.

Deterministic scan: `detect.mjs --json teawinai/frontend/src/pages/Home.jsx` returned `[]`. No detector rules fired for the target file.

Visual overlays: skipped. Browser automation was not available in this session, so no reliable user-visible overlay was injected.

## Overall Impression

The page has the right skeleton: a place-led public surface with a practical trip-planning form. The biggest opportunity is to make it feel less like a tourism landing page and more like a local planning tool that earns trust before asking for inputs.

## What's Working

- The image-led first screen gives the page a concrete destination signal.
- The planner asks for meaningful trip inputs: location, budget, categories, and number of places.
- The navbar already covers core routes, active states, mobile collapse, and account menu ARIA better than many early builds.

## Priority Issues

**[P1] The page sounds like a heritage-tour product, not Teawinai**

Why it matters: "The Emerald of Isan" and "Plan My Heritage Trip" move the product toward packaged tourism. This undercuts the local, practical, trustworthy positioning.

Fix: Use clearer product language such as "Plan places around Ubon" or "Find local places for your trip." Keep heritage wording only when the selected category actually implies it.

Suggested command: `$impeccable clarify`

**[P1] The planner exposes too many decisions at once**

Why it matters: First-time users must choose location depth, budget, categories, and trip length before seeing what Teawinai gives them. That creates high cognitive load at the exact moment trust should be forming.

Fix: Default province to Ubon, reveal district and subdistrict progressively, group budget with number of places as trip constraints, and group categories as interests.

Suggested command: `$impeccable distill`

**[P1] Mobile layout likely breaks or feels cramped**

Why it matters: `.card-row-3` keeps province, district, and subdistrict in three columns, while only `.card-row` collapses under 600px. On phones, the selects will be narrow and hard to use.

Fix: Collapse `.card-row-3` to one column on mobile or reveal one location level at a time.

Suggested command: `$impeccable adapt`

**[P2] Visual language drifts into booking-widget/glassmorphism**

Why it matters: `.booking-card` uses translucent white, 24px blur, and a large shadow. It feels closer to premium travel booking than a calm local guide product.

Fix: Use a white card with warm border, 14px radius, and restrained lift only where interaction or image layering needs it.

Suggested command: `$impeccable quieter`

**[P2] Trust cues are missing at the moment of decision**

Why it matters: The product advantage is local knowledge, but the form does not explain whether results come from local place data, recent updates, or practical budget planning.

Fix: Add one compact trust cue near the planner, such as "Uses local place data in Ubon," without turning the form into marketing copy.

Suggested command: `$impeccable onboard`

## Persona Red Flags

**Jordan, first-timer:** The first action is not obvious enough. The CTA implies a heritage-only trip while category chips suggest broader discovery. Disabled district and subdistrict fields need a short explanation or progressive reveal.

**Sam, accessibility-dependent user:** Native controls help, but the fields use visual `div` labels instead of explicit `<label>` associations. Placeholder color is weak, and the fade-up animation has no `prefers-reduced-motion` fallback.

**Casey, distracted mobile user:** The primary form is likely cramped because the location row stays three columns. The navbar also keeps auth/account choices high on the screen, competing with the planning task.

**Local Thai traveler:** The page mixes English hero/CTA phrasing with Thai form labels. That can make the product feel aimed at tourists instead of locals sharing and using Ubon knowledge.

## Minor Observations

- Emoji category icons are scannable, but they may feel too casual for a trust-focused local data product.
- Navbar search is useful but competes with the planner; the two intents should be more clearly separated or connected.
- `.btn-primary` still uses Tailwind blue, which risks identity drift if reused.
- The mobile active nav style uses an inset side stripe, which conflicts with the design rules used by the project.

## Questions to Consider

- What would the homepage say if it were written by a careful Ubon local, not a tourism marketer?
- Does the user need district and subdistrict before seeing any value?
- Is Home primarily a trip planner, or a local discovery entry point that can generate a trip after interests are clearer?
- Should account creation appear before the user receives a plan worth saving?
