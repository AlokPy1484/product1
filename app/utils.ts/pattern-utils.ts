import type { PatternConfig } from "../types/grid-config"


export function getPatternCSS(config: PatternConfig) {



    const hexToRgb = (hex: string) => {
        // Remove the #
        hex = hex.replace("#", "");

        // Handle shorthand hex (#fff)
        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((char) => char + char)
                .join("");
        }

        const bigint = parseInt(hex, 16);

        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    };






    const {
        pattern,
        primaryColour,
    } = config



    //entry 
    const dotColour = primaryColour

    const { r, g, b } = hexToRgb(dotColour)


    switch (pattern) {

        case "dots":
            return {
                backgroundImage: `radial-gradient(
        circle,
        rgba(${r},${g},${b},${config.opacity}) 0,
        rgba(${r},${g},${b},${config.opacity}) ${config.scale}px,
        transparent ${config.scale}px
    )`,
                backgroundSize: `${config.spacing}px ${config.spacing}px`,
                backgroundRepeat: "repeat",
                backgroundColor: config.backgroundColour,
            };

        case "striped":
            return {
                backgroundImage: `repeating-linear-gradient(
        ${config.primaryRotation}deg,
        rgba(${r},${g},${b},${config.opacity}) 0px,
        rgba(${r},${g},${b},${config.opacity}) ${config.scale}px,
        transparent ${config.scale}px,
        transparent ${config.spacing}px
    )`,
                backgroundRepeat: "repeat",
                backgroundColor: config.backgroundColour,
            };

        case "grid":
            return {
                backgroundImage: `
        repeating-linear-gradient(
            ${config.primaryRotation}deg,
            rgba(${r},${g},${b},${config.opacity}) 0px,
            rgba(${r},${g},${b},${config.opacity}) ${config.scale}px,
            transparent ${config.scale}px,
            transparent ${config.spacing}px
        ),
        repeating-linear-gradient(
            ${config.secondaryRotation}deg,
            rgba(${r},${g},${b},${config.opacity}) 0px,
            rgba(${r},${g},${b},${config.opacity}) ${config.scale}px,
            transparent ${config.scale}px,
            transparent ${config.spacing}px
        )
    `,
                backgroundRepeat: "repeat",
                backgroundColor: config.backgroundColour,
            }

        default:
            return {};
    }




}
/** Plain CSS declarations ready to paste inside a selector. */
export function getPatternCSSText(config: PatternConfig): string {
    return Object.entries(getPatternCSS(config))
        .map(([property, value]) => {
            const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
            return `${cssProperty}: ${String(value).replace(/\s+/g, " ").trim()};`
        })
        .join("\n")
}

/** Self-contained for serialization into the opaque HTML preview. Order is topmost first. */
export function getLayerStackCSS(stack: import("../types/grid-config").LayerStack, patternCSS: typeof getPatternCSS = getPatternCSS) {
    const images: string[] = [], sizes: string[] = []
    for (const layer of stack.layers) {
        const style = patternCSS(layer.config)
        if (style.backgroundImage) {
            images.push(style.backgroundImage.replace(/\s+/g, " ").trim())
            // A grid contributes two CSS backgrounds, each with its own size entry.
            if (layer.config.pattern === "grid") sizes.push("auto", "auto")
            else sizes.push(style.backgroundSize || "auto")
        }
        if (layer.backgroundEnabled) {
            images.push(`linear-gradient(${layer.config.backgroundColour}, ${layer.config.backgroundColour})`)
            sizes.push("auto")
        }
    }
    return { backgroundImage: images.join(", ") || "none", backgroundSize: sizes.join(", ") || "auto", backgroundRepeat: "repeat", backgroundPosition: "0 0", backgroundColor: "transparent" }
}
export function getLayerStackCSSText(stack: import("../types/grid-config").LayerStack) {
    return Object.entries(getLayerStackCSS(stack)).map(([property, value]) => `${property.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`)}: ${value};`).join("\n")
}
