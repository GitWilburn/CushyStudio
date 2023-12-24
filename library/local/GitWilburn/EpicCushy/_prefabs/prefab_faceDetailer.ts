import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { OutputFor } from 'library/built-in/_prefabs/_prefabs'
import { Ctx_sampler, ui_sampler } from 'library/built-in/_prefabs/prefab_sampler';
import { run_prompt } from 'library/built-in/_prefabs/prefab_prompt';

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
            erode_mask_value: form.int({ min: 0, default: 3 })
        }),

    })
}

// 🅿️ DZ FaceDetailer Run -----------------------------------------------------------
export type dz_faceDetailer_args = {
    base_sampler: Ctx_sampler,
    base_sampler_opts: OutputFor<typeof ui_sampler>
}

export const run_dz_face_detailer = (
    run: Runtime,
    opts: OutputFor<typeof ui_dz_face_detailer>,
    args: dz_faceDetailer_args): { return_latent: any, return_mask: any } => {
    const graph = run.nodes
    let return_latent: _LATENT = args.base_sampler.latent
    let return_mask: _MASK | undefined

    if (!opts)
        return { return_latent, return_mask } //if the detailer isn't selected, just return the latent as is

    const ckpt = args.base_sampler.ckpt

    let positive: _CONDITIONING
    let negative: _CONDITIONING
    let ckptPos: _MODEL
    const clip = args.base_sampler.clip
    //if there is text, then use it instead of the base prompt
    if (opts.sampler && opts.sampler.positive.tokens.length > 0) {
        // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
        const x = run_prompt(run, { richPrompt: opts.sampler.positive, clip, ckpt, outputWildcardsPicked: true })
        ckptPos = x.ckpt
        positive = x.conditionning
    }
    else {
        positive = typeof args.base_sampler.positive === 'string' //
            ? graph.CLIPTextEncode({ clip: args.base_sampler.clip, text: args.base_sampler.positive })
            : args.base_sampler.positive
    }

    //negative text
    if (opts.sampler && opts.sampler.negative.tokens.length > 0) {
        // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
        const y = run_prompt(run, { richPrompt: opts.sampler.negative, clip, ckpt, outputWildcardsPicked: true })
        negative = y.conditionning
    }
    else {
        negative = typeof args.base_sampler.negative === 'string' //
            ? graph.CLIPTextEncode({ clip: args.base_sampler.clip, text: args.base_sampler.negative })
            : args.base_sampler.negative
    }

    const return_node = graph.DZ$_Face$_Detailer({
        model: args.base_sampler.ckpt,
        positive: positive,
        negative: negative,
        latent_image: args.base_sampler.latent,
        vae: args.base_sampler.vae,
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
    return_latent = return_node._LATENT
    return_mask = return_node._MASK

    return { return_latent, return_mask }

}