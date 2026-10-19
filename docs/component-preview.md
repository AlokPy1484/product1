# Component import and live preview

The home canvas and its pattern configuration remain independent. The only home entry point is the circular Upload component button in the existing header actions. The workspace and sanitizer load on first use.

## Workflow

1. Choose HTML and optional CSS files together, drop them into Import, or paste HTML/CSS. Combined source limit: 2 MB. A document may contain up to 5,000 elements / 1,000 background containers.
2. Start from Landing hero, Pricing cards, or Newsletter if no file is available.
3. Click Select element, then choose a section/card. The Target dropdown is the keyboard alternative and includes zero-size elements; Parent moves to the nearest selectable ancestor.
4. Apply a pattern or add a layer. Each target has an independent layer stack. Expand a layer to edit its type, geometry, colors, and transparency; drag its grip or use Up/Down on the grip to reorder. The top row renders on top. Footer presets apply to the expanded layer; Copy all layers copies that target’s complete background. The controls use `docs/design-system/tokens.css`.
5. Restore original background removes that target's stack without touching the other targets. Removing its last layer does the same. Reset layer resets only its pattern controls; the workspace header’s Reset design restores every original background while keeping the imported source.
6. Export CSS, copy it, or download the edited static HTML. The downloaded HTML contains generated `dotgrid-bg-*` classes and their matching rules. If copying only CSS, add those classes to the original markup. Download HTML to remove conflicting inline background declarations automatically.

Desktop is fluid; tablet and mobile modes use real 768px / 375px iframe widths. Overflow is contained in the preview. On small screens, background controls open from the bottom of the workspace.

## Isolation

- DOMPurify sanitizes imported HTML. Scripts, inline handlers, nested frames, executable embeds, base URLs, meta directives, and user-provided instrumentation are removed.
- The preview iframe has `sandbox="allow-scripts"` without `allow-same-origin`. Only the trusted picking/update bridge is allowed to execute by a per-document nonce CSP. Uploaded scripts remain disabled.
- The parent checks the iframe window, opaque origin and session before transferring a MessageChannel. The child checks the parent window, origin and session. Subsequent messages use that private port and validate their shape.
- CSP blocks remote assets by default and always blocks fetch connections, frames, objects, and form submission. Explicitly enabling remote assets allows HTTPS styles, images, and fonts, which contact their original hosts.
- Links and submissions are intercepted inside the preview. Relative images/styles/fonts cannot resolve to their original files; import CSS contents separately and use embedded assets or absolute HTTPS URLs.
- The browser iframe is a rendering/security boundary, not a CPU or memory quota. Source/element limits reduce accidental overload; arbitrary application JavaScript, project bundling, ZIP extraction and uploads to a server are not supported.

## State and updates

Imported source, target IDs, selection, asset preference and per-target layer stacks are stored in IndexedDB (`dotgrid-components`, `workspace`, `current`). Data is validated on restore. Version 2 projects migrate saved version 1 target configurations into single opaque layers without changing source or target IDs. Saving is debounced; closing waits for the final IndexedDB commit. Page hide/visibility changes also write a temporary synchronous localStorage recovery snapshot, so a refresh cannot outrun the last edit. A successful newer IndexedDB save clears that snapshot. When storage fails, editing/export remain available and a message explains that saving failed. Nothing is sent to an application server.

The iframe document is prepared only on import/source replacement. Slider changes are batched to an animation frame and send configurations over the port; they do not replace `srcDoc`. The bridge interpolates numeric values/colors over 160ms, starts interrupted transitions from their displayed values, and honors reduced motion. Pattern type changes update the image immediately. Original inline styles are captured before the first override and restored exactly.

Changing source creates a new document and clears target bindings; reopening Import without changing HTML/CSS preserves them. Closing the workspace returns to the existing canvas and retains the workspace for reopening. Page reload restores the saved workspace only when the Upload button is opened.

## Export contract

The download is a sanitized static HTML document, including inline/imported CSS, plus generated background rules. It excludes executable scripts, preview tooling, selection outlines, sandbox CSP and internal target IDs. Remote asset references remain subject to the downloaded document's environment. Edited backgrounds use `!important`; other original styles are preserved.

## Validation

```sh
npx playwright install chromium
npm run test:e2e
npm run lint
npm run build
```

For a running server, use `DOTGRID_TEST_URL=http://localhost:3001 npm run test:e2e`. The default test configuration starts a server on port 3100. The browser tests cover independent home settings, nested selection, per-target edits, restoration, source files and limits, real viewport widths, persistence, remote asset consent, script/network/navigation isolation, clipboard failure, and clean exports.
