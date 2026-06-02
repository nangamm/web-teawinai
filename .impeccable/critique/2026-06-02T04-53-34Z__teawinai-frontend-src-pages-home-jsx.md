---
target: teawinai/frontend/src/pages/Home.jsx
total_score: 29
p0_count: 0
p1_count: 2
timestamp: 2026-06-02T04-53-34Z
slug: teawinai-frontend-src-pages-home-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Category loading and submit loading are visible, but the form has no step/progress cue. |
| 2 | Match System / Real World | 3 | Thai local framing is strong, but "Trip planner" and English helper are mixed without a clear bilingual system. |
| 3 | User Control and Freedom | 3 | Reset exists and defaults are useful, but no partial undo or persistent draft. |
| 4 | Consistency and Standards | 3 | Form controls are mostly consistent; section labels and bilingual tone still vary. |
| 5 | Error Prevention | 3 | Required fields and numeric budget guardrails exist; location depth can still invite over-selection. |
| 6 | Recognition Rather Than Recall | 3 | Labels are visible and chips are clear; category count can become scanning-heavy. |
| 7 | Flexibility and Efficiency | 2 | Power path is limited: no saved defaults, recent selections, or quick intent presets. |
| 8 | Aesthetic and Minimalist Design | 3 | Cleaner than before, but desktop hero plus dense card still competes for attention. |
| 9 | Error Recovery | 3 | Inline errors preserve state, but API/category failure recovery lacks retry. |
| 10 | Help and Documentation | 2 | The page has little contextual help for budget/place count/category meaning. |
| **Total** | | **29/40** | **Good foundation, needs focused simplification** |

## Anti-Patterns Verdict

**LLM assessment**: The page no longer reads like a generic AI landing page. The real hero image, restrained green system, Thai-first headline, and compact planner give it a credible product feel. The remaining risk is not visual slop; it is product complexity surfacing too early. The first screen asks for location depth, budget, place count, and interests before showing the value of the planner.

**Deterministic scan**: `detect.mjs --json teawinai/frontend/src/pages/Home.jsx` returned `[]`. No deterministic impeccable anti-patterns were detected in the target file.

**Visual overlays**: Browser overlay inspection was not available in this session, so no reliable user-visible overlay was injected. Fallback signal used: source review, CSS review, and deterministic CLI detector.

## Overall Impression

Home is close to a usable travel-planning entry point. The main opportunity is to make the first action feel lighter: the user should feel "tell us roughly what you want" rather than "complete a detailed administrative form."

## What's Working

1. The Ubon default is correct for the product context. It reduces the first decision and keeps the experience local.
2. The primary CTA is clear, high-contrast, and placed after the form in a predictable way.
3. Loading, empty, error, focus, and reduced-motion states are present, which gives the page a stronger production baseline than a typical hero form.

## Priority Issues

### [P1] Component-local district data makes Home heavy and hard to maintain

**Why it matters**: `Home.jsx` contains large `districtsByProvince` and `subdistrictsByDistrict` objects near lines 39 and 69. This makes the page component harder to scan, slower to reason about, and risky to update. A UI component should express the planner flow; province datasets should live in shared data/config.

**Fix**: Extract province, district, and subdistrict data into a separate module such as `src/data/ubonLocations.js`, then import helper functions into Home. This also lets AddPlace and Home share one source of truth.

**Suggested command**: `$impeccable harden`

### [P1] Mobile first screen still asks too much before reward

**Why it matters**: On mobile, the user sees a large hero, then a dense planner card with location, budget, place count, and interests. Even with progressive subdistrict reveal, this is still several decisions before the app proves value. A traveler on a phone will likely want a faster path.

**Fix**: Make the mobile form a two-stage flow: first budget + interests + CTA, then optional "เลือกพื้นที่ละเอียด" expansion for district/subdistrict. Keep province default visible but not dominant.

**Suggested command**: `$impeccable adapt`

### [P2] Bilingual copy lacks a stable rule

**Why it matters**: The page mixes Thai headings with English labels like "Trip planner" and "Local places matched to your budget and interests." This can work, but right now it feels incidental. Travelers benefit from bilingual support when English clarifies action, not when it becomes a decorative kicker.

**Fix**: Use Thai for primary labels and English as helper text only where it helps non-Thai travelers. Example: title "วางแผนเที่ยว" with helper "Plan by budget and interests." Avoid English-only micro-labels.

**Suggested command**: `$impeccable clarify`

### [P2] Category selection can become a wall of chips

**Why it matters**: `categories.map(...)` renders every category at once around line 414. If the API grows, the decision point will exceed the 4-item working-memory guideline and mobile scanning will degrade.

**Fix**: Cap visible categories to the most common 6-8, add a "เพิ่มเติม" disclosure, or group categories by intent: กิน, วัด/วัฒนธรรม, ธรรมชาติ, ช้อป/ตลาด.

**Suggested command**: `$impeccable distill`

### [P2] Failure recovery needs a retry path

**Why it matters**: Category loading has visible loading and empty states, but an API failure only produces a toast and then an empty message. Users cannot retry in place.

**Fix**: Track `categoriesError` separately and show a small inline retry button inside the category area.

**Suggested command**: `$impeccable harden`

## Persona Red Flags

**Jordan, first-time traveler**: The first action is mostly clear, but "จำนวนสถานที่" and category choices may not explain how they affect the generated trip. Jordan may wonder whether choosing 7 places means a full day, a route length, or just recommendation count.

**Sam, keyboard/screen-reader user**: Labels and focus states are present, which is good. The remaining risk is dynamic category loading and conditional subdistrict reveal. The page should ensure the newly revealed subdistrict select is announced or does not disrupt tab order.

**Casey, distracted mobile user**: The form uses good tap targets, but the primary path is still longer than ideal. Casey likely wants to enter budget, tap 1-2 interests, and generate quickly. Detailed district/subdistrict selection should be optional.

## Minor Observations

- The `.hero-copy` class exists in CSS but the current JSX does not wrap hero text in it, so some intended width/padding styles are unused.
- The hero image `alt` is generic enough, but if this image is specific, the alt could name the place or communicate "local temple in Isan" more naturally.
- CTA loading text is friendly, but it may become long inside narrow buttons. Keep an eye on clipping in Thai on 320px widths.
- `form-section` headings help scanning, but they also add visual stops. On mobile, fewer headings may feel calmer.

## Questions to Consider

- What if the first mobile decision were only "budget + interests" and area detail became optional?
- Should the page feel like a local guide asking simple questions, or like a form collecting trip constraints?
- Is district/subdistrict precision necessary before generating, or can the result page refine the route afterward?
