import { Threshold } from 'konva/lib/filters/Threshold'
import { threadId } from 'worker_threads'

import { CustomNodeFile } from '../../../../src/manager/custom-node-list/custom-node-list-types'
import { type OutputFor, ui_sampler } from './_prefabs'

export const ui_refiners = () => {
    const form = getCurrentForm()
    return form.group({
        items: {
            refinerType: form.choices({
                appearance: 'tab',
                requirements: [
                    //
                    { type: 'customNodesByTitle', title: 'ComfyUI Impact Pack' },
                ],
                items: {
                    faces: form.group({
                        items: () => ({
                            prompt: form.string({}),
                            detector: form.enum.Enum_UltralyticsDetectorProvider_model_name({
                                default: 'bbox/face_yolov8m.pt',
                                requirements: [
                                    { type: 'customNodesByTitle', title: 'ComfyUI Impact Pack' },
                                    { type: 'modelInManager', modelName: 'face_yolov8m (bbox)', optional: true },
                                    { type: 'modelInManager', modelName: 'face_yolov8n (bbox)', optional: true },
                                    { type: 'modelInManager', modelName: 'face_yolov8s (bbox)', optional: true },
                                    { type: 'modelInManager', modelName: 'face_yolov8n_v2 (bbox)', optional: true },
                                ],
                            }),
                        }),
                    }),
                    hands: form.group({
                        items: () => ({
                            prompt: form.string({}),
                            detector: form.enum.Enum_UltralyticsDetectorProvider_model_name({
                                default: 'bbox/hand_yolov8s.pt',
                                requirements: [
                                    { type: 'customNodesByTitle', title: 'ComfyUI Impact Pack' },
                                    { type: 'modelInManager', modelName: 'hand_yolov8n (bbox)' },
                                    { type: 'modelInManager', modelName: 'hand_yolov8s (bbox)' },
                                ],
                            }),
                        }),
                    }),
                    eyes: form.fields(
                        {
                            prompt: form.string({
                                default: 'eyes, hightly detailed, sharp details',
                            }),
                        },
                        {
                            requirements: [
                                { type: 'customNodesByTitle', title: 'ComfyUI Impact Pack' },
                                { type: 'customNodesByTitle', title: 'CLIPSeg' },
                            ],
                        },
                    ),
                },
            }),
            settings: form.group({
                startCollapsed: true,
                items: {
                    sampler: ui_sampler({ denoise: 0.5, steps: 5, cfg: 1.5, sampler_name: 'dpmpp_sde' }),
                },
            }),
        },
    })
}

export const run_refiners_fromLatent = (
    //
    ui: OutputFor<typeof ui_refiners>,
    latent: _LATENT = getCurrentRun().AUTO,
): _IMAGE => {
    const run = getCurrentRun()
    const graph = run.nodes
    const image: _IMAGE = graph.VAEDecode({ samples: latent, vae: run.AUTO })
    return run_refiners_fromImage(ui, image)
}

export const run_refiners_fromImage = (
    //
    ui: OutputFor<typeof ui_refiners>,
    finalImage: _IMAGE = getCurrentRun().AUTO,
): _IMAGE => {
    const run = getCurrentRun()
    const graph = run.nodes
    // run.add_saveImage(run.AUTO, 'base')
    let image = graph.ImpactImageBatchToImageList({ image: finalImage })._IMAGE

    const { faces, hands, eyes } = ui.refinerType
    if (faces || hands || eyes) {
        run.add_previewImage(finalImage)
    }
    if (faces) {
        const facePrompt = faces.prompt || 'perfect face, beautiful, masterpiece, hightly detailed, sharp details'
        const provider = graph.UltralyticsDetectorProvider({ model_name: faces.detector })
        const x = graph.FaceDetailer({
            image: graph.ImpactImageBatchToImageList({ image: image }),
            bbox_detector: provider._BBOX_DETECTOR,
            seed: ui.settings.sampler.seed,
            model: run.AUTO,
            clip: run.AUTO,
            vae: run.AUTO,
            denoise: ui.settings.sampler.denoise,
            steps: ui.settings.sampler.steps,
            sampler_name: ui.settings.sampler.sampler_name,
            scheduler: ui.settings.sampler.scheduler,
            cfg: ui.settings.sampler.cfg,
            positive: graph.CLIPTextEncode({ clip: run.AUTO, text: facePrompt }),
            negative: graph.CLIPTextEncode({ clip: run.AUTO, text: 'bad face, bad anatomy, bad details' }),
            sam_detection_hint: 'center-1', // ❓
            sam_mask_hint_use_negative: 'False',
            wildcard: '',
            // force_inpaint: false,
            // sampler_name: 'ddim',
            // scheduler: 'ddim_uniform',
        })
        // run.add_saveImage(x.outputs.image)

        image = x.outputs.image
    }
    if (hands) {
        const handsPrompt = hands.prompt || 'hand, perfect fingers, perfect anatomy, hightly detailed, sharp details'
        const provider = graph.UltralyticsDetectorProvider({ model_name: hands.detector })
        const x = graph.FaceDetailer({
            image,
            bbox_detector: provider._BBOX_DETECTOR,
            seed: ui.settings.sampler.seed,
            model: run.AUTO,
            clip: run.AUTO,
            vae: run.AUTO,
            denoise: ui.settings.sampler.denoise,
            steps: ui.settings.sampler.steps,
            sampler_name: ui.settings.sampler.sampler_name,
            scheduler: ui.settings.sampler.scheduler,
            cfg: ui.settings.sampler.cfg,
            positive: graph.CLIPTextEncode({ clip: run.AUTO, text: handsPrompt }),
            negative: graph.CLIPTextEncode({ clip: run.AUTO, text: 'bad hand, bad anatomy, bad details' }),
            sam_detection_hint: 'center-1', // ❓
            sam_mask_hint_use_negative: 'False',
            wildcard: '',
            // force_inpaint: false,
            // sampler_name: 'ddim',
            // scheduler: 'ddim_uniform',
        })
        // run.add_saveImage(x.outputs.image)
        image = x.outputs.image
    }
    //might work, but needs
    if (eyes) {
        const eyesPrompt = eyes.prompt || 'eyes, perfect eyes, perfect anatomy, hightly detailed, sharp details'
        const mask = graph.CLIPSeg({
            image: graph.ImpactImageBatchToImageList({ image: image }),
            text: 'eyes',
            blur: 5,
            threshold: 0.01,
            dilation_factor: 5,
        })
        //const preview = graph.PreviewImage({ images: mask.outputs.Heatmap$_Mask })

        const detailer = graph.DetailerForEachDebug({
            image,
            segs: graph.MaskToSEGS({
                mask: mask._MASK,
                combined: true,
                crop_factor: 3,
                bbox_fill: false,
                drop_size: 10,
                contour_fill: false,
            }),
            model: run.AUTO,
            clip: run.AUTO,
            vae: run.AUTO,
            denoise: ui.settings.sampler.denoise,
            steps: ui.settings.sampler.steps,
            sampler_name: ui.settings.sampler.sampler_name,
            scheduler: ui.settings.sampler.scheduler,
            cfg: ui.settings.sampler.cfg,
            guide_size: 128,
            positive: graph.CLIPTextEncode({ clip: run.AUTO, text: eyesPrompt }),
            negative: graph.CLIPTextEncode({ clip: run.AUTO, text: 'bad eyes, bad anatomy, bad details' }),
            wildcard: '',
        })
        image = detailer.outputs.image
    }

    // run.add_saveImage(x.outputs.cropped_refined)
    // run.add_saveImage(x.outputs.cropped_enhanced_alpha)
    // run.add_PreviewMask(x._MASK)
    // run.add_saveImage(x.outputs.cnet_images)

    return image
}
