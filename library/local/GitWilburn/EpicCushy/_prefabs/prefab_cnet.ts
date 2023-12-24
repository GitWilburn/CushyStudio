import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { OutputFor } from 'library/built-in/_prefabs/_prefabs'
import { run_cnet_openPose, ui_subform_OpenPose } from './prefab_cnet_openPose'
import { run_cnet_canny, ui_subform_Canny } from './prefab_cnet_canny'
import { run_cnet_Depth, ui_subform_Depth } from './prefab_cnet_depth'
import { run_cnet_Normal, ui_subform_Normal } from './prefab_cnet_normal'
import { ui_subform_Tile, run_cnet_Tile } from './prefab_cnet_tile'
import { run_cnet_IPAdapter, ui_subform_IPAdapter } from './prefab_cnet_ipAdapter'

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
                            IPAdapter: ui_subform_IPAdapter(form)
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
    var positive = cnet_args.positive
    var negative = cnet_args.negative
    // CNET APPLY
    const cnetList = opts?.controlNetList
    let ckpt_return = cnet_args.ckptPos
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

                // CONTROL NET APPLY ===========================================================
                const cnet_node = graph.ControlNetApplyAdvanced({
                    positive: positive,
                    negative: negative,
                    image: image,
                    control_net: graph.ControlNetLoader({
                        control_net_name: cnet_name,
                    }),
                })
                positive = cnet_node.outputs.positive
                negative = cnet_node.outputs.negative
            }
        }
    }

    return { positive, negative, ckpt_return }
}



