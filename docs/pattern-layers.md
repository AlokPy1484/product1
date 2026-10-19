# Pattern layers

The shared `components/layers/layer-panel.tsx` editor is used by the desktop sidebar, mobile canvas drawer, and component background controls. Its styles use the existing design tokens and dark panel surfaces.

- Layer rows are ordered topmost first. Adding a layer inserts it at the top and expands it; only one row expands at a time. Collapsing never hides its pattern.
- Each layer has its own name, type, scale, spacing, opacity, rotations, colors, and transparent background switch. Dots hide rotation controls; stripes use one rotation; grids use both.
- New layers are transparent, with a foreground chosen against the first opaque background beneath. The initial layer is opaque. An opaque layer covers backgrounds below it, as CSS background ordering requires.
- Only the grip starts a drag. A focused grip accepts Up and Down for keyboard reordering and announces its position. Add, reorder, and accordion transitions share 240ms timing and honor reduced motion. Field scrolling and sliders do not drag rows.
- Reset layer preserves the row’s name, position, and transparency setting and restores its pattern defaults. Home Reset design restores one default layer. Workspace Reset design removes all target overrides and restores original backgrounds without changing imported HTML/CSS.
- The footer contains Presets and Copy all layers. Presets require an expanded layer and affect only that layer. Copy exports plain CSS declarations for the entire current stack. Component controls also offer their existing complete component export.
- Removing the final home layer leaves a blank white canvas. Removing the final component layer restores that target’s original background.

## State and rendering

`lib/pattern-layers.ts` owns validation and immutable stack operations. Stable layer IDs preserve selection through reordering. The maximum stack is 50 layers.

`getLayerStackCSS` in `app/utils.ts/pattern-utils.ts` flattens each pattern into CSS backgrounds in row order. A grid contributes two images; dots contribute their own size. Opaque backgrounds use solid gradients immediately below their layer’s pattern. The canvas, clipboard, sandbox bridge, and component export use this same generator.

`GridConfigContext` stores `{ version: 2, stack }` under `dotgrid:pattern-layers:v2`. Existing `dotgrid:pattern-config:v1` settings migrate into Layer 1 when no valid stack is saved. Layer names, order, controls, transparency, and expanded state survive reloads. Browser storage errors do not stop editing or copying.

Component projects store one stack per target in schema version 2. Their IndexedDB and refresh recovery paths validate and migrate version 1 single configurations. The iframe stays mounted during layer edits and receives validated stacks over the existing private MessageChannel.

## Checks

`tests/layers-model.spec.ts` covers stack operations, CSS composition and project migration. `tests/layers-ui.spec.ts` covers legacy home migration, editing/reset scope, pointer and keyboard reordering, footer export, persistence, mobile controls and component integration. The existing component preview tests continue to verify sandbox isolation and clean exports.
