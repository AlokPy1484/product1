
type PatternType = "dots" | "grid" | "striped"

export interface PatternConfig {

    //Pattern
    pattern: PatternType

    //Geometry
    scale: number
    spacing: number

    //Colour
    primaryColour: string,
    backgroundColour: string,
    opacity: number

    //Rotation
    primaryRotation: number,
    secondaryRotation: number
}


export const DEFAULT_PATTERN_CONFIG: PatternConfig = {

    pattern: "dots",
    scale: 0.5,
    spacing: 10,
    opacity: 0.2,
    primaryRotation: 135,
    secondaryRotation: 45,
    primaryColour: '#ffffff',
    backgroundColour: '#000000'
}