---
name: Teawinai
description: A trustworthy local travel guide and trip planning product for Thailand.
colors:
  ubon-green: "#116045"
  ubon-green-dark: "#0d4e38"
  ubon-green-soft: "#e7f0ec"
  forest-hero: "#0d1a14"
  public-bg: "#f7f6f2"
  field-bg: "#f4f2ee"
  field-warm: "#f3f1ed"
  border-warm: "#eae8e3"
  divider-warm: "#ebe9e4"
  ink: "#111111"
  ink-soft: "#555555"
  muted: "#888888"
  admin-bg: "#0e0e0e"
  admin-panel: "#141414"
  admin-field: "#1a1a1a"
  admin-muted-panel: "#222222"
  success: "#4ecf9a"
  warning: "#f0a500"
  rating: "#f5a623"
  danger: "#e05252"
  danger-dark: "#c0392b"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "clamp(3.2rem, 7.5vw, 5.8rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  modal: "16px"
  pill: "100px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "32px"
  page-x: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ubon-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.ubon-green-dark}"
    textColor: "{colors.white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
    typography: "{typography.body}"
  input-public:
    backgroundColor: "{colors.field-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    typography: "{typography.body}"
  card-public:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  card-admin:
    backgroundColor: "{colors.admin-panel}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "22px"
---

# Design System: Teawinai

## 1. Overview

**Creative North Star: "Local Guide Console"**

Teawinai is a product UI for turning local travel knowledge into useful trip decisions. The design should feel simple, trustworthy, and modern: a calm console for finding places, planning around budget and location, and keeping place data accurate.

The system combines a warm public travel surface with a denser admin surface. Public screens use off-white backgrounds, white content panels, Ubon Green actions, real destination imagery, and compact Thai-first forms. Admin screens use a dark operational surface with the same green accent, tighter density, tables, tabs, queues, and approval controls.

This system rejects hotel-booking visual language. No deal pressure, luxury reservation polish, room-search patterns, or generic travel marketplace templates. Local recommendations must feel like useful community knowledge, not advertisements.

**Key Characteristics:**
- Thai-first sans typography with a compact product scale.
- Ubon Green as the single brand and action accent.
- Flat surfaces by default, with soft lift only on interactive or image-led cards.
- Clear state language for filters, approval queues, forms, tables, and errors.
- Public pages stay approachable; admin pages stay dense and task-focused.

## 2. Colors

The palette is restrained: one deep local green, warm public neutrals, and a dark admin layer.

### Primary
- **Ubon Green**: The primary brand, action, focus, selection, and progress color. Use it for CTAs, active filters, nav emphasis, admin progress bars, approval affordances, and important links.
- **Deep Ubon Green**: Hover and active state for primary actions. Use it when a green control needs a clear response without adding a second accent.
- **Soft Ubon Green**: Low-emphasis selected states and focus glows. Use this for active chips, field rings, and low-pressure contextual emphasis.

### Secondary
- **Rating Gold**: Rating stars and score emphasis only. Keep it out of primary actions.
- **Queue Amber**: Pending status, budget trend signals, and warning-adjacent states.
- **Action Red**: Destructive actions, rejected updates, and error states.

### Neutral
- **Public Linen**: Main background for exploration and detail pages.
- **Warm Field**: Form fields, select controls, chip resting states, and skeleton surfaces.
- **Warm Border**: Card borders, dropdown borders, dividers, and low-contrast structure.
- **Near Black Ink**: Primary text on public surfaces.
- **Soft Ink**: Secondary labels and short supporting metadata.
- **Admin Night**: Admin page body background.
- **Admin Panel**: Admin cards, tables, sidebars, and update cards.
- **Admin Field**: Search fields, modal inputs, and dark form controls.

### Named Rules

**The One Accent Rule.** Ubon Green is the only brand accent. Do not add a competing blue, purple, or booking-app orange for primary UI.

**The Surface Split Rule.** Public discovery screens use light warm surfaces. Admin and review workflows use dark operational surfaces. Do not mix both moods inside the same task area.

## 3. Typography

**Display Font:** Noto Sans Thai, sans-serif  
**Body Font:** Noto Sans Thai, sans-serif  
**Label/Mono Font:** Noto Sans Thai, sans-serif

**Character:** One Thai-capable sans carries the whole product. The interface uses weight, size, spacing, and density instead of multiple font families.

### Hierarchy
- **Display** (900, clamp(3.2rem, 7.5vw, 5.8rem), 1): Home hero only. Do not use this scale inside forms, cards, tables, or admin panels.
- **Headline** (700, clamp(1.6rem, 3vw, 2.2rem), 1.2): Page titles on public listing and detail pages.
- **Title** (700, 18px, 1.25): Card, modal, table, and admin section titles.
- **Body** (400, 13px, 1.6): Form controls, card copy, table content, and dense UI labels. Long prose should stay under 75ch.
- **Label** (600, 9-11px, 0.1em to 0.2em): Short metadata labels, filter labels, table headers, and status markers. Use uppercase English sparingly and avoid all-caps Thai body copy.

### Named Rules

**The Product Scale Rule.** Keep typography fixed and compact on task screens. Fluid type belongs only to hero and page-level display moments.

**The Thai Legibility Rule.** Placeholder text, labels, and error messages must remain readable. Muted gray is allowed only when contrast is still clear on the actual surface.

## 4. Elevation

The system is flat with soft lift on cards. Borders and tonal surfaces do most of the structure. Shadows appear for image cards, dropdowns, hero booking panels, modals, and hover feedback, never as decoration on every surface.

### Shadow Vocabulary
- **Hero Booking Lift** (`0 32px 80px rgba(0,0,0,0.35), 0 4px 20px rgba(0,0,0,0.15)`): Use for the home planning card over photography only.
- **Dropdown Lift** (`0 8px 32px rgba(0,0,0,0.15)`): Use for navbar dropdowns and small overlays.
- **Place Card Hover** (`0 16px 40px rgba(0,0,0,0.1)`): Use only when a public card becomes interactive on hover.
- **Modal Lift** (`0 32px 80px rgba(0,0,0,0.5)`): Use for admin modal focus over dark backdrops.
- **Focus Ring** (`0 0 0 3px rgba(17,96,69,0.08)`): Use for public inputs and selects.

### Named Rules

**The Resting Flat Rule.** Cards are bordered and flat at rest. Lift appears in response to hover, overlay context, or hero layering.

## 5. Components

### Buttons
- **Shape:** Gently rounded rectangles for product actions (8-10px), pills only for navbar CTAs and chips.
- **Primary:** Ubon Green background with white text. Public search buttons use 10px 20px padding; hero CTA uses a larger 14px block rhythm.
- **Hover / Focus:** Darken to Deep Ubon Green, add a small translateY(-1px) only on public CTAs. Keep admin action buttons faster and flatter.
- **Secondary / Ghost:** Transparent or dark-tinted controls with visible borders. Ghost buttons in the navbar remain white-on-green, not gray-on-green.

### Chips
- **Style:** Pill shape, compact 12px text, warm neutral resting background, transparent border at rest.
- **State:** Selected chips use Soft Ubon Green background, Ubon Green border, and Ubon Green text. Hover can preview the selected border color.

### Cards / Containers
- **Corner Style:** Public cards and filter panels use 14px. Admin panels use 14px. Modals may use 16px.
- **Background:** Public cards are white on Public Linen. Admin cards are Admin Panel on Admin Night.
- **Shadow Strategy:** Public place cards lift on hover. Admin cards rely on borders and tonal contrast.
- **Border:** Public cards use Warm Border. Admin cards use low-alpha white borders.
- **Internal Padding:** Filter panels and admin sidebars use 22-24px. Dense rows use 12-16px.

### Inputs / Fields
- **Style:** Public fields use warm neutral backgrounds, 8-9px radius, and transparent borders until focus. Admin fields use dark filled backgrounds with subtle borders.
- **Focus:** Public fields get Ubon Green border plus soft green ring. Admin fields get Ubon Green border and smaller dark-mode ring.
- **Error / Disabled:** Errors use Action Red with light red background on public surfaces. Disabled controls reduce opacity but keep shape and layout stable.

### Navigation
- **Style:** Fixed Ubon Green top bar with compact 60px height, white text, Lucide icons, and active underline.
- **Desktop:** Center links use 13px labels with subtle hover fill. Search sits inside a translucent pill.
- **Mobile:** Links collapse into a dark green panel. Search remains available before navigation links.
- **Dropdown:** White dropdown on public nav with 10px radius, Warm Border, and Dropdown Lift.

### Place Cards

Image-led public cards show destination imagery first, then name, price, category, address, rating, and a detail action. Category badges and price badges should stay small and functional. The card is clickable, but the detail button must remain a clear action target.

### Admin Tables And Queues

Admin tables use dark panels, 9px tracked headers, 13px row content, thumbnail or emoji leading markers, status pills, and icon-only action buttons. Approval queue controls use green for approve and red for reject, with compact 30px square targets.

## 6. Do's and Don'ts

### Do:
- **Do** use Ubon Green for primary actions, active filters, progress, and approval state.
- **Do** keep public discovery surfaces light, readable, and image-led.
- **Do** keep admin surfaces dense, dark, and operational.
- **Do** use Noto Sans Thai across the interface for consistent Thai rendering.
- **Do** represent loading with skeleton surfaces where content shape is predictable.
- **Do** keep buttons, fields, chips, and cards consistent across public and admin surfaces, changing only tone and density.

### Don't:
- **Don't** make Teawinai look or feel like a hotel-booking app.
- **Don't** use room-search patterns, deal badges, reservation pressure, luxury-travel polish, or generic travel marketplace templates.
- **Don't** make local recommendations feel like advertisements instead of useful community knowledge.
- **Don't** add competing primary colors for core actions. The Tailwind blue scale is not the product identity.
- **Don't** overuse shadows. If every card floats, none of them feel actionable.
- **Don't** use decorative motion that does not convey state.
- **Don't** change button shapes or input vocabulary from screen to screen without a product reason.
