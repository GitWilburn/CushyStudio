import { type BoxNormalized, extractNormalizeBox } from '../box/BoxNormalized'

const frame_ghost: BoxNormalized = extractNormalizeBox({
    textShadow: 100,
    border: 10,
    base: 0,
})

const frame_subtle: BoxNormalized = extractNormalizeBox({
    textShadow: 100,
    border: 0.05,
    base: 0,
})

const frame_default: BoxNormalized = extractNormalizeBox({
    textShadow: 100,
    border: 0.25,
    base: 0.2,
})

const frame_primary: BoxNormalized = extractNormalizeBox({
    textShadow: 100,
    base: { contrast: 0.3, chroma: 0.2 },
    border: 0.1,
})

const frame_secondary: BoxNormalized = extractNormalizeBox({
    border: 0.3,
    base: { contrast: 0.3, chroma: 0.2, hueShift: 180 },
})

export const frames = {
    ghost: frame_ghost,
    subtle: frame_subtle,
    default: frame_default,
    primary: frame_primary,
    secondary: frame_secondary,
}

export type FrameAppearance = keyof typeof frames
