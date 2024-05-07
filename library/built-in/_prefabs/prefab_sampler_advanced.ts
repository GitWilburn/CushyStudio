import type { FormBuilder } from '../../../src/controls/FormBuilder'
import type { Runtime } from '../../../src/runtime/Runtime'
import type { OutputFor } from './_prefabs'

// UI -----------------------------------------------------------
export const ui_sampler_advanced = (p?: {
    denoise?: number
    steps?: number
    cfg?: number
    sampler_name?: Enum_KSampler_sampler_name
    scheduler?: Enum_KSampler_scheduler
    startCollapsed?: boolean
}) => {
    const form: FormBuilder = getCurrentForm()
    return form.fields(
        {
            guidanceType: form.choice({
                items: {
                    CFG: form.fields({}),
                    DualCFG: form.fields({
                        cfg_conds2_negative: form.float({
                            step: 1,
                            label: 'CFG 2 Negative',
                            min: 0,
                            max: 100,
                            softMax: 10,
                            default: p?.cfg ?? 6,
                        }),
                        //prompt2: form.prompt({}),
                    }),
                    PerpNeg: form.fields({
                        negCfg: form.float({
                            step: 1,
                            label: 'Negative CFG',
                            min: 0,
                            max: 100,
                            softMax: 10,
                            default: p?.cfg ?? 6,
                        }),
                    }),
                },
                appearance: 'tab',
                default: { CFG: true },
            }),
            sigmasType: form.choice({
                items: {
                    basic: form.fields({
                        denoise: form.float({ step: 0.1, min: 0, max: 1, default: p?.denoise ?? 1, label: 'Denoise' }),
                        steps: form.int({ step: 20, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
                        scheduler: form.enum.Enum_KSampler_scheduler({ label: 'Scheduler', default: p?.scheduler ?? 'karras' }),
                    }),
                    AlignYourStep: form.fields({
                        modelType: form.enum.Enum_AlignYourStepsScheduler_model_type({ default: 'SDXL' }),
                        steps: form.int({ step: 1, default: p?.steps ?? 10, label: 'Steps', min: 0, softMax: 100 }),
                        denoise: form.float({ step: 0.1, min: 0, max: 1, default: p?.denoise ?? 1, label: 'Denoise' }),
                    }),
                    karrasCustom: form.fields({
                        steps: form.int({ step: 1, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
                        sigma_max: form.float({ default: 14.61, min: 0 }),
                        sigma_min: form.float({ default: 0.03 }),
                        rho: form.float({ default: 7.0 }),
                    }),
                    ExponentialCustom: form.fields({
                        steps: form.int({ step: 1, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
                        sigma_max: form.float({ default: 14.61, min: 0 }),
                        sigma_min: form.float({ default: 0.03 }),
                    }),
                    polyexponentialCustom: form.fields({
                        steps: form.int({ step: 1, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
                        sigma_max: form.float({ default: 14.61, min: 0 }),
                        sigma_min: form.float({ default: 0.03 }),
                        rho: form.float({ default: 1.0 }),
                    }),
                },
                appearance: 'tab',
            }),
            textEncoderType: form.choice({
                appearance: 'tab',
                items: {
                    CLIP: form.group({}),
                    SDXL: form.group({}),
                },
            }),
            cfg: form.float({ step: 1, label: 'CFG', min: 0, max: 100, softMax: 10, default: p?.cfg ?? 6 }),
            denoise: form.float({ step: 0.1, min: 0, max: 1, default: p?.denoise ?? 1, label: 'Denoise' }),
            sampler_name: form.enum.Enum_KSampler_sampler_name({
                label: 'Sampler',
                default: p?.sampler_name ?? 'euler',
            }),
            // steps: form.int({ step: 10, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
            seed: form.seed({}),
        },
        {
            summary: (ui) => {
                return `sigmas:${ui.sigmasType} guide:${ui.guidanceType} denoise:${ui.denoise} cfg:${ui.cfg} `
            },
            startCollapsed: p?.startCollapsed ?? false,
        },
    )
}

// CTX -----------------------------------------------------------
export type Ctx_sampler_advanced = {
    ckpt: _MODEL
    clip: _CLIP
    latent: HasSingle_LATENT
    positive: string | _CONDITIONING
    positive2: _CONDITIONING
    negative: string | _CONDITIONING
    width?: number
    height?: number
    preview?: boolean
    vae: _VAE
}

export const encodeText = (
    run: Runtime,
    clip: _CLIP,
    text: string,
    encodingType: 'SDXL' | 'CLIP',
    width?: number,
    height?: number,
): _CONDITIONING => {
    const graph = run.nodes

    const condition =
        encodingType == 'SDXL'
            ? graph.CLIPTextEncodeSDXL({
                  clip: clip,
                  text_g: text,
                  text_l: text,
                  width: width ?? 1024,
                  height: height ?? 1024,
                  target_width: width ?? 1024,
                  target_height: height ?? 1024,
              })
            : graph.CLIPTextEncode({
                  clip: clip,
                  text: text,
              })

    return condition
}
// RUN -----------------------------------------------------------
export const run_sampler_advanced = (
    run: Runtime,
    ui: OutputFor<typeof ui_sampler_advanced>,
    ctx: Ctx_sampler_advanced,
    blankLatent?: boolean,
): { output: _LATENT; denoised_output: _LATENT } => {
    const graph = run.nodes
    let ckpt = ctx.ckpt
    // flow.output_text(`run_sampler with seed : ${opts.seed}`)
    const posCondition: _CONDITIONING =
        typeof ctx.positive === 'string'
            ? encodeText(run, ctx.clip, ctx.positive, ui.textEncoderType.SDXL ? 'SDXL' : 'CLIP', ctx.width, ctx.height)
            : ctx.positive
    const negCondition: _CONDITIONING =
        typeof ctx.negative === 'string'
            ? encodeText(run, ctx.clip, ctx.negative, ui.textEncoderType.SDXL ? 'SDXL' : 'CLIP', ctx.width, ctx.height)
            : ctx.negative

    const noise = graph.RandomNoise({ noise_seed: ui.seed }).outputs.NOISE
    let guider: _GUIDER
    if (ui.guidanceType.DualCFG) {
        guider = graph.DualCFGGuider({
            model: ckpt,
            cond1: posCondition,
            cond2: ctx.positive2,
            negative: negCondition,
            cfg_conds: ui.cfg,
            cfg_cond2_negative: ui.guidanceType.DualCFG.cfg_conds2_negative,
        })
    } else if (ui.guidanceType.PerpNeg)
        guider = graph.PerpNegGuider({
            model: ckpt,
            positive: posCondition,
            negative: negCondition,
            empty_conditioning: graph.CLIPTextEncode({ clip: ctx.clip, text: '' }),
            cfg: ui.cfg,
            neg_scale: ui.guidanceType.PerpNeg.negCfg,
        })
    else if (ui.guidanceType.CFG)
        guider = graph.CFGGuider({
            model: ckpt,
            positive: posCondition,
            negative: negCondition,
            cfg: ui.cfg,
        })
    else throw new Error('❌ Guider type not known')

    let sigmas: _SIGMAS
    if (ui.sigmasType.basic) {
        sigmas = graph.BasicScheduler({
            scheduler: ui.sigmasType.basic.scheduler,
            steps: ui.sigmasType.basic.steps,
            denoise: ui.denoise,
            model: ckpt,
        })
    } else if (ui.sigmasType.AlignYourStep) {
        sigmas = graph.AlignYourStepsScheduler({
            model_type: ui.sigmasType.AlignYourStep.modelType,
            denoise: ui.sigmasType.AlignYourStep.denoise,
            steps: ui.sigmasType.AlignYourStep.steps,
        })
    } else if (ui.sigmasType.karrasCustom) {
        sigmas = graph.KarrasScheduler({
            steps: ui.sigmasType.karrasCustom.steps,
            sigma_max: ui.sigmasType.karrasCustom.sigma_max,
            sigma_min: ui.sigmasType.karrasCustom.sigma_min,
            rho: ui.sigmasType.karrasCustom.rho,
        })
    } else if (ui.sigmasType.ExponentialCustom) {
        sigmas = graph.ExponentialScheduler({
            steps: ui.sigmasType.ExponentialCustom.steps,
            sigma_max: ui.sigmasType.ExponentialCustom.sigma_max,
            sigma_min: ui.sigmasType.ExponentialCustom.sigma_min,
        })
    } else if (ui.sigmasType.polyexponentialCustom) {
        sigmas = graph.PolyexponentialScheduler({
            steps: ui.sigmasType.polyexponentialCustom.steps,
            sigma_max: ui.sigmasType.polyexponentialCustom.sigma_max,
            sigma_min: ui.sigmasType.polyexponentialCustom.sigma_min,
            rho: ui.sigmasType.polyexponentialCustom.rho,
        })
    } else {
        throw new Error('❌ Sigmas type not known')
    }

    const SamplerCustom = graph.SamplerCustomAdvanced({
        noise: noise,
        guider: guider,
        sampler: graph.KSamplerSelect({ sampler_name: ui.sampler_name }),
        sigmas: sigmas,
        latent_image: ctx.latent,
    })

    return {
        output: SamplerCustom.outputs.output,
        denoised_output: SamplerCustom.outputs.denoised_output,
    }
}
