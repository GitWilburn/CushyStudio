import { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "./prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"

// 🅿️ Normal FORM ===================================================
export const ui_subform_Normal = (form: FormBuilder) => {    
    return form.group({
        label:'Normal',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor:ui_subform_Normal_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11p_sd15_normalbae.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_Normal_Preprocessor = (form: FormBuilder) => {    
    return form.groupOpt({
        label:'Normal Preprocessor',
        items: () => ({            
            type:form.choice({
                label:'Type',
                items:() => ({
                    MiDaS:ui_subform_Normal_Midas(form),
                    bae:ui_subform_Normal_bae(form)
                })
            })
            // TODO: Add support for auto-modifying the resolution based on other form selections
            // TODO: Add support for auto-cropping   
        }),
    })
}

export const ui_subform_Normal_Midas = (form:FormBuilder) => {
    return form.group({
        label:'MiDaS Normal',
        items: ()=> ({
            ...cnet_preprocessor_ui_common(form),
            a_value:form.float({default:6.28}),
            bg_threshold:form.float({default:0.1}),
        })
    })
}

export const ui_subform_Normal_bae = (form:FormBuilder) => {
    return form.group({
        label:'BAE Normal',
        items: ()=> ({
            ...cnet_preprocessor_ui_common(form),
        })
    })
}

export const run_cnet_Normal = async(flow:Runtime,Normal:OutputFor<typeof ui_subform_Normal>,cnet_args:Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = Normal.cnet_model_name
    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image:(await flow.loadImageAnswer(Normal.image))._IMAGE,
        width:cnet_args.width?? 512,
        height:cnet_args.height ?? 512,
        upscale_method:'lanczos',
        crop:'disabled',
    })._IMAGE
    
    // PREPROCESSOR - Normal ===========================================================
    if(Normal.preprocessor)
    {
        if(Normal.preprocessor.type.MiDaS)
        {
            const midas = Normal.preprocessor.type.MiDaS
            image = graph.MiDaS$7NormalMapPreprocessor({
                image: image,                
                resolution: midas.resolution,
                a:midas.a_value,
                bg_threshold: midas.bg_threshold
            })._IMAGE
            if(midas.saveProcessedImage)
                graph.SaveImage({ images: image,filename_prefix:'cnet\\Normal\\midas' })
            else
                graph.PreviewImage({ images: image})
        }
        else if(Normal.preprocessor.type.bae)
        {
            const bae = Normal.preprocessor.type.bae
            image = graph.BAE$7NormalMapPreprocessor({
                image: image,                
                resolution: bae.resolution,
            })._IMAGE
            if(bae.saveProcessedImage)
                graph.SaveImage({ images: image,filename_prefix:'cnet\\Normal\\bae' })
            else
                graph.PreviewImage({ images: image})
        }
    }

    return { cnet_name,image}
}