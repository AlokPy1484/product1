import { test, expect, type Page } from "@playwright/test"
import { DEFAULT_PATTERN_CONFIG } from "../app/types/grid-config"

const home = (page: Page) => page.locator('[data-layer-panel="home"]')
const rows = (page: Page) => home(page).locator("[data-layer-id]")
const saved = (page: Page) =>
    page.evaluate(
        () =>
            JSON.parse(localStorage.getItem("dotgrid:pattern-layers:v2")!)
                .stack,
    )
const composite = (page: Page) =>
    page.locator("[data-pattern-composite]").last()
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem("hasVisited", "true")
    })
})

test("migrates the original canvas, edits layers independently and resets the right scope", async ({
    page,
}) => {
    await page.addInitScript(
        (config) => {
            if (!localStorage.getItem("dotgrid:pattern-config:v1"))
                localStorage.setItem(
                    "dotgrid:pattern-config:v1",
                    JSON.stringify(config),
                )
        },
        {
            ...DEFAULT_PATTERN_CONFIG,
            pattern: "grid",
            spacing: 38,
            primaryColour: "#123456",
        },
    )
    await page.goto("/")
    await expect(
        home(page).getByRole("button", { name: "Grid", exact: true }),
    ).toBeVisible()
    await expect(
        home(page).getByRole("slider", { name: "Spacing", exact: true }),
    ).toHaveAttribute("aria-valuenow", "38")
    await home(page)
        .getByRole("button", { name: "Add layer", exact: true })
        .click()
    await expect(rows(page)).toHaveCount(2)
    await expect(
        home(page).getByRole("checkbox", { name: "Transparent background" }),
    ).toBeChecked()
    await home(page)
        .locator('.lp-fields[aria-hidden="false"]')
        .getByLabel("Primary colour", { exact: true })
        .fill("#ff0000")
    await home(page)
        .getByRole("button", { name: "Reset layer", exact: true })
        .click()
    await expect(
        home(page)
            .locator('.lp-fields[aria-hidden="false"]')
            .getByLabel("Primary colour", { exact: true }),
    ).toHaveValue("#000000")
    expect((await saved(page)).layers[1].config.primaryColour).toBe("#123456")
    await home(page)
        .locator('.lp-fields[aria-hidden="false"]')
        .getByLabel("Layer name", { exact: true })
        .fill("Texture")
    await home(page)
        .getByRole("button", { name: "Collapse Texture", exact: true })
        .click()
    await expect(home(page).locator("[data-layer-controls]")).toHaveCount(0)
    await expect(composite(page)).toHaveCSS(
        "background-image",
        /repeating-linear-gradient/,
    )
    await expect(
        home(page).getByRole("button", { name: "Choose preset" }),
    ).toBeDisabled()
    await page.reload()
    await expect(
        home(page).getByRole("button", { name: "Expand Texture", exact: true }),
    ).toBeVisible()
    await expect(rows(page)).toHaveCount(2)
    await page
        .getByRole("button", { name: "Reset design", exact: true })
        .click()
    await expect(rows(page)).toHaveCount(1)
    await expect(
        home(page).getByRole("button", { name: "Dots", exact: true }),
    ).toBeVisible()
    await expect(
        home(page).getByRole("slider", { name: "Spacing", exact: true }),
    ).toHaveAttribute("aria-valuenow", "10")
})

test("pointer and keyboard reordering update the background order, while sliders stay controls", async ({
    page,
}) => {
    await page.goto("/")
    await home(page)
        .getByRole("button", { name: "Add layer", exact: true })
        .click()
    await home(page)
        .locator('.lp-fields[aria-hidden="false"]')
        .getByLabel("Primary colour", { exact: true })
        .fill("#ff0000")
    const spacing = home(page).getByRole("slider", {
        name: "Spacing",
        exact: true,
    })
    await spacing.focus()
    await spacing.press("ArrowRight")
    await expect(spacing).toHaveAttribute("aria-valuenow", "11")
    expect(
        (await saved(page)).layers.map((l: { name: string }) => l.name),
    ).toEqual(["Layer 2", "Layer 1"])
    await home(page)
        .getByRole("button", { name: "Collapse Layer 2", exact: true })
        .click()
    const grip = home(page).getByRole("button", {
        name: "Reorder Layer 2",
        exact: true,
    })
    await grip.focus()
    await grip.press("ArrowDown")
    await expect(rows(page).first()).toContainText("Layer 1")
    await expect(composite(page)).toHaveCSS(
        "background-image",
        /^radial-gradient\(circle, rgba\(0, 0, 0/,
    )
    // The actual grip drag must reorder too; dragging an entire control row is disabled.
    await grip.hover() // Wait for the keyboard reorder’s layout transition to settle.
    const from = (await grip.boundingBox())!
    const to = (await home(page)
        .getByRole("button", { name: "Reorder Layer 1", exact: true })
        .boundingBox())!
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2 - 8, {
        steps: 15,
    })
    await page.mouse.up()
    await expect(rows(page).first()).toContainText("Layer 2")
    await expect(composite(page)).toHaveCSS(
        "background-image",
        /^radial-gradient\(circle, rgba\(255, 0, 0/,
    )
})

test("footer presets edit the expanded layer and copying exports the complete stack", async ({
    page,
    context,
}) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/")
    await home(page)
        .getByRole("button", { name: "Add layer", exact: true })
        .click()
    await home(page)
        .getByRole("button", { name: "Choose preset", exact: true })
        .click()
    await page
        .getByRole("menuitem", { name: "Grid Preset 1", exact: true })
        .click()
    await expect(
        home(page).getByRole("button", { name: "Grid", exact: true }),
    ).toBeVisible()
    await expect(
        home(page)
            .locator("[data-layer-controls] button")
            .filter({ hasText: /Copy|Presets/ }),
    ).toHaveCount(0)
    await home(page)
        .getByRole("button", { name: "Copy all layers", exact: true })
        .click()
    const css = await page.evaluate(() => navigator.clipboard.readText())
    expect(css).toContain("background-image: repeating-linear-gradient")
    expect(css).toContain("radial-gradient")
    expect(css).toContain("background-size: auto, auto, 10px 10px, auto;")
    expect(css).not.toContain("backgroundImage")
    await home(page)
        .getByRole("button", { name: "Remove layer", exact: true })
        .click()
    await expect(rows(page)).toHaveCount(1)
    await home(page)
        .getByRole("button", { name: "Remove layer", exact: true })
        .click()
    await expect(home(page)).toContainText("No layers yet")
    await expect(
        home(page).getByRole("button", {
            name: "Copy all layers",
            exact: true,
        }),
    ).toBeDisabled()
    await home(page)
        .getByRole("button", { name: "Add layer", exact: true })
        .click()
    await expect(
        home(page).getByRole("checkbox", { name: "Transparent background" }),
    ).not.toBeChecked()
})

test("mobile drawer contains the same layers, footer and grip controls", async ({
    page,
}) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await page
        .locator("[data-drawer-handle]")
        .click({ position: { x: 100, y: 20 } })
    await expect(
        home(page).getByRole("button", { name: "Add layer", exact: true }),
    ).toBeVisible()
    await home(page)
        .getByRole("button", { name: "Add layer", exact: true })
        .click()
    await expect(rows(page)).toHaveCount(2)
    await expect(
        home(page).getByRole("button", {
            name: "Copy all layers",
            exact: true,
        }),
    ).toBeInViewport()
    await home(page)
        .getByRole("button", { name: "Collapse Layer 2", exact: true })
        .click()
    await home(page)
        .getByRole("button", { name: "Reorder Layer 2", exact: true })
        .press("ArrowDown")
    await expect(rows(page).first()).toContainText("Layer 1")
    await page
        .getByRole("button", { name: "Close pattern controls", exact: true })
        .click()
    await page
        .getByRole("button", { name: "Reset design", exact: true })
        .click()
    expect((await saved(page)).layers).toHaveLength(1)
    expect(
        await page.locator("body").evaluate((el) => el.scrollWidth),
    ).toBeLessThanOrEqual(375)
})

test("component layers stay per target, persist, export and reset all original backgrounds", async ({
    page,
}) => {
    await page.goto("/")
    await page
        .getByRole("button", { name: "Upload component", exact: true })
        .click()
    await page.getByRole("button", { name: /Landing hero/ }).click()
    await expect(page.locator("#cw-target option")).not.toHaveCount(1)
    const target = async (label: string) => {
        const option = page
            .locator("#cw-target option")
            .filter({ hasText: label })
            .first()
        await page
            .locator("#cw-target")
            .selectOption((await option.getAttribute("value"))!)
    }
    const panel = page.locator(".component-workspace [data-layer-panel]")
    const frame = page.frameLocator('iframe[title="Component preview"]')
    await target("section.hero")
    const original = await frame.locator(".hero").getAttribute("style")
    await page
        .getByRole("button", { name: "Apply pattern", exact: true })
        .click()
    await panel.getByRole("button", { name: "Add layer", exact: true }).click()
    await panel
        .locator('.lp-fields[aria-hidden="false"]')
        .getByLabel("Primary colour", { exact: true })
        .fill("#ff0000")
    await panel.getByRole("button", { name: "Dots", exact: true }).click()
    await expect(frame.locator(".hero")).toHaveCSS(
        "background-image",
        /repeating-linear-gradient.*radial-gradient/,
    )
    await target("div.art")
    await page
        .getByRole("button", { name: "Apply pattern", exact: true })
        .click()
    await expect(panel.locator("[data-layer-id]")).toHaveCount(1)
    await target("section.hero")
    await expect(panel.locator("[data-layer-id]")).toHaveCount(2)
    await page.reload()
    await page
        .getByRole("button", { name: "Upload component", exact: true })
        .click()
    await expect(panel.locator("[data-layer-id]")).toHaveCount(2)
    await expect(frame.locator(".hero")).toHaveCSS(
        "background-image",
        /repeating-linear-gradient.*radial-gradient/,
    )
    await page
        .getByRole("button", {
            name: "Export component HTML / CSS",
            exact: true,
        })
        .click()
    await expect(page.locator(".cw-export pre")).toContainText(
        "repeating-linear-gradient",
    )
    await expect(page.locator(".cw-export pre")).toContainText(
        "radial-gradient",
    )
    await page
        .getByRole("button", { name: "Close export", exact: true })
        .click()
    await page
        .locator(".component-workspace")
        .getByRole("button", { name: "Reset design", exact: true })
        .click()
    if (original === null)
        await expect(frame.locator(".hero")).not.toHaveAttribute("style")
    else await expect(frame.locator(".hero")).toHaveAttribute("style", original)
    await expect(frame.locator(".art")).toHaveCSS("background-image", "none")
    await expect(
        page.getByRole("button", { name: "Apply pattern", exact: true }),
    ).toBeVisible()
})
