import type { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "./prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"


// 🅿️ OPEN POSE FORM ===================================================
export const ui_subform_OpenPose = (form: FormBuilder) => {    
    return form.group({
        label:'Open Pose',

        items: () => ({
            ...cnet_ui_common(form),
            preprocessor:ui_subform_OpenPose_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11p_sd15_openpose.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_OpenPose_Preprocessor = (form: FormBuilder) => {    
    return form.groupOpt({
        label:'Open Pose Preprocessor',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            detect_body: form.bool({ default: true }),
            detect_face: form.bool({ default: true }),
            detect_hand: form.bool({ default: true }),            
            useDWPose:form.bool({default:true}),
            bbox_detector: form.enum({
                enumName: 'Enum_DWPreprocessor_bbox_detector',
                default: 'yolox_l.onnx',
                group: 'DW Pose',
                label: 'Model',
            }),
            pose_estimator: form.enum({
                enumName: 'Enum_DWPreprocessor_pose_estimator',
                default: 'dw-ll_ucoco_384.onnx',
                group: 'DW Pose',
                label: 'Model',
            }),
            // TODO: Add support for auto-modifying the resolution based on other form selections
            // TODO: Add support for auto-cropping   
        }),
    })
}

export const run_cnet_openPose = async(flow:Runtime,openPose:OutputFor<typeof ui_subform_OpenPose>,cnet_args:Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = openPose.cnet_model_name

    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image:(await flow.loadImageAnswer(openPose.image))._IMAGE,
        width:cnet_args.width?? 512,
        height:cnet_args.height?? 512,
        upscale_method:'lanczos',
        crop:'disabled',
    })._IMAGE

    if(openPose.preprocessor)
    {                        
        var opPP = openPose.preprocessor
        if(opPP.useDWPose)
        {                        
            image = graph.DWPreprocessor({
                image: image,
                detect_body: opPP.detect_body?'enable':'disable',
                detect_face: opPP.detect_face?'enable':'disable',
                detect_hand: opPP.detect_hand?'enable':'disable',
                resolution: opPP.resolution,
                bbox_detector: opPP.bbox_detector,
                pose_estimator: opPP.pose_estimator,
            })._IMAGE                            
        }
        else
        {
            image = graph.OpenposePreprocessor({
                image: image,
                detect_body: opPP.detect_body?'enable':'disable',
                detect_face: opPP.detect_face?'enable':'disable',
                detect_hand: opPP.detect_hand?'enable':'disable',
                resolution: opPP.resolution,
                })._IMAGE
        }
        if(opPP.saveProcessedImage)
            graph.SaveImage({ images: image,filename_prefix:'cnet\\pose\\' })
        else
            graph.PreviewImage({ images: image})
    }

    return { cnet_name,image}
}