import type { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "../prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"

// 🅿️ Scribble FORM ===================================================
export const ui_subform_Scribble = (form: FormBuilder) => {
    return form.group({
        label: 'Scribble',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor: ui_subform_Scribble_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11p_sd15_scribble.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_Scribble_Preprocessor = (form: FormBuilder) => {
    return form.groupOpt({
        label: 'Scribble Preprocessor',
        items: () => ({
            type: form.choice({
                label: 'Type',
                items: () => ({
                    ScribbleLines: ui_subform_Scribble_Lines(form),
                    FakeScribble: ui_subform_Fake_Scribble_Lines(form),
                    XDOG: ui_subform_Scribble_XDoG_Lines(form)
                })
            })
            // TODO: Add support for auto-modifying the resolution based on other form selections
            // TODO: Add support for auto-cropping   
        }),
    })
}

export const ui_subform_Scribble_Lines = (form: FormBuilder) => {
    return form.group({
        label: 'Scribble Lines',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
        })
    })
}

export const ui_subform_Fake_Scribble_Lines = (form: FormBuilder) => {
    return form.group({
        label: 'Fake Scribble Lines (aka scribble_hed)',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            safe: form.bool({ default: true })
        })
    })
}

export const ui_subform_Scribble_XDoG_Lines = (form: FormBuilder) => {
    return form.group({
        label: 'Scribble XDoG Lines ',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            threshold: form.int({ default: 32, min: 0, max: 64 })
        })
    })
}

export const run_cnet_Scribble = async (flow: Runtime, Scribble: OutputFor<typeof ui_subform_Scribble>, cnet_args: Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = Scribble.cnet_model_name
    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image: (await flow.loadImageAnswer(Scribble.image))._IMAGE,
        width: cnet_args.width ?? 512,
        height: cnet_args.height ?? 512,
        upscale_method: Scribble.upscale_method,
        crop: Scribble.crop,
    })._IMAGE

    // PREPROCESSOR - Scribble ===========================================================
    if (Scribble.preprocessor) {
        if (Scribble.preprocessor.type.ScribbleLines) {
            const scribble = Scribble.preprocessor.type.ScribbleLines
            image = graph.ScribblePreprocessor({
                image: image,
                resolution: scribble.resolution,
            })._IMAGE
            if (scribble.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Scribble\\scribble' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Scribble.preprocessor.type.FakeScribble) {
            const fake = Scribble.preprocessor.type.FakeScribble
            image = graph.FakeScribblePreprocessor({
                image: image,
                resolution: fake.resolution,
                safe: fake.safe ? 'enable' : 'disable'
            })._IMAGE
            if (fake.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Scribble\\fake' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Scribble.preprocessor.type.XDOG) {
            const xdog = Scribble.preprocessor.type.XDOG
            image = graph.Scribble$_XDoG$_Preprocessor({
                image: image,
                resolution: xdog.resolution,
                threshold: xdog.threshold
            })._IMAGE
            if (xdog.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Scribble\\xdog' })
            else
                graph.PreviewImage({ images: image })
        }
    }

    return { cnet_name, image }
}