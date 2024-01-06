import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from '../prefab_cnet'
import { OutputFor } from '../_prefabs'
import type { FormBuilder } from 'src/controls/FormBuilder'

// 🅿️ OPEN POSE FORM ===================================================
export const ui_subform_OpenPose = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'Open Pose',
        customNodes: 'ComfyUI-Advanced-ControlNet',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor: ui_subform_OpenPose_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: {
                    value: 'control_v11p_sd15_openpose.pth',
                    knownModel: ['ControlNet-v1-1 (openpose; fp16)', 'SDXL-controlnet: OpenPose (v2)'],
                },
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_OpenPose_Preprocessor = (form: FormBuilder) => {
    return form.groupOpt({
        label: 'Open Pose Preprocessor',
        default: true,
        items: () => ({
            advanced: form.groupOpt({
                label: 'Advanced Preprocessor Settings',
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
            }),
        }),
    })
}

// 🅿️ OPEN POSE RUN ===================================================
export const run_cnet_openPose = async (openPose: OutputFor<typeof ui_subform_OpenPose>, cnet_args: Cnet_args, image: _IMAGE) => {
    const run = getCurrentRun()
    const graph = run.nodes
    const cnet_name = openPose.cnet_model_name

    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image,
        width: cnet_args.width ?? 512,
        height: cnet_args.height ?? 512,
        upscale_method: openPose.advanced?.upscale_method ?? 'lanczos',
        crop: openPose.advanced?.crop ?? 'center',
    })._IMAGE

    if (openPose.preprocessor) {
        var opPP = openPose.preprocessor
        if (!opPP.advanced?.useDWPose) {
            image = graph.OpenposePreprocessor({
                image: image,
                detect_body: !opPP.advanced || opPP.advanced.detect_body ? 'enable' : 'disable',
                detect_face: !opPP.advanced || opPP.advanced.detect_face ? 'enable' : 'disable',
                detect_hand: !opPP.advanced || opPP.advanced.detect_hand ? 'enable' : 'disable',
                resolution: opPP.advanced?.resolution ?? 512,
            })._IMAGE
        } else {
            image = graph.DWPreprocessor({
                image: image,
                detect_body: !opPP.advanced || opPP.advanced.detect_body ? 'enable' : 'disable',
                detect_face: !opPP.advanced || opPP.advanced.detect_face ? 'enable' : 'disable',
                detect_hand: !opPP.advanced || opPP.advanced.detect_hand ? 'enable' : 'disable',
                resolution: opPP.advanced.resolution,
                bbox_detector: opPP.advanced.bbox_detector,
                pose_estimator: opPP.advanced.pose_estimator,
            })._IMAGE
        }
        if (opPP.advanced?.saveProcessedImage) graph.SaveImage({ images: image, filename_prefix: 'cnet\\pose\\' })
        else graph.PreviewImage({ images: image })
    }

    return { cnet_name, image }
}
