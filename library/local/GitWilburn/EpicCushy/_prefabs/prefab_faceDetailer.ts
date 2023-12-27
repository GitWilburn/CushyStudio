import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { OutputFor } from 'library/built-in/_prefabs/_prefabs'
import { Ctx_sampler, ui_sampler } from 'library/built-in/_prefabs/prefab_sampler';
import { run_prompt } from 'library/built-in/_prefabs/prefab_prompt';
import { run_cnet_IPAdapter, ui_subform_IPAdapter } from './ControlNet/prefab_cnet_ipAdapter';
import { run_cnet_openPose, run_cnet_openPose_face_simple, ui_subform_OpenPose } from './ControlNet/prefab_cnet_openPose';

// 🅿️ DZ FaceDetailer UI -----------------------------------------------------------
export const ui_dz_face_detailer = (form: FormBuilder) => {
    return form.groupOpt({
        label: 'DZ Face Detailer',
        items: () => ({
            seed: form.seed({}),
            sampler: form.groupOpt({
                label: 'Advanced Sampler Settings',
                items: () => ({
                    face_sampler: ui_sampler(form),
                    positive: form.prompt({ startCollapsed: true }),
                    negative: form.prompt({ startCollapsed: true }),
                }),
            }),
            mask_blur: form.int({ default: 0, min: 0 }),
            mask_type: form.enum({
                enumName: 'Enum_DZ$_Face$_Detailer_mask_type',
                default: 'face',
            }),
            mask_control: form.enum({
                enumName: 'Enum_DZ$_Face$_Detailer_mask_control',
                default: 'dilate',
            }),
            dilate_mask_value: form.int({ min: 0, default: 3 }),
            erode_mask_value: form.int({ min: 0, default: 3 }),
            ip_apapter: form.groupOpt({
                label: 'Add IPAdapter for face model',
                items: () => ({
                    ip_adapter_ui: ui_subform_IPAdapter(form)
                })
            }),
            cnet_pose: form.bool({
                label: 'Add Face pose for face model',
                tooltip: 'This function currently doesnt have advanced option selections. It will only run OpenPose, only runs on SD 1.5 image models and the model is hard-pathed to run for a model named control_v11p_sd15_openpose',
            })

        }),

    })
}

// 🅿️ DZ FaceDetailer Run -----------------------------------------------------------
export type dz_faceDetailer_args = {
    ckpt: _MODEL
    clip: _CLIP
    latent: HasSingle_LATENT
    positive: _CONDITIONING
    negative: _CONDITIONING
    preview?: boolean
    vae: _VAE
    base_sampler_opts: OutputFor<typeof ui_sampler>,
}

export const run_dz_face_detailer = async (
    run: Runtime,
    opts: OutputFor<typeof ui_dz_face_detailer>,
    args: dz_faceDetailer_args) => {
    const graph = run.nodes
    let return_latent: HasSingle_LATENT = args.latent
    let return_mask: _MASK | undefined

    if (!opts)
        return { return_latent, return_mask } //if the detailer isn't selected, just return the latent as is

    let positive: _CONDITIONING = args.positive
    let negative: _CONDITIONING = args.negative
    let ckptPos: _MODEL = args.ckpt

    const clip = args.clip
    //if there is text, then use it instead of the base prompt
    if (opts.sampler && opts.sampler.positive.tokens.length > 0) {
        // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
        const x = run_prompt(run, { richPrompt: opts.sampler.positive, clip, ckpt: ckptPos, outputWildcardsPicked: true })
        ckptPos = x.ckpt
        positive = x.conditionning
    }
    else {
        positive = typeof args.positive === 'string' //
            ? graph.CLIPTextEncode({ clip: args.clip, text: args.positive })
            : args.positive
    }

    //negative text
    if (opts.sampler && opts.sampler.negative.tokens.length > 0) {
        // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
        const y = run_prompt(run, { richPrompt: opts.sampler.negative, clip, ckpt: ckptPos, outputWildcardsPicked: true })
        negative = y.conditionning
    }
    else {
        negative = typeof args.negative === 'string' //
            ? graph.CLIPTextEncode({ clip: args.clip, text: args.negative })
            : args.negative
    }

    //ip adapter for face detailer
    if (opts.ip_apapter) {
        var ip_adapted = await (run_cnet_IPAdapter(run, opts.ip_apapter.ip_adapter_ui,
            {
                positive: positive,
                negative: negative,
                width: 512,
                height: 512,
                ckptPos: ckptPos,
            }))
        ckptPos = ip_adapted.ip_adapted_model
    }

    //openpose controlnet to retain face orientation
    if (opts.cnet_pose) {
        const openPose_return = run_cnet_openPose_face_simple(run, {
            positive: positive,
            negative: negative,
            image: graph.VAEDecode({ samples: args.latent, vae: args.vae }),
            control_net: 'control_v11p_sd15_openpose.pth',
            ckptPos: ckptPos,
            resolution: 512
        })

        positive = openPose_return.positive
        negative = openPose_return.negative
    }

    const return_node = graph.DZ$_Face$_Detailer({
        model: ckptPos,
        positive: positive,
        negative: negative,
        latent_image: args.latent,
        vae: args.vae,
        seed: opts.seed,
        steps: opts.sampler ? opts.sampler.face_sampler.steps : args.base_sampler_opts.steps,
        cfg: opts.sampler ? opts.sampler.face_sampler.cfg : args.base_sampler_opts.cfg,
        sampler_name: opts.sampler ? opts.sampler.face_sampler.sampler_name : args.base_sampler_opts.sampler_name,
        scheduler: opts.sampler ? opts.sampler.face_sampler.scheduler : args.base_sampler_opts.scheduler,
        denoise: opts.sampler ? opts.sampler.face_sampler.denoise : args.base_sampler_opts.denoise,
        mask_blur: opts.mask_blur,
        mask_type: opts.mask_type,
        mask_control: opts.mask_control,
        dilate_mask_value: opts.dilate_mask_value,
        erode_mask_value: opts.erode_mask_value
    })
    return_latent = return_node
    return_mask = return_node._MASK

    return { return_latent, return_mask }

}