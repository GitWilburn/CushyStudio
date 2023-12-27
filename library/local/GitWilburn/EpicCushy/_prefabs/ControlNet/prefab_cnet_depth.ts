import type { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "../prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"

// 🅿️ Depth FORM ===================================================
export const ui_subform_Depth = (form: FormBuilder) => {
    return form.group({
        label: 'Depth',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor: ui_subform_Depth_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11f1p_sd15_depth.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_Depth_Preprocessor = (form: FormBuilder) => {
    return form.groupOpt({
        label: 'Depth Preprocessor',
        items: () => ({
            type: form.choice({
                label: 'Type',
                items: () => ({
                    MiDaS: ui_subform_Depth_Midas(form),
                    LeReS: ui_subform_Depth_LeReS(form),
                    Zoe: ui_subform_Depth_Zoe(form)
                })
            })
            // TODO: Add support for auto-modifying the resolution based on other form selections
            // TODO: Add support for auto-cropping   
        }),
    })
}

export const ui_subform_Depth_Midas = (form: FormBuilder) => {
    return form.group({
        label: 'MiDaS Depth',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            a_value: form.float({ default: 6.28 }),
            bg_threshold: form.float({ default: 0.1 }),
        })
    })
}

export const ui_subform_Depth_LeReS = (form: FormBuilder) => {
    return form.group({
        label: 'LeReS Depth',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            rm_nearest: form.float({ default: 0.0 }),
            rm_background: form.float({ default: 0.0 }),
            boost: form.bool({ default: false })
        })
    })
}

export const ui_subform_Depth_Zoe = (form: FormBuilder) => {
    return form.group({
        label: 'Zoe Depth',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
        })
    })
}

export const run_cnet_Depth = async (flow: Runtime, Depth: OutputFor<typeof ui_subform_Depth>, cnet_args: Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = Depth.cnet_model_name
    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image: (await flow.loadImageAnswer(Depth.image))._IMAGE,
        width: cnet_args.width ?? 512,
        height: cnet_args.height ?? 512,
        upscale_method: Depth.upscale_method,
        crop: Depth.crop,
    })._IMAGE

    // PREPROCESSOR - Depth ===========================================================
    if (Depth.preprocessor) {
        if (Depth.preprocessor.type.LeReS) {
            const leres = Depth.preprocessor.type.LeReS
            image = graph.LeReS$7DepthMapPreprocessor({
                image: image,
                resolution: leres.resolution,
                rm_nearest: leres.rm_nearest,
                rm_background: leres.rm_background,
                boost: leres.boost ? 'enable' : 'disable'
            })._IMAGE
            if (leres.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Depth\\leres' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Depth.preprocessor.type.MiDaS) {
            const midas = Depth.preprocessor.type.MiDaS
            image = graph.MiDaS$7DepthMapPreprocessor({
                image: image,
                resolution: midas.resolution,
                a: midas.a_value,
                bg_threshold: midas.bg_threshold
            })._IMAGE
            if (midas.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Depth\\midas' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Depth.preprocessor.type.Zoe) {
            const zoe = Depth.preprocessor.type.Zoe
            image = graph.Zoe$7DepthMapPreprocessor({
                image: image,
                resolution: zoe.resolution,
            })._IMAGE
            if (zoe.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Depth\\zoe' })
            else
                graph.PreviewImage({ images: image })
        }
    }

    return { cnet_name, image }
}