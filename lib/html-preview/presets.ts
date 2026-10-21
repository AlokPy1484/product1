import type { PatternConfig } from "@/app/types/grid-config"

export const COMPONENT_PRESETS: { label: string; config: PatternConfig }[] = [
    {
        label: "Dot Preset 1",
        config: {
            backgroundColour: "#f8fadb",
            opacity: 1,
            pattern: "dots",
            primaryColour: "#b1dd8c",
            primaryRotation: 135,
            scale: 1.2,
            secondaryRotation: 45,
            spacing: 10,
        },
    },
    {
        label: "Striped Preset 1",
        config: {
            backgroundColour: "#000000",
            opacity: 0.2,
            pattern: "striped",
            primaryColour: "#ffffff",
            primaryRotation: 131,
            scale: 0.1,
            secondaryRotation: 45,
            spacing: 10,
        },
    },
    {
        label: "Striped Preset 2",
        config: {
            backgroundColour: "#121212",
            opacity: 0.5,
            pattern: "striped",
            primaryColour: "#000000",
            primaryRotation: 131,
            scale: 1.2,
            secondaryRotation: 45,
            spacing: 18,
        },
    },
    {
        label: "Grid Preset 1",
        config: {
            backgroundColour: "#121212",
            opacity: 0.1,
            pattern: "grid",
            primaryColour: "#ffffff",
            primaryRotation: 131,
            scale: 0.1,
            secondaryRotation: 41,
            spacing: 78,
        },
    },
    {
        label: "Grid Preset 2",
        config: {
            backgroundColour: "#ebebeb",
            opacity: 0.1,
            pattern: "grid",
            primaryColour: "#232323",
            primaryRotation: 131,
            scale: 0.8,
            secondaryRotation: 41,
            spacing: 10,
        },
    },
];
