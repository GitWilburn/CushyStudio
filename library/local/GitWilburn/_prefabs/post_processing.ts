import type { OutputFor } from '../../../built-in/_prefabs/_prefabs'

import { Mask } from '@react-three/drei'

export const ui_autoBrightness = () => {
    const form = getCurrentForm()
    return form.fields(
        {
            strength: form.int({ default: 75, min: 0, max: 100, step: 5 }),
            saturation: form.int({ default: 10, min: -255, max: 255, step: 5 }),
        },
        {
            startCollapsed: true,
            requirements: [{ type: 'customNodesByTitle', title: 'ComfyUI Layer Style' }],
            summary: (ui) => {
                return `strength:${ui.strength} saturation:${ui.saturation}`
            },
        },
    )
}

export const run_autoBrightness = (p: { image: _IMAGE; mask?: _MASK; ui: OutputFor<typeof ui_autoBrightness> }): _IMAGE => {
    const graph = getCurrentRun().nodes
    const autoBright = graph.LayerColor$4_AutoBrightness({
        image: p.image,
        mask: p.mask,
        strength: p.ui.strength,
        saturation: p.ui.saturation,
    })
    return autoBright._IMAGE
}
