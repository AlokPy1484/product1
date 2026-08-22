import type { PatternConfig } from "../types/grid-config"


export function getPatternCSS(config: PatternConfig) {



    const hexToRgb = (hex) => {
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
        scale,
        spacing,
        primaryColour,
        backgroundColour,
        opacity
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