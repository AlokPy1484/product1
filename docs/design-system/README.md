# dotgrid.io design system

Source audit · 17 October 2026 · version 1.0

This system names the visual decisions already present in this checkout. It does not redesign the product or change the running UI. The token stylesheet is intentionally not imported by the application.

## Deliverables

- [Visual reference](preview.html): palette, radius specimens, typography, controls, spacing, and motion reference.
- [CSS custom properties](tokens.css): namespaced `--dg-*` tokens, ready for incremental adoption.
- [JSON manifest](tokens.json): values, descriptions, status, and source locations, including Motion spring settings. This is a project manifest, not a claimed DTCG/Figma interchange format.

## What was audited

The current project is `/Users/alokpandey/Desktop/Website_dev/product1`. The old `/Users/alokpandey/Desktop/product1` directory is absent. This checkout uses the single-pattern `PatternControls` sidebar; it has no `layers-panel.tsx`. Earlier layer screenshots and the earlier 450ms accordion timing are therefore not used as evidence for this system.

Primary sources: [global theme](../../app/globals.css), [layout](../../app/layout.tsx), [sidebar](../../components/ui/sidebar.tsx), [pattern controls](../../components/ui/main/pattern-controls.tsx), [header](../../components/ui/main/main-header.tsx), [mobile drawer](../../components/ui/main/mobile-pattern-drawer.tsx), [buttons](../../components/ui/button.tsx), [range slider](../../components/ui/range-slider.tsx), [dropdown](../../components/ui/dropdown-menu.tsx), [tooltip](../../components/ui/tooltip.tsx), [toast](../../components/ui/toast.tsx), [motion helpers](../../lib/ease.ts), and [contrast helper](../../lib/color-contrast.ts).

Demo components, commented-out navbar/page implementations, `MainSidebarOld.tsx`, unused chart colors, and unused motion helpers are not treated as active product decisions. Generic component variants and dark-mode overrides remain available foundation tokens.

This is a source audit, not a computed-style/browser audit. Dependencies are not installed in this checkout. Tailwind defaults were checked against the exact **4.3.3 package tarball pinned in package-lock.json**, without installing it or changing the lockfile. Rem-to-pixel equivalents below assume a 16px browser root size.

## Token hierarchy

1. **Primitives** describe raw values: `--dg-neutral-900`, `--dg-space-4`, `--dg-radius-4xl`.
2. **Semantic tokens** describe roles: `--dg-color-panel`, `--dg-color-text-secondary`.
3. **Component aliases** connect roles to recurring shapes and dimensions: `--dg-radius-panel`, `--dg-size-slider-track`.
4. **Foundation tokens** record existing shadcn defaults independently: `--dg-foundation-background`, `--dg-foundation-dark-background`.

JSON status meanings:

| Status | Meaning |
| --- | --- |
| `observed` | Found in the current product/component source |
| `dependency` | Exact pinned Tailwind value used to resolve a utility |
| `scale` | Member of an existing declared scale, not necessarily used directly |
| `available` | Declared variant/helper not activated by the current editor |

The `sources` arrays are an audit index. Some scale entries cite the owning component or theme rather than a separate declaration for every value.

## Color

The application has a light global foundation and explicitly dark editor surfaces. These must remain distinct during adoption.

| Semantic CSS token | Current utility/source | Nearest sRGB | Role |
| --- | --- | --- | --- |
| `--dg-color-panel` | `neutral-900` | `#171717` | Sidebar sections, drawer, header pill |
| `--dg-color-control` | `neutral-800` | `#262626` | Buttons, tracks, preset popup |
| `--dg-color-toast` | `neutral-950` | `#0a0a0a` | Toast surface |
| `--dg-color-page-base` | `neutral-100` | `#f5f5f5` | Body fallback beneath the canvas |
| `--dg-color-text-primary` | `neutral-100` | `#f5f5f5` | Editor labels and values |
| `--dg-color-text-soft` | `neutral-200` | `#e5e5e5` | Menu/toast text |
| `--dg-color-text-secondary` | `neutral-400` | `#a1a1a1` | Parameter names |
| `--dg-color-border-control` | `neutral-700` | `#404040` | Control outlines |
| `--dg-color-action-surface` | `neutral-100` | `#f5f5f5` | Light pattern-type button |
| `--dg-color-action-text` | `neutral-900` | `#171717` | Pattern-type label |
| `--dg-color-action-hover` | `neutral-300` | `#d4d4d4` | Pattern-type hover |
| `--dg-color-drawer-handle` | `neutral-500` | `#737373` | Visual drawer grip |

OKLCH is the authoritative palette representation in `tokens.css`. Hex values are rounded 8-bit sRGB equivalents, not replacements for the source values.

**Status:** The avatar badge uses Tailwind green-600, with a green-800 dark variant. No green brand accent, success panel, or warning palette is inferred from this. Error primitives use the existing `--destructive` theme value. Success toasts currently use a neutral icon rather than a separate green success token.

**Overlays:** drawer backdrop black at 5%; generic sheet backdrop black at 10%. Disabled controls use 50% opacity. The slider fill uses global foreground at 15%, ticks at 25%, and its focus ring at 30%.

**Dynamic brand:** `--dg-color-label-adaptive` and `--dg-color-label-outline` reference the existing runtime variables. The helper chooses black or white based on background luminance; the outline is the opposite color, 0.4px wide. It evaluates the configured background color, not every rendered gradient pixel. These are dynamic outputs, not fixed brand colors.

**Pattern colors:** default black/white, preset greens, and custom user colors are document content. They must not change the editor's fixed palette or become global brand tokens.

## Radius

`--radius: 0.625rem` is 10px. The custom `@theme inline` multiplies that value. This overrides Tailwind's standard radius names.

| Token / utility | Actual value | Current use |
| --- | --- | --- |
| `radius-sm` / `rounded-sm` | 6px | Slider thumb |
| `radius-md` / `rounded-md` | 8px | Tooltips, primitive rows |
| `radius-lg` / `rounded-lg` | 10px | Track, base button, input, dropdown |
| `radius-xl` / `rounded-xl` | 14px | Available theme scale |
| `radius-2xl` / `rounded-2xl` | 18px | Toast, generic card family |
| `radius-3xl` / `rounded-3xl` | 22px | Available theme scale |
| `radius-4xl` / `rounded-4xl` | **26px** | Floating sidebar, header pill, control shells |
| `radius-full` / `rounded-full` | Capsule/circle | Reset, profile, color swatches, grip |

`--dg-radius-full: 9999px` is a practical capsule alias; it does not claim Tailwind literally uses that source value. Preserve top-only rounding for drawer/header and bottom-only rounding for the footer.

Parent clipping is part of the component contract: a rounded panel should clip child backgrounds at the same curve, while an inner content region owns scrolling. The current sidebar does not apply `overflow-hidden` to its inner rounded shell; that is an existing discrepancy, not changed by these documentation assets.

## Typography

| Role | Font | Size / line height | Weight |
| --- | --- | --- | --- |
| UI labels, values, base buttons | Geist Sans | 14 / 20px | 400; buttons 500 |
| Pattern-type and bookmark labels | Geist Sans | 16px, inherited 20px line height | 500 from Button |
| Tooltip | Geist Sans | 12 / 16px | 400 |
| Brand, mobile | Geist Sans | 14 / 20px | 700 |
| Brand, desktop | Geist Sans | 16 / 24px | 700 |
| Code/data font available | Geist Mono | Component-defined | Not used as default UI font |

Values use `tabular-nums`; labels use ordinary numerals. The icon baseline is 16px. Current Lucide stroke widths vary by use: reset 1, walkthrough 1.5, otherwise the icon default. There is no active heading-size system beyond the brand and small component titles.

`font-geist` and `font-` appear in class strings but are not defined theme utilities. The effective family is the global `font-sans` mapping to the font loaded by next/font. Do not turn invalid class names into tokens.

## Spacing, sizing, layout

Base spacing unit: **4px** (`0.25rem`). Preserve existing half steps where used.

| Token suffix | Pixel equivalent | Typical use |
| --- | --- | --- |
| `space-0-5` | 2 | Micro gaps |
| `space-1` | 4 | Popup padding, drawer grip height |
| `space-1-5` | 6 | Base button icon gap |
| `space-2` | 8 | Control gaps, inner group padding |
| `space-2-5` | 10 | Base button horizontal padding |
| `space-3` | 12 | Slider label gap, tooltip horizontal padding |
| `space-4` | 16 | Panel padding and desktop screen inset |
| `space-5` | 20 | Thumb height / scale member |
| `space-6` | 24 | Main content padding |
| `space-8` | 32 | Existing spacing scale |

- Buttons: xs 24px, small 28px, default 32px, large 36px.
- Mobile drawer buttons: minimum 44px; reset is 44px mobile / 32px desktop.
- Mobile header hit areas: 40px. Keep this recorded separately rather than falsely describing the whole UI as having a 44px minimum.
- Slider track: 40px high; thumb: 6 × 20px; tick: 4px; tick inset: 3px.
- Color swatch: 32px; avatar small: 24px.
- Desktop sidebar outer width: 24rem (384px), including 16px per-side inset, leaving a 352px inner panel at browser defaults.
- Drawer visual handle: 40 × 4px in a 48px handle row.
- Drawer height: `min(80dvh, 46rem)`, limited by `calc(100dvh - 1rem)`.
- Drawer collapsed peek: 40px plus bottom safe-area inset.
- Drawer side gap: 2px below 360px; 4px from 360px upward.
- Desktop switch: Tailwind `md` at 48rem; JS currently uses max-width 767px.
- Toast width: max 24rem; 16px viewport inset; desktop alignment begins at `sm` (40rem).

Preserve `env(safe-area-inset-*)`, `dvh`, `svh`, overscroll containment, `min-height: 0`, and scroll boundaries. These are behavior constraints, not arbitrary spacing values. CSS custom properties cannot be substituted directly into ordinary media-query conditions; keep breakpoint numbers synchronized in Tailwind/JS rather than using `@media (min-width: var(...))`.

## Borders, depth, interaction

- Default border: 1px.
- Base button/input focus ring: 3px, theme ring at 50% opacity; explicit profile/drawer focus rings: 2px neutral-400.
- Slider focus: 4px inset, foreground at 30% opacity.
- Active base buttons translate down 1px unless they have a popup.
- Disabled: opacity 0.5 and pointer events disabled.
- Floating panel: Tailwind `shadow-sm` and a 1px ring. Popup: `shadow-md`. Toast: `shadow-lg`. Drawer: `shadow-2xl`. Exact pinned values are in CSS/JSON.
- Coming-soon hover hints use 4px backdrop blur.

Stacking contexts: canvas 0; sidebar/content 10; header 20; drawer 40; tooltip/menu/sheet/toast viewport 50. Toasts use `1000 - index` internally; that does not place them above every parent stacking context. Driver.js owns a separate external overlay and is not assigned a new application token here.

## Motion

| Role | Current duration | Easing |
| --- | --- | --- |
| Dropdown entry/exit | 100ms | Primitive animation defaults |
| Base utility transition | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Pattern changes | 160ms | Motion `easeOut` |
| Sidebar / generic sheet | 200ms | Sidebar linear; sheet ease-in-out |
| Drawer release | 240ms | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Drawer overlay | 240ms | CSS `ease` |
| Toast content | 250ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Preset item / coming-soon hint | 300ms | Existing utility/ease-in-out |
| Toast transform/opacity | 500ms | Transform uses `cubic-bezier(0.22, 1, 0.36, 1)` |
| Toast height | 150ms | Existing transition |

Slider movement uses a spring: stiffness **700**, damping **50**, mass **0.5**. Thumb grab feedback uses **500 / 14 / 0.7**, stretching to 1.35× vertically. Those are physics settings, not durations. Other spring helpers in `lib/ease.ts` are catalogued as available rather than active. This checkout contains no 450ms layer accordion implementation.

Pattern and slider components honor reduced motion. Drawer CSS disables release animation under reduced motion and while swiping. Toasts and generic utility transitions do not currently have equivalent local overrides; do not claim complete reduced-motion coverage. Future adoption should preserve the existing gesture behavior and add coverage intentionally.

## Existing differences to resolve during adoption

1. Sidebar shell uses light `bg-sidebar`, while header/content/footer explicitly use dark `bg-neutral-900`. It also lacks clipping. Map the shell to `--dg-color-panel` and establish clipping in a separate UI change.
2. Global light tokens remain active because the root layout does not set `.dark`. Slider fill/ticks using `foreground` are therefore dark tints on a dark explicit track. Record the current behavior; choose a corrected editor-specific tint deliberately rather than accidentally switching every component to dark mode.
3. Base button hover, dropdown item focus, generic borders, and toast descriptions inherit light foundation tokens under explicit dark surfaces. They are not all instances of one coherent editor state palette yet.
4. Motion helpers and inline/CSS motion definitions overlap. Token adoption should consolidate equal values without forcing physics springs into a fixed duration.
5. `--navbar-height: 50px` exists but has no active consumer; the current header uses a 48px height. Demo typography/chart palettes are not core editor tokens.

These observations are documented, not repaired as part of this task.

## How to use the system

Import `tokens.css` only when beginning a component migration. It declares namespaced variables and does not alter the existing `--background`, `--sidebar`, or Tailwind variables. Do not import the visual reference styles into the application.

```css
/* Example component adoption: retain the current shape and palette. */
.editor-panel {
  background: var(--dg-color-panel);
  color: var(--dg-color-text-primary);
  border-radius: var(--dg-radius-panel);
  padding: var(--dg-space-4);
  overflow: hidden;
}

.editor-control {
  background: var(--dg-color-control);
  border: var(--dg-border-width) solid var(--dg-color-border-control);
  border-radius: var(--dg-radius-control);
}
```

Tailwind can consume them incrementally: `bg-[var(--dg-color-panel)]`, `rounded-[var(--dg-radius-panel)]`, and `p-[var(--dg-space-4)]`. An optional later `@theme inline` mapping can provide named utilities. Review the theme/component override cascade before replacing existing classes.

For Motion, durations must be supplied in seconds and easing as numeric tuples. The JSON duration strings are CSS milliseconds; parse or convert them when sharing with JS. Spring entries are structured JSON objects. Keep `lib/ease.ts` as the existing runtime source until a deliberate migration connects it to the manifest.

For dark-mode support, the recorded `foundation-dark-*` values are a reference catalog. They do not automatically override the light `foundation-*` aliases. Implement a scoped mode mapping only when adopting that behavior.

## Validation

The deliverables are documentation and reference assets. Validate JSON parsing, unique token names, alias targets, CSS/JSON consistency, source paths/line bounds, and preview links. A production build is not needed to validate these unimported artifacts; no application behavior has been changed.
