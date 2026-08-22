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
                backgroundImage: `radial-gradient(circle at 0.5px  0.5px, rgba(${r},${g},${b}, ${config.opacity}) ${config.scale}px, transparent 0)`,
                backgroundSize: `${config.spacing}px ${config.spacing}px`,
                backgroundRepeat: "repeat",
                opacity: `1`,
                backgroundColor: config.backgroundColour

            };

        case "grid":
            return {
                backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 5px)"
            };

        case "striped":
            return {
                backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.05) 0.01px, transparent 0.5px, transparent 50px), repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.05) 0.01px, transparent 0.5px, transparent 50px)"
            };

        default:
            return {};
    }




}