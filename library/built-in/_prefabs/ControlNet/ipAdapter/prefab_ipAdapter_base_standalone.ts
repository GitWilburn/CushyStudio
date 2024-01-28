import type { OutputFor } from '../../_prefabs'
import type { Cnet_args } from '../../prefab_cnet'

import { ipAdapterDoc } from './_ipAdapterDoc'
import { ipAdapterModelList } from './_ipAdapterModelList'
import { ui_ipadapter_CLIPSelection, ui_subform_IPAdapter_common } from './_ipAdapterUtils'
import { ui_ipadapter_modelSelection } from './ui_ipadapter_modelSelection'

// 🅿️ IPAdapter Basic ===================================================
export const ui_ipadapter_standalone = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'IPAdapter',
        customNodesByTitle: ['ComfyUI_IPAdapter_plus'],
        items: () => ({
            help: form.markdown({ startCollapsed: true, markdown: ipAdapterDoc }),
            image: form.image({ label: 'Image' }),
            ...ui_ipadapter_CLIPSelection(form),
            ...ui_ipadapter_modelSelection(form, 'ip-adapter-plus_sd15.safetensors', ipAdapterModelList),
            ...ui_subform_IPAdapter_common(form),
        }),
    })
}

// 🅿️ IPAdapter RUN ===================================================
export const run_ipadapter_standalone = async (
    ui: OutputFor<typeof ui_ipadapter_standalone>,
    cnet_args: Cnet_args,
): Promise<{ ip_adapted_model: _MODEL }> => {
    const run = getCurrentRun()
    const graph = run.nodes

    let image: _IMAGE = await run.loadImageAnswer(ui.image)
    image = graph.PrepImageForClipVision({ image, interpolation: 'LANCZOS', crop_position: 'center', sharpening: 0 })

    const ip_model = graph.IPAdapterModelLoader({ ipadapter_file: ui.cnet_model_name })
    const ip_clip_name = graph.CLIPVisionLoader({ clip_name: ui.clip_name })
    const ip_adapted_model = graph.IPAdapterApply({
        ipadapter: ip_model,
        clip_vision: ip_clip_name,
        image: image,
        model: cnet_args.ckptPos,
        weight_type: 'original',
        weight: ui.strength,
        noise: ui.advanced?.noise ?? 0,
        start_at: ui.advanced?.startAtStepPercent ?? 0,
        end_at: ui.advanced?.endAtStepPercent ?? 1,
        unfold_batch: ui.advanced?.unfold_batch ?? false,
    })._MODEL

    return { ip_adapted_model }
}
