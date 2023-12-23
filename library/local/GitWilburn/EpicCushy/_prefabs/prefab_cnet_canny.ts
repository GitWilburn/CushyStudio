import { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "./prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"

// 🅿️ Canny FORM ===================================================
export const ui_subform_Canny = (form: FormBuilder) => {    
    return form.group({
        label:'Canny',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor:ui_subform_Canny_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11p_sd15_canny.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_Canny_Preprocessor = (form: FormBuilder) => {    
    return form.groupOpt({
        label:'Canny Edge Preprocessor',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            lowThreshold: form.int({ default: 100, min: 0, max: 200, step: 10 }),
            highThreshold: form.int({ default: 200, min: 0, max: 400, step: 10 }),
            // TODO: Add support for auto-modifying the resolution based on other form selections
            // TODO: Add support for auto-cropping   
        }),
    })
}

export const run_cnet_canny = async(flow:Runtime,canny:OutputFor<typeof ui_subform_Canny>,cnet_args:Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = canny.cnet_model_name
    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image:(await flow.loadImageAnswer(canny.image))._IMAGE,
        width:cnet_args.width?? 512,
        height:cnet_args.height ?? 512,
        upscale_method:'lanczos',
        crop:'disabled',
    })._IMAGE
    
    // PREPROCESSOR - CANNY ===========================================================
    if(canny.preprocessor)
    {
        var canPP= canny.preprocessor
        image = graph.CannyEdgePreprocessor({
            image: image,
            low_threshold: canPP.lowThreshold,
            high_threshold: canPP.highThreshold,
            resolution: canPP.resolution,
        })._IMAGE
        if(canPP.saveProcessedImage)
            graph.SaveImage({ images: image,filename_prefix:'cnet\\canny\\' })
        else
            graph.PreviewImage({ images: image})
    }

    return { cnet_name,image}
}