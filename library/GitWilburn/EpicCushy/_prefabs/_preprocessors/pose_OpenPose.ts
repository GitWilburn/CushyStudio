import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import { OutputFor } from 'library/CushyStudio/default/_prefabs'
import { ImageAnswer } from 'src/controls/misc/InfoAnswer'
import { ComfyWorkflowBuilder } from 'src/back/NodeBuilder';
import { exposePreprocessor } from '../prefab_cnet';
import { Image } from '../../../../../src/widgets/misc/Image';

export const ui_OpenPose = (form: FormBuilder) => {
    return form.group({
        items: () => ({
            image:form.image({}),
            strength:form.float({default:1,min:0,max:2,step:0.1}),
            preprocessor:form.groupOpt({
                items: () => ({
                    selected_preprocessor:form.choice({
                        label:'=>',
                        items:() =>({
                            dwpose:preprocessor_DWPose.ui(form),
                            openPose:preprocessor_OpenPose.ui(form),                            
                        })
                    })
                })
            }),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11p_sd15_openpose.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
            //todo:add support for auto-modifying the resolution based on other form selections
            //todo:add support for auto-cropping            
        })
    })
}

// RUN -----------------------------------------------------------
export const run_OpenPose = async (p:{
    //
    flow: Runtime,
    opts: OutputFor<typeof ui_OpenPose>,
    original_image: ImageAnswer
}) => {
    const graph = p.flow.nodes
   
    
    return p.flow.loadImageAnswer(p.opts.image)
}

export const preprocessor_OpenPose = exposePreprocessor({
    ui: (form: FormBuilder) => ( // Note the parentheses around the object
        
        form.group({
            items: () => ({
                detect_body: form.bool({ default: true }),
                detect_face: form.bool({ default: true }),
                detect_hand: form.bool({ default: true }),
                resolution: form.int({ default: 512, min: 512, max: 1024, step: 512 }),
                // TODO: Add support for auto-modifying the resolution based on other form selections
                // TODO: Add support for auto-cropping            
            })
        })
    ),
    run: ({runtime, graph}, form, {image}) => {
        const resultImage = graph.OpenposePreprocessor({
            image: image,
            
        })._IMAGE;
        return {image: resultImage};
    }
});

export const preprocessor_DWPose = exposePreprocessor({
    ui: (form: FormBuilder) => ( // Note the parentheses around the object
        form.group({
            items: () => ({
                detect_body: form.bool({ default: true,group: 'DW Pose', }),
                detect_face: form.bool({ default: true,group: 'DW Pose', }),
                detect_hand: form.bool({ default: true,group: 'DW Pose', }),
                resolution: form.int({ default: 512, min: 512, max: 1024, step: 512,group: 'DW Pose', }),
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
            })
        })
    ),
    run: ({runtime, graph}, form, {image}) => {
        const resultImage = graph.DWPreprocessor({
            image: image,
            detect_body:'enable',
            detect_face:'enable',
            detect_hand: 'enable',
            resolution: 512,
            bbox_detector: 'yolox_l.onnx',
            pose_estimator: 'dw-ll_ucoco_384.onnx',
        })._IMAGE;
        return {image: resultImage};
    }
});


