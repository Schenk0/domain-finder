---
name: Domain Finder
description: A Porkbun-powered domain finder for projects, apps, and tiny bets.
colors:
  vermillion-seal: "oklch(0.44 0.17 8)"
  pure-white: "oklch(1.000 0.000 0)"
  quiet-surface: "oklch(0.965 0.000 0)"
  press-ink: "oklch(0.145 0.008 10)"
  cobalt-annotation: "oklch(0.55 0.14 260)"
  secondary-ink: "oklch(0.49 0.005 10)"
  specimen-green: "oklch(0.52 0.14 155)"
  warm-caution: "oklch(0.72 0.14 80)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  sm: "3px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.vermillion-seal}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "oklch(0.38 0.18 8)"
    textColor: "{colors.pure-white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  input-field:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
  card-panel:
    backgroundColor: "{colors.pure-white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-available:
    backgroundColor: "oklch(0.95 0.03 155)"
    textColor: "{colors.specimen-green}"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
  badge-taken:
    backgroundColor: "oklch(0.95 0.03 25)"
    textColor: "oklch(0.50 0.14 25)"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
---

# Design System: Domain Finder

## 1. Overview

**Creative North Star: "The Type Specimen"**

A type specimen page printed on heavy, uncoated stock. Each domain is a glyph on display: precisely set, calmly spaced, presented without ornament. The vermillion seal marks what matters. The rest is white space and press ink.

The system values precision over softness. Tight radii, firm edges, crisp state changes. Nothing floats; elements sit flat on the page, separated by tone and ruled lines. Information is dense but never cluttered: the table is the native element, not a compromise. The search form is a specimen's caption field: functional, labeled, restrained.

This is not a SaaS dashboard with blue buttons and soft shadows. It is not a cute illustration-driven app. It is not a dark-mode terminal emulator. It is not a bland gray wireframe. It is a considered instrument with a single spot color and the confidence to let white space and typography carry the design.

**Key Characteristics:**
- Pure white canvas, zero tint. The red seal earns its intensity because the surface is neutral.
- Flat elevation. Depth through tonal shifts and 1px ruled borders, never shadows.
- Tight, decisive radii (3-8px). Rounded enough to read as finished, sharp enough to read as precise.
- Two-family type pairing: Bricolage Grotesque (display, irregular, hand-pressed quality) and Archivo (body, clean mechanical grotesque). The contrast is deliberate: the display whispers "letterpress" while the body says "data."
- One committed brand color (vermillion seal) used at key moments. Not spread everywhere. Its rarity is its power.

## 2. Colors

A committed palette anchored by a single vermillion. The rest of the surface is achromatic: white, near-black, and grays. Cobalt appears only for interactive annotations (links, focused states). Status colors are semantic and self-contained.

### Primary
- **Vermillion Seal** (oklch(0.44 0.17 8)): The brand's one saturated color. Used for the primary CTA, active states, starred domain highlights, and the "Porkbun first" label. Dark enough for white text at all sizes. Carries the weight of every decision on the page.

### Secondary
- **Cobalt Annotation** (oklch(0.55 0.14 260)): Links, focus rings, and interactive affordances. A deep blue with enough saturation to read clearly against white but enough darkness to feel considered, not electric. Hue-distant from primary (260 vs 8) so the two never compete.

### Neutral
- **Pure White** (oklch(1.000 0.000 0)): Page background and panel fills. No warmth, no tint, no chroma. The specimen's uncoated stock.
- **Quiet Surface** (oklch(0.965 0.000 0)): Table header rows, section backgrounds, filter bars. A step down from white that creates tonal separation without borders.
- **Press Ink** (oklch(0.145 0.008 10)): Body text and domain names. Near-black with the faintest warmth from the brand hue. ≥15:1 contrast against white.
- **Secondary Ink** (oklch(0.49 0.005 10)): Descriptions, helper text, metadata. Muted but still above 4.5:1 on white.

### Semantic
- **Specimen Green** (oklch(0.52 0.14 155)): "Available" status only. Not used for brand expression.
- **Warm Caution** (oklch(0.72 0.14 80)): Star/favorite highlights, premium badges, rate-limit warnings.
- **Taken** (oklch(0.50 0.14 25)): "Taken" and error states. A warm red-orange distinct from primary so status and brand don't blur.

### Named Rules
**The Seal Rule.** Vermillion appears on no more than 3 elements per viewport. Its rarity is the point. If the red is everywhere, it's not a seal, it's wallpaper.

**The Achromatic Canvas Rule.** The background is always pure white (oklch(1.000 0.000 0)) or quiet surface (oklch(0.965 0.000 0)). No warm tints, no cool tints, no cream, no sand. Brand warmth lives in the vermillion and in the type, not in the canvas.

## 3. Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif fallback)
**Body Font:** Archivo (with system-ui, sans-serif fallback)

**Character:** Bricolage Grotesque has the slightly irregular stroke width and optical quirks of hand-set type — each letter looks placed, not generated. Archivo is its counterpoint: a clean, slightly squared grotesque that handles data-dense tables and labels without fuss. The pairing reads as "considered print studio meets functional instrument."

### Hierarchy
- **Display** (800, clamp(2.5rem, 8vw, 5.5rem), line-height 0.92, tracking -0.025em): The "Domain Finder" title in the hero state. Tight leading, compressed, fills the viewport. Scales down to compact mode at clamp(1.8rem, 5vw, 3.2rem).
- **Headline** (700, clamp(1.4rem, 3vw, 2rem), line-height 1.15, tracking -0.015em): Section heads like "Starred domains" and "Domain candidates." Firm and clear.
- **Body** (400, 0.94rem, line-height 1.55): Descriptions, reason text, helper copy. Capped at 65ch line length.
- **Label** (700, 0.76rem, line-height 1.2, tracking 0.02em, uppercase): Table headers, filter labels, section kickers. Always uppercase but never more than 3 words. Archivo at this size reads as instrument-panel lettering.

### Named Rules
**The Two-Family Rule.** Bricolage Grotesque for display and headlines. Archivo for everything else. No third family. No exceptions.

**The Label Ceiling Rule.** Uppercase labels are capped at 3 words. Longer text drops to sentence case. The label is a stamp, not a sentence.

## 4. Elevation

Flat by default. No box-shadows in the resting state. Depth is communicated through tonal shifts (white panel on quiet-surface background) and 1px ruled borders in secondary-ink or quiet-surface tones.

The only shadow in the system is a micro-shadow on the search form's focused state: `0 0 0 3px oklch(0.55 0.14 260 / 0.15)` — a cobalt focus ring, not a depth cue. This is an accessibility affordance, not a design embellishment.

### Named Rules
**The Flat Press Rule.** Surfaces do not float. They sit on the page like printed elements: separated by rules and whitespace, not by simulated depth. If an element needs to feel "above" the page, use a tonal shift (quiet-surface to white), not a shadow.

## 5. Components

### Buttons
- **Shape:** Tight radius (6px). No pill shapes.
- **Primary:** Vermillion seal fill, white text, 10px 20px padding. Font: Archivo 700. The CTA is the seal on the page.
- **Hover:** Darkens to oklch(0.38 0.18 8). No scale, no shadow lift. A 120ms color transition (ease-out).
- **Focus:** 3px cobalt ring offset by 2px. Keyboard users see the annotation color, not the brand color.
- **Ghost:** Transparent fill, press-ink text, 1px quiet-surface border. Hover fills to quiet-surface. Used for secondary actions (Check, filter controls).

### Badges / Status Pills
- **Shape:** Tight radius (3px), near-rectangular.
- **Available:** Specimen-green text on a pale green tint (oklch(0.95 0.03 155)).
- **Taken / Error:** Taken-red text on a pale warm tint (oklch(0.95 0.03 25)).
- **Premium / Warning:** Warm-caution text on a pale amber tint (oklch(0.96 0.03 80)).
- **All badges:** Archivo 700, 0.76rem, no uppercase. The badge shape distinguishes it from body text; caps would over-signal.

### Cards / Panels
- **Corner Style:** 8px radius.
- **Background:** Pure white.
- **Border:** 1px quiet-surface (oklch(0.965 0.000 0)). No shadows.
- **Internal Padding:** 20px (desktop), 16px (mobile).
- **Header Sections:** Separated by a 1px ruled border. Section label (uppercase label style) + headline + optional description.

### Inputs / Fields
- **Style:** 1px border in secondary-ink at 30% opacity. Pure white fill. 6px radius.
- **Focus:** Border shifts to cobalt-annotation. 3px cobalt ring at 15% opacity. Transition: 120ms ease-out.
- **Placeholder:** Secondary-ink color. Must meet 4.5:1 contrast on white.
- **Textarea:** Same treatment, min-height 92px, resize-y.

### Domain Table
- **The signature component.** The table IS the product. It should feel like a specimen catalog: each row a domain on display, each column a measured annotation.
- **Header row:** Quiet-surface background, uppercase label type, 1px bottom border.
- **Body rows:** White background, 1px bottom border. Hover shifts to quiet-surface. Starred rows shift to a pale amber tint.
- **Group headers:** Quiet-surface background with a subtle blue tint (oklch(0.96 0.005 260)), headline-weight group name + secondary-ink description.
- **Domain names:** Press-ink for the base name, cobalt-annotation for prefixes/suffixes, vermillion-seal for domain hacks (the cleverest candidates get the seal), secondary-ink for the dot, specimen-green for TLDs.
- **Min-width:** 980px with horizontal scroll on narrow viewports. The table doesn't compress; it scrolls. Data density is a feature.

### Navigation
Not applicable — single-page tool with no navigation.

## 6. Do's and Don'ts

### Do:
- **Do** use vermillion (oklch(0.44 0.17 8)) only for the primary CTA, starred-row highlights, and domain-hack coloring. Count the red elements per viewport: if it exceeds 3, one of them is wrong.
- **Do** maintain pure white backgrounds with zero chroma. If the Tailwind class includes `slate-50` or `gray-50` as a surface, replace it with quiet-surface (oklch(0.965 0.000 0)).
- **Do** set all body text in Archivo at ≥0.94rem. Secondary text may be smaller (0.76rem) but never lighter than secondary-ink (oklch(0.49 0.005 10)).
- **Do** use flat 1px borders for separation. The border color is quiet-surface or secondary-ink at 30% opacity, never a tinted color.
- **Do** apply tight, decisive radii (3-8px). Every interactive element has a border-radius; none exceed 8px except full-round on icon-only buttons (star toggle).
- **Do** test every text element for WCAG AA contrast on its actual background.

### Don't:
- **Don't** use blue as the primary color. No `blue-700`, no `blue-800`. Blue is the current default and reads as generic SaaS (anti-reference: "no blue-and-white dashboards, no corporate UI patterns").
- **Don't** add box-shadows for depth. Tonal shifts and borders only. Shadows make this look like every other card-based UI (anti-reference: "no bland minimalism").
- **Don't** use rounded-full (pill shapes) on buttons or panels. Reserve full-round for the star toggle only. Pill-shaped buttons read as cute (anti-reference: "no bubbly pastels, no playful-for-its-own-sake").
- **Don't** apply gradients to any element. No gradient backgrounds, no gradient text, no gradient borders.
- **Don't** add illustrations, emoji, or decorative icons. The interface communicates through typography and color. Lucide icons remain for functional affordances only (search, star, chevron, external link).
- **Don't** use dark mode. This is a white-canvas specimen; inverting it would destroy the metaphor. A dark variant could exist someday as a separate, deliberate design, never as a toggle.
- **Don't** tint the background warm (cream, sand, beige, paper). The pure white is structural: the vermillion seal reads as powerful because the canvas is neutral. Warm-tinted backgrounds are the saturated AI default (anti-reference).
- **Don't** use monospace for any element. Monospace would invoke "developer tool" / "hacker aesthetic" — exactly the anti-reference.
