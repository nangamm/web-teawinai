---
target: teawinai/frontend/src/pages/Home.jsx
total_score: 19
p0_count: 0
p1_count: 3
timestamp: 2026-06-02T03-47-03Z
slug: teawinai-frontend-src-pages-home-jsx
---
# Home.jsx Design Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Submit has a loading state, but category loading and empty states are invisible. |
| 2 | Match System / Real World | 2 | Hero and CTA copy still feel like heritage tourism rather than practical local trip planning. |
| 3 | User Control and Freedom | 2 | Users can change each field, but there is no clear reset or clear-planner action. |
| 4 | Consistency and Standards | 2 | The translucent booking card drifts from the flatter, quieter Teawinai product system. |
| 5 | Error Prevention | 2 | Required fields are validated, but district and subdistrict optionality is not explained. |
| 6 | Recognition Rather Than Recall | 2 | Options are visible, but disabled dependent selects lack guidance. |
| 7 | Flexibility and Efficiency | 1 | The first-screen planner is a single rigid path and does not offer fast defaults. |
| 8 | Aesthetic and Minimalist Design | 2 | The page is attractive, but hero, nav search, auth CTAs, chips, and planner compete. |
| 9 | Error Recovery | 2 | Inline errors exist, but submit failure remains generic and duplicated by toast. |
| 10 | Help and Documentation | 1 | No contextual guidance explains budget, interests, local data, or location depth. |
| **Total** | | **19/40** | **Poor: major UX/product-fit improvements still needed** |

## Anti-Patterns Verdict

The page still has moderate product-slop risk. It is not disposable AI output, but the language and composition read too close to a cinematic tourism/booking widget: "The Emerald of Isan," "Plan My Heritage Trip," the glassy planning card, and all-at-once form choices. This conflicts with the chosen direction: traveler-friendly bilingual, mobile-first, and simpler planning.

Deterministic scan: `detect.mjs --json teawinai/frontend/src/pages/Home.jsx` returned `[]`. No bundled detector rules fired for the target.

Visual overlays: skipped. Browser automation was not available in this session, so no reliable visible overlay was injected.

## Overall Impression

Home has the right raw ingredients, but no visible design progress since the previous critique. The surface still asks too much too early, especially on mobile, and it still sounds more like a heritage travel campaign than a local trip-planning tool.

## What's Working

- The hero image creates a concrete Ubon/Isan destination signal.
- The planner fields map to real planning needs: location, budget, category, and number of places.
- Native form controls and buttons give the page a workable accessibility foundation.

## Priority Issues

**[P1] Mobile planner layout is still likely cramped**

Why it matters: `.card-row-3` keeps province, district, and subdistrict in three columns, while the mobile media query only collapses `.card-row`. On phone screens, these selects become narrow and hard to use.

Fix: Collapse `.card-row-3` to one column at mobile sizes or reveal district/subdistrict progressively after province selection.

Suggested command: `$impeccable adapt`

**[P1] The form still exposes too many decisions at once**

Why it matters: A first-time traveler has to decide location depth, budget, category, and trip size before seeing value or trust cues. This creates high cognitive load.

Fix: Default province to Ubon Ratchathani, reveal district/subdistrict only when relevant, group budget and trip size together, and rename categories as traveler-friendly interests.

Suggested command: `$impeccable distill`

**[P1] Copy still misses the chosen bilingual direction**

Why it matters: The page mixes English hero/CTA with Thai field labels, but the English copy says "heritage trip," which narrows the product incorrectly. It does not feel traveler-friendly bilingual yet.

Fix: Use a bilingual headline/subline pair: one practical English line plus Thai form language, or Thai primary with concise English support. Make the CTA describe the actual action, not a tour style.

Suggested command: `$impeccable clarify`

**[P2] Visual treatment still feels booking-adjacent**

Why it matters: The planning card uses heavy blur and large shadow. It feels premium-travel/booking rather than a trustworthy local guide console.

Fix: Move toward the design system: white card, warm border, 14px radius, softer or conditional shadow, clearer section grouping.

Suggested command: `$impeccable quieter`

**[P2] Trust and guidance are still absent near submit**

Why it matters: Users do not see what Teawinai knows, how results are generated, or why budget/category/location choices matter before committing.

Fix: Add one compact trust cue and one small helper line: for example, local Ubon place data plus budget-aware suggestions.

Suggested command: `$impeccable onboard`

## Persona Red Flags

**Jordan, first-timer:** The disabled district and subdistrict fields are visible but unexplained. "Plan My Heritage Trip" suggests a narrow cultural itinerary while category chips imply broader discovery.

**Sam, accessibility-dependent user:** Field labels are visual `div` text rather than explicit labels. Placeholder color remains weak. Fade-up animation has no reduced-motion fallback.

**Casey, distracted mobile user:** The first screen is bottom-heavy and the location row is not mobile-safe. The user must type a budget and choose several controls before seeing any reassurance.

**Traveler using bilingual UI:** English copy and Thai controls are not coordinated. The UI should communicate "I can use this even if I do not know every Thai administrative level," but it currently assumes that understanding.

## Minor Observations

- `Calendar` and `ChevronDown` are imported but unused.
- The category API has no visible loading or empty state.
- Emoji category markers are scannable, but they reduce the trustworthy data-product feel.
- Global `.btn-primary` still uses blue, which can leak identity drift if reused.

## Questions to Consider

- Can Home start with "Where are you going in Ubon?" and only then ask for finer location?
- Should the CTA promise "Get trip suggestions" instead of naming a trip style?
- What one local-data cue would make a traveler trust the generated route before clicking submit?
