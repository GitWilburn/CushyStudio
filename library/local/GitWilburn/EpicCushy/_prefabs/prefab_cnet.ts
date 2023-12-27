import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { OutputFor } from 'library/built-in/_prefabs/_prefabs'
import { run_cnet_openPose, ui_subform_OpenPose } from './ControlNet/prefab_cnet_openPose'
import { run_cnet_canny, ui_subform_Canny } from './ControlNet/prefab_cnet_canny'
import { run_cnet_Depth, ui_subform_Depth } from './ControlNet/prefab_cnet_depth'
import { run_cnet_Normal, ui_subform_Normal } from './ControlNet/prefab_cnet_normal'
import { ui_subform_Tile, run_cnet_Tile } from './ControlNet/prefab_cnet_tile'
import { run_cnet_IPAdapter, ui_subform_IPAdapter } from './ControlNet/prefab_cnet_ipAdapter'
import { run_cnet_Scribble, ui_subform_Scribble } from './ControlNet/prefab_cnet_scribble'
import { run_cnet_Lineart, ui_subform_Lineart } from './ControlNet/prefab_cnet_lineart'
import { run_cnet_SoftEdge, ui_subform_SoftEdge } from './ControlNet/prefab_cnet_softEdge'

// 🅿️ CNET UI -----------------------------------------------------------
export const ui_cnet = (form: FormBuilder) => {
    return form.groupOpt({
        label: 'ControlNet',
        items: () => ({
            useControlnetConditioningForUpscalePassIfEnabled: form.bool({ default: false }),
            controlNetList: form.list({
                //
                element: () =>
                    form.choice({
                        label: 'Pick=>',
                        items: () => ({
                            OpenPose: ui_subform_OpenPose(form),
                            Canny: ui_subform_Canny(form),
                            Depth: ui_subform_Depth(form),
                            Normal: ui_subform_Normal(form),
                            Tile: ui_subform_Tile(form),
                            IPAdapter: ui_subform_IPAdapter(form),
                            Scribble: ui_subform_Scribble(form),
                            Lineart: ui_subform_Lineart(form),
                            SoftEdge: ui_subform_SoftEdge(form)
                        }),
                    })

            }),
        })
    })
}

// 🅿️ CNET COMMON FORM ===================================================
export const cnet_ui_common = (form: FormBuilder) => ({
    image: form.image({ default: 'cushy', group: 'Cnet_Image', tooltip: 'There is currently a bug with multiple controlnets where an image wont allow drop except for the first controlnet in the list. If you add multiple controlnets, then reload using Ctrl+R, it should allow you to drop an image on any of the controlnets.' }),
    strength: form.float({ default: 1, min: 0, max: 2, step: 0.1 }),
    startAtStepPercent: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
    endAtStepPercent: form.float({ default: 1, min: 0, max: 1, step: 0.1 }),
    crop: form.enum({
        enumName: 'Enum_LatentUpscale_crop',
        default: 'disabled',
        group: 'ControlNet',
        label: 'Image Prep Crop mode',
    }),
    upscale_method: form.enum({
        enumName: 'Enum_ImageScale_upscale_method',
        default: 'lanczos',
        group: 'ControlNet',
        label: 'Scale method',
    }),
})

export const cnet_preprocessor_ui_common = (form: FormBuilder) => ({
    saveProcessedImage: form.bool({ default: false }),
    resolution: form.int({ default: 512, min: 512, max: 1024, step: 512 }),
})

// RUN -----------------------------------------------------------
export type Cnet_args = {
    positive: _CONDITIONING
    negative: _CONDITIONING
    width: INT
    height: INT
    ckptPos: _MODEL
}

export const run_cnet = async (
    //
    flow: Runtime,
    opts: OutputFor<typeof ui_cnet>,
    cnet_args: Cnet_args
) => {
    const graph = flow.nodes
    // var positive = cnet_args.positive
    // var negative = cnet_args.negative
    // CNET APPLY
    const cnetList = opts?.controlNetList
    let ckpt_return = cnet_args.ckptPos
    let cnet_positive = cnet_args.positive
    let cnet_negative = cnet_args.negative
    if (cnetList) {
        for (const cnet of cnetList) {
            let image: IMAGE
            let cnet_name: Enum_ControlNetLoader_control_net_name = 'control_v11p_sd15_canny.pth'

            if (cnet.IPAdapter) {
                // IPAdapter APPLY ===========================================================
                const ip_adapter_result = run_cnet_IPAdapter(flow, cnet.IPAdapter, cnet_args)
                ckpt_return = (await ip_adapter_result).ip_adapted_model
            }
            else {
                // CANNY ===========================================================
                if (cnet.Canny) {
                    const cnet_return_canny = await (run_cnet_canny(flow, cnet.Canny, cnet_args))
                    image = cnet_return_canny.image
                    cnet_name = cnet_return_canny.cnet_name
                }
                // POSE ===========================================================
                else if (cnet.OpenPose) {
                    const cnet_return_openPose = await (run_cnet_openPose(flow, cnet.OpenPose, cnet_args))
                    image = cnet_return_openPose.image
                    cnet_name = cnet_return_openPose.cnet_name
                }
                // DEPTH ===========================================================
                else if (cnet.Depth) {
                    const cnet_return_depth = await (run_cnet_Depth(flow, cnet.Depth, cnet_args))
                    image = cnet_return_depth.image
                    cnet_name = cnet_return_depth.cnet_name
                }
                // Normal ===========================================================
                else if (cnet.Normal) {
                    const cnet_return_normal = await (run_cnet_Normal(flow, cnet.Normal, cnet_args))
                    image = cnet_return_normal.image
                    cnet_name = cnet_return_normal.cnet_name
                }
                // Tile ===========================================================
                else if (cnet.Tile) {
                    const cnet_return_tile = await (run_cnet_Tile(flow, cnet.Tile, cnet_args))
                    image = cnet_return_tile.image
                    cnet_name = cnet_return_tile.cnet_name
                }
                // Scribble ===========================================================
                else if (cnet.Scribble) {
                    const cnet_return_scribble = await (run_cnet_Scribble(flow, cnet.Scribble, cnet_args))
                    image = cnet_return_scribble.image
                    cnet_name = cnet_return_scribble.cnet_name
                }
                // Lineart ===========================================================
                else if (cnet.Lineart) {
                    const cnet_return_lineart = await (run_cnet_Lineart(flow, cnet.Lineart, cnet_args))
                    image = cnet_return_lineart.image
                    cnet_name = cnet_return_lineart.cnet_name
                }
                // SoftEdge ===========================================================
                else if (cnet.SoftEdge) {
                    const cnet_return_softedge = await (run_cnet_SoftEdge(flow, cnet.SoftEdge, cnet_args))
                    image = cnet_return_softedge.image
                    cnet_name = cnet_return_softedge.cnet_name
                }

                // CONTROL NET APPLY ===========================================================
                const cnet_node = graph.ControlNetApplyAdvanced({
                    positive: cnet_positive,
                    negative: cnet_negative,
                    image: image,
                    control_net: graph.ControlNetLoader({
                        control_net_name: cnet_name,
                    }),
                })
                cnet_positive = cnet_node.outputs.positive
                cnet_negative = cnet_node.outputs.negative

            }
        }
    }

    return { cnet_positive, cnet_negative, ckpt_return }
}



