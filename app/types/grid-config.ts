



export interface GridConfig {

    //Geometry
    scale: number;
    spacing: number

    //Colour
    primaryColour: string,
    backgroundColour: string,
    opacity: number
}


export const DEFAULT_GRID_CONFIG: GridConfig = {

    scale: 0.5,
    spacing: 10,
    primaryColour: '#ffffff',
    backgroundColour: '#000000',
    opacity: 0.2
}