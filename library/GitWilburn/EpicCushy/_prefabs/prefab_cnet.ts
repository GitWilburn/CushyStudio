import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { OutputFor } from 'library/CushyStudio/default/_prefabs'
import type { ComfyWorkflowBuilder } from 'src/back/NodeBuilder';

// 🅿️ CNET UI -----------------------------------------------------------
export const ui_cnet = (form: FormBuilder) => {    
    return form.groupOpt({
        label:'ControlNet',
        items: () =>({
            useControlnetConditioningForUpscalePassIfEnabled:form.bool({default:false}),
            controlNetList: form.list({
                //
                element: () =>
                    form.choice({
                        label:'Pick=>',
                        items:() => ({
                            OpenPose:ui_subform_OpenPose(form),
                            Canny:ui_subform_Canny(form),                            
                        }),
                    })
                    
            }),
        })
    })
}

// 🅿️ CNET COMMON FORM ===================================================
export const cnet_ui_common = (form:FormBuilder)=> ({
    image:form.image({default:'cushy'}),
    strength:form.float({default:1,min:0,max:2,step:0.1}),
    startAtStepPercent:form.float({default:0,min:0,max:1,step:0.1}),
    endAtStepPercent:form.float({default:1,min:0,max:1,step:0.1}),
})

export const cnet_preprocessor_ui_common = (form:FormBuilder) => ({
    saveProcessedImage:form.bool({default:false}),
    resolution: form.int({ default: 512, min: 512, max: 1024, step: 512 }),
})

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

// RUN -----------------------------------------------------------
export type Cnet_args = {
    positive: _CONDITIONING
    negative: _CONDITIONING
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
    
    if (cnetList) {
        for(const cnet of cnetList){

            // IMAGE
            var image = (await flow.loadImageAnswer(cnet.image))._IMAGE

            // PREPROCESSOR ===========================================================
            if(cnet.preprocessor)
            {
                var name = cnet.cnet_model_name.toLowerCase()
                //crop the image to the right size
                //todo: make these editable
                image = graph.ImageScale({
                    image:image,
                    width:512,
                    height:768,
                    upscale_method:'lanczos',
                    crop:'disabled',
                })._IMAGE
                
                // PREPROCESSOR - CANNY ===========================================================
                if(name.includes('canny'))
                {
                    const pp = <OutputFor<typeof ui_subform_Canny_Preprocessor>>cnet.preprocessor
                    if(pp != null)
                    {
                        image = graph.CannyEdgePreprocessor({
                            image: image,
                            low_threshold: pp.lowThreshold,
                            high_threshold: pp.highThreshold,
                            resolution: pp.resolution,
                        })._IMAGE
                        if(pp.saveProcessedImage)
                            graph.SaveImage({ images: image,filename_prefix:'cnet\\canny\\' })
                        else
                            graph.PreviewImage({ images: image})
                    }
                }
                // PREPROCESSOR - POSE ===========================================================
                else if(name.includes('pose'))
                {
                    const pp = <OutputFor<typeof ui_subform_OpenPose_Preprocessor>>cnet.preprocessor
                    if(pp != null)
                    {                        
                        if(pp.useDWPose)
                        {
                            image = graph.DWPreprocessor({
                                image: image,
                                detect_body: pp.detect_body?'enable':'disable',
                                detect_face: pp.detect_face?'enable':'disable',
                                detect_hand: pp.detect_hand?'enable':'disable',
                                resolution: pp.resolution,
                                bbox_detector: pp.bbox_detector,
                                pose_estimator: pp.pose_estimator,
                            })._IMAGE                            
                        }
                        else
                        {
                            image = graph.OpenposePreprocessor({
                                image: image,
                                detect_body: pp.detect_body?'enable':'disable',
                                detect_face: pp.detect_face?'enable':'disable',
                                detect_hand: pp.detect_hand?'enable':'disable',
                                resolution: pp.resolution,
                                })._IMAGE
                        }
                        if(pp.saveProcessedImage)
                            graph.SaveImage({ images: image,filename_prefix:'cnet\\pose\\' })
                        else
                            graph.PreviewImage({ images: image})
                    }
                    
                }
            }             
            
            // CONTROL NET APPLY ===========================================================
            const cnet_node = graph.ControlNetApplyAdvanced({
                positive:positive,
                negative:negative,
                image:image,
                control_net:graph.ControlNetLoader({
                    control_net_name: cnet.cnet_model_name,
                }),
            })
            positive = cnet_node.outputs.positive
            negative = cnet_node.outputs.negative

        }
    }
   
    return { positive, negative }
}



