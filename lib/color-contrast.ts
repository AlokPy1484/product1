/** Relative luminance in sRGB, used to compare black and white text. */
export function getRelativeLuminance(hex: string): number {
    const raw = hex.replace(/^#/, "")
    const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw
    const value = parseInt(full, 16)
    const [r, g, b] = [16, 8, 0].map((shift) => {
        const channel = ((value >> shift) & 255) / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getLabelContrast(background: string) {
    const luminance = getRelativeLuminance(background)
    const blackContrast = (luminance + 0.05) / 0.05
    const whiteContrast = 1.05 / (luminance + 0.05)
    return blackContrast >= whiteContrast
        ? { color: "#000000", outline: "#ffffff", ratio: blackContrast }
        : { color: "#ffffff", outline: "#000000", ratio: whiteContrast }
}
