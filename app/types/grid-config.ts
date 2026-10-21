
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
    scale: 1,
    spacing: 10,
    opacity: 0.2,
    primaryRotation: 135,
    secondaryRotation: 45,
    primaryColour: '#000000',
    backgroundColour: '#ffffff'
}
/** Ordered topmost first. Collapsing controls never hides a rendered layer. */
export interface PatternLayer {
    id: string
    name: string
    config: PatternConfig
    backgroundEnabled: boolean
}
export interface LayerStack {
    layers: PatternLayer[]
    expandedLayerId: string | null
    nextLayerNumber: number
}
