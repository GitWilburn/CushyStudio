import type { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_ui_common } from "./prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"

// 🅿️ IPAdapter FORM ===================================================
export const ui_subform_IPAdapter = (form: FormBuilder) => {
    return form.group({
        label: 'IPAdapter',
        items: () => ({
            ...cnet_ui_common(form),
            clip_name: form.enum({
                enumName: 'Enum_CLIPVisionLoader_clip_name',
                default: 'model.safetensors',
                group: 'IPAdapter',
                label: 'Model',
            }),
            cnet_model_name: form.enum({
                enumName: 'Enum_IPAdapterModelLoader_ipadapter_file',
                default: 'ip-adapter_sd15.safetensors',
                group: 'IPAdapter',
                label: 'Model',
            }),
            interpolation: form.enum({
                enumName: 'Enum_PrepImageForClipVision_interpolation',
                default: 'LANCZOS',
                group: 'IPAdapter',
                label: 'Model',
            }),
            crop_position: form.enum({
                enumName: 'Enum_PrepImageForClipVision_crop_position',
                default: 'center',
                group: 'IPAdapter',
                label: 'Model',
            }),
            weight_type: form.enum({
                enumName: 'Enum_IPAdapterApply_weight_type',
                default: 'original',
                group: 'IPAdapter',
                label: 'Model',
            }),
            noise: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
            prep_sharpening: form.float({ default: 0, min: 0, max: 1, step: 0.01 }),
            unfold_batch: form.bool({ default: false })
        }),
    })
}

export const run_cnet_IPAdapter = async (flow: Runtime, IPAdapter: OutputFor<typeof ui_subform_IPAdapter>, cnet_args: Cnet_args) => {
    const graph = flow.nodes
    const ip = IPAdapter
    let image: IMAGE
    //crop the image to the right size
    //todo: make these editable
    image = graph.PrepImageForClipVision({
        image: (await flow.loadImageAnswer(ip.image))._IMAGE,
        interpolation: ip.interpolation,
        crop_position: ip.crop_position,
        sharpening: ip.prep_sharpening,
    })._IMAGE

    const ip_model = graph.IPAdapterModelLoader({ ipadapter_file: ip.cnet_model_name })
    const ip_clip_name = graph.CLIPVisionLoader({ clip_name: ip.clip_name })

    const ip_adapted_model = graph.IPAdapterApply({
        ipadapter: ip_model,
        clip_vision: ip_clip_name,
        image: image,
        model: cnet_args.ckptPos,
        weight: ip.strength,
        noise: ip.noise,
        weight_type: ip.weight_type,
        start_at: ip.startAtStepPercent,
        end_at: ip.endAtStepPercent,
        unfold_batch: ip.unfold_batch
    })._MODEL

    return { ip_adapted_model }
}