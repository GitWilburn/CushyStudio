import type { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "../prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"
import { ImageAnswer } from "src/controls/misc/InfoAnswer"
import { resolve } from 'pathe';


// 🅿️ OPEN POSE FORM ===================================================
export const ui_subform_OpenPose = (form: FormBuilder) => {
    return form.group({
        label: 'Open Pose',

        items: () => ({
            ...cnet_ui_common(form),
            preprocessor: ui_subform_OpenPose_Preprocessor(form),
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
        label: 'Open Pose Preprocessor',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            detect_body: form.bool({ default: true }),
            detect_face: form.bool({ default: true }),
            detect_hand: form.bool({ default: true }),
            useDWPose: form.bool({ default: true }),
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

export const run_cnet_openPose = async (flow: Runtime, openPose: OutputFor<typeof ui_subform_OpenPose>, cnet_args: Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = openPose.cnet_model_name

    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image: (await flow.loadImageAnswer(openPose.image))._IMAGE,
        width: cnet_args.width ?? 512,
        height: cnet_args.height ?? 512,
        upscale_method: openPose.upscale_method,
        crop: openPose.crop,
    })._IMAGE

    if (openPose.preprocessor) {
        var opPP = openPose.preprocessor
        if (opPP.useDWPose) {
            image = graph.DWPreprocessor({
                image: image,
                detect_body: opPP.detect_body ? 'enable' : 'disable',
                detect_face: opPP.detect_face ? 'enable' : 'disable',
                detect_hand: opPP.detect_hand ? 'enable' : 'disable',
                resolution: opPP.resolution,
                bbox_detector: opPP.bbox_detector,
                pose_estimator: opPP.pose_estimator,
            })._IMAGE
        }
        else {
            image = graph.OpenposePreprocessor({
                image: image,
                detect_body: opPP.detect_body ? 'enable' : 'disable',
                detect_face: opPP.detect_face ? 'enable' : 'disable',
                detect_hand: opPP.detect_hand ? 'enable' : 'disable',
                resolution: opPP.resolution,
            })._IMAGE
        }
        if (opPP.saveProcessedImage)
            graph.SaveImage({ images: image, filename_prefix: 'cnet\\pose\\' })
        else
            graph.PreviewImage({ images: image })
    }

    return { cnet_name, image }
}

export type Cnet_OpenPose_Face_args = {
    positive: _CONDITIONING
    negative: _CONDITIONING
    image: _IMAGE
    control_net: Enum_ControlNetLoader_control_net_name
    ckptPos: _MODEL
    resolution: number
}

//used by the face detailer to determine face orientation to control face detailer model
export const run_cnet_openPose_face_simple = (flow: Runtime, cnet_openPose_args: Cnet_OpenPose_Face_args) => {
    const graph = flow.nodes

    //crop the image to the right size
    //todo: make these editable
    const image = graph.OpenposePreprocessor({
        image: cnet_openPose_args.image,
        detect_body: 'disable',
        detect_face: 'enable',
        detect_hand: 'disable',
        resolution: cnet_openPose_args.resolution ?? 512,
    })._IMAGE

    const cnet_node = graph.ControlNetApplyAdvanced({
        positive: cnet_openPose_args.positive,
        negative: cnet_openPose_args.negative,
        image: image,
        control_net: graph.ControlNetLoader({
            control_net_name: cnet_openPose_args.control_net,
        }),
    })
    const positive = cnet_node.outputs.positive
    const negative = cnet_node.outputs.negative
    return { positive, negative }

}