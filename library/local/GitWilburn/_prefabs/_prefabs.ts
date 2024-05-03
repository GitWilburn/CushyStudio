import type { GetWidgetResult } from '../../../../src/controls/IWidget'
import type { FormBuilder, Runtime } from '../../../../src/CUSHY'
import type { OpenRouter_Models } from '../../../../src/llm/OpenRouter_models'
import type { ui_latent_v3 } from '../../../built-in/_prefabs/prefab_latent_v3'

import { GetWidgetState } from '../../../../src/controls/IWidget'
import { openRouterInfos } from '../../../../src/llm/OpenRouter_infos'
import { type Ctx_sampler, run_sampler } from '../../../built-in/_prefabs/prefab_sampler'

// this should be a default
export type OutputFor<UIFn extends (form: FormBuilder) => any> = GetWidgetResult<ReturnType<UIFn>>

// const form = getGlobalFormBuilder()
// const flow = getGlobalRuntime()

export const ui_sampler = (p?: {
    denoise?: number
    steps?: number
    cfg?: number
    sampler_name?: Enum_KSampler_sampler_name
    scheduler?: Enum_KSampler_scheduler
}) => {
    const form: FormBuilder = getCurrentForm()
    return form.group({
        summary: (ui) => {
            return `denoise=${ui.denoise} steps=${ui.steps} cfg=${ui.cfg}`
        },
        items: {
            denoise: form.float({ step: 0.1, min: 0, max: 1, default: p?.denoise ?? 1, label: 'Denoise' }),
            steps: form.int({ step: 10, default: p?.steps ?? 20, label: 'Steps', min: 0, softMax: 100 }),
            cfg: form.float({ step: 1, label: 'CFG', min: 0, max: 100, softMax: 10, default: p?.cfg ?? 7 }),
            seed: form.seed({}),
            sampler_name: form.enum.Enum_KSampler_sampler_name({ label: 'Sampler', default: p?.sampler_name ?? 'euler' }),
            scheduler: form.enum.Enum_KSampler_scheduler({ label: 'Scheduler', default: p?.scheduler ?? 'karras' }),
        },
    })
}

export const ui_SDXL_aspectRatio = () => {
    const form: FormBuilder = getCurrentForm()
    return form.fields({
        AspectRatio: form.choice({
            appearance: 'tab',
            default: '_1024x1024',
            items: {
                _custom: form.group({}),
                _768x512: form.group({}),
                _512x768: form.group({}),
                _512x512: form.group({}),
                _704x1408: form.group({}),
                _704x1344: form.group({}),
                _768x1344: form.group({}),
                _768x1280: form.group({}),
                _832x1216: form.group({}),
                _832x1152: form.group({}),
                _896x1152: form.group({}),
                _896x1088: form.group({}),
                _960x1088: form.group({}),
                _960x1024: form.group({}),
                _1024x1024: form.group({}),
                _1024x960: form.group({}),
                _1088x960: form.group({}),
                _1088x896: form.group({}),
                _1152x896: form.group({}),
                _1152x832: form.group({}),
                _1216x832: form.group({}),
                _1280x768: form.group({}),
                _1344x768: form.group({}),
                _1344x704: form.group({}),
                _1408x704: form.group({}),
                _1472x704: form.group({}),
                _1536x640: form.group({}),
                _1600x640: form.group({}),
                _1664x576: form.group({}),
                _1728x576: form.group({}),
            },
        }),
    })
}
const parseDimensions = (dimensions: string): { width: number; height: number } => {
    console.log(dimensions)
    const parts = dimensions.split('x')
    if (parts.length !== 2) {
        throw new Error('Invalid dimensions format. Expected format: widthxheight')
    }

    const width = parseInt(parts[0] ?? '1024', 10)
    const height = parseInt(parts[1] ?? '1024', 10)

    if (isNaN(width) || isNaN(height)) {
        throw new Error('Width and height must be numeric values.')
    }
    console.log('parsed to' + width + ' x ' + height)
    return { width, height }
}

const clearLLMresponse = async () => {
    //doesn't work because there is no run in context when clicked from the form
    console.log('[⚡⚡] clicked')
    const run = getCurrentRun()
    run.formInstance.fields.promptFromLlm.fields.llmResponse.markdown = ''
}

export const ui_epic_llm = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'LLM Expanded Prompt',
        items: () => ({
            llmSettings: form.group({
                items: () => ({
                    llmModel: form.selectOne({
                        choices: Object.entries(openRouterInfos).map(([id, info]) => ({
                            id: id as OpenRouter_Models,
                            label: info.name,
                        })),
                    }),
                    llmAction: form.choice({
                        appearance: 'tab',
                        default: 'Complete',
                        items: {
                            Complete: form.group({}),
                            Cleanup: form.group({}),
                            Augment: form.group({}),
                            RandomName: form.group({}),
                        },
                    }),
                }),
                startCollapsed: true,
            }),
            promptForExpansion: form.string({ textarea: true }),
            // runLlm: form.inlineRun({ text: 'Ask LLM', kind: 'special' }),
            runLLM: form.choices({
                appearance: 'tab',
                default: 'RunSD',
                items: {
                    AskLLM: form.group({}),
                    RunSD: form.group({}),
                },
            }),
            llmResponse: form.markdown({
                markdown: ``,
            }),
            clear: form.button({ onClick: () => void clearLLMresponse() }),
            //llmResponse: form.promptV2({}),
        }),
    })
}

export const run_latent_vEpic = async (p: {
    opts: OutputFor<typeof ui_latent_v3>
    vae: _VAE
    width_override?: number
    height_override?: number
}) => {
    // init stuff
    const run = getCurrentRun()
    const graph = run.nodes
    const opts = p.opts

    // misc calculatiosn
    const width = p.width_override || opts.emptyLatent?.size.width || 1024
    const height = p.height_override || opts.emptyLatent?.size.height || 1024
    let latent: HasSingle_LATENT

    let blankLatent = false
    // case 1. start form image
    if (opts.image) {
        const _img = run.loadImage(opts.image.image.imageID)
        const loadedImage = await _img.loadInWorkflow()
        let rescaled: _IMAGE = loadedImage
        if (opts.image.scale?.type.scaleToSelectedSize) {
            rescaled = graph.ImageScale({
                image: loadedImage,
                width: opts.image.scale.type.scaleToSelectedSize.width,
                height: opts.image.scale.type.scaleToSelectedSize.width,
                crop: 'center',
                upscale_method: 'lanczos',
            })
        } else if (opts.image.scale?.type.scaleBy) {
            rescaled = graph.ImageScaleBy({
                image: loadedImage,
                scale_by: opts.image.scale.type.scaleBy,
                upscale_method: 'lanczos',
            })
        } else if (opts.image.scale?.type.scaleAuto) {
            if (width != _img.width || height != _img.height) {
                const max = Math.min(width / _img.width, height / _img.height)
                rescaled = graph.ImageScaleBy({
                    image: loadedImage,
                    scale_by: max,
                    upscale_method: max > 1 ? 'area' : 'lanczos',
                })
            }
        }
        latent = graph.VAEEncode({ pixels: rescaled, vae: p.vae })

        if (opts.image.batchSize > 1) {
            latent = graph.RepeatLatentBatch({
                samples: latent,
                amount: opts.image.batchSize,
            })
        }
    }

    // case 2. start from empty latent
    else if (opts.emptyLatent) {
        latent = graph.EmptyLatentImage({
            batch_size: opts.emptyLatent.batchSize ?? 1,
            height: height,
            width: width,
        })
        blankLatent = true
    }

    // default case
    else {
        throw new Error('no latent')
    }

    // return everything
    return { latent, width, height, blankLatent }
}

export const run_SDXL_aspectRatio = (
    ui: OutputFor<typeof ui_SDXL_aspectRatio>,
    customWidth: number = 1024,
    customHeight: number = 1024,
): { width: number; height: number } => {
    //just tired of messing with this
    //got to be a better way to do this, but i'm too typscript stupid
    if (ui.AspectRatio._custom) {
        return { width: customWidth, height: customHeight }
    }
    if (ui.AspectRatio._704x1408) {
        return parseDimensions('704x1408')
    }
    if (ui.AspectRatio._704x1344) {
        return parseDimensions('704x1344')
    }
    if (ui.AspectRatio._768x1344) {
        return parseDimensions('768x1344')
    }
    if (ui.AspectRatio._768x1280) {
        return parseDimensions('768x1280')
    }
    if (ui.AspectRatio._832x1216) {
        return parseDimensions('832x1216')
    }
    if (ui.AspectRatio._832x1152) {
        return parseDimensions('832x1152')
    }
    if (ui.AspectRatio._896x1152) {
        return parseDimensions('896x1152')
    }
    if (ui.AspectRatio._896x1088) {
        return parseDimensions('896x1088')
    }
    // Continue this pattern for the rest of the aspect ratios
    if (ui.AspectRatio._960x1088) {
        return parseDimensions('960x1088')
    }
    if (ui.AspectRatio._960x1024) {
        return parseDimensions('960x1024')
    }
    if (ui.AspectRatio._1024x1024) {
        return parseDimensions('1024x1024')
    }
    if (ui.AspectRatio._1024x960) {
        return parseDimensions('1024x960')
    }
    if (ui.AspectRatio._1088x960) {
        return parseDimensions('1088x960')
    }
    if (ui.AspectRatio._1088x896) {
        return parseDimensions('1088x896')
    }
    if (ui.AspectRatio._1152x896) {
        return parseDimensions('1152x896')
    }
    if (ui.AspectRatio._1152x832) {
        return parseDimensions('1152x832')
    }
    if (ui.AspectRatio._1216x832) {
        return parseDimensions('1216x832')
    }
    if (ui.AspectRatio._1280x768) {
        return parseDimensions('1280x768')
    }
    if (ui.AspectRatio._1344x768) {
        return parseDimensions('1344x768')
    }
    if (ui.AspectRatio._1344x704) {
        return parseDimensions('1344x704')
    }
    if (ui.AspectRatio._1408x704) {
        return parseDimensions('1408x704')
    }
    if (ui.AspectRatio._1472x704) {
        return parseDimensions('1472x704')
    }
    if (ui.AspectRatio._1536x640) {
        return parseDimensions('1536x640')
    }
    if (ui.AspectRatio._1600x640) {
        return parseDimensions('1600x640')
    }
    if (ui.AspectRatio._1664x576) {
        return parseDimensions('1664x576')
    }
    if (ui.AspectRatio._1728x576) {
        return parseDimensions('1728x576')
    }
    if (ui.AspectRatio._512x512) {
        return parseDimensions('512x512')
    }
    if (ui.AspectRatio._512x768) {
        return parseDimensions('512x768')
    }
    if (ui.AspectRatio._768x512) {
        return parseDimensions('768x512')
    }
    return parseDimensions('1024x1024')
}

// HIGH_RES_FIX -----------------------------------------------------------

export const ui_highresfix = () => {
    const form: FormBuilder = getCurrentForm()
    return form
        .group({
            label: 'Upscale Pass (High Res Fix)',
            items: {
                upscaleMethod: form.selectOne({
                    appearance: 'tab',
                    choices: [{ id: 'regular' }, { id: 'Neural 1.5' }, { id: 'Neural XL' }],
                    requirements: [{ type: 'customNodesByURI', uri: 'https://github.com/Ttl/ComfyUi_NNLatentUpscale' }],
                    tooltip:
                        'regular upscale add more noise, depend your objective. for a second pass to refine stuff, I think adding noise is better',
                }),
                scaleFactor: form.float({ default: 1.5, min: 0.5, max: 8, step: 1 }),
                settings: form.group({
                    items: {
                        sampler: ui_sampler({
                            sampler_name: 'dpmpp_sde',
                            scheduler: 'karras',
                            cfg: 1.7,
                            denoise: 0.5,
                            steps: 10,
                        }),
                        saveIntermediaryImage: form.bool({ default: true }),
                        KohyaDeepShrink: form
                            .group({
                                startCollapsed: true,
                                items: {
                                    // enable: form.bool({ default: false }),
                                    endPercent: form.float({ default: 0.35, min: 0, max: 1, step: 0.05 }),
                                },
                            })
                            .optional(),
                        EnvyHiResFixXLLora: form
                            .group({
                                startCollapsed: true,
                                items: {
                                    strength: form.float({ default: 0.75, min: 0, max: 1, step: 0.05 }),
                                },
                            })
                            .optional(),
                    },
                }),
            },
        })
        .optional(false)
}

export type ctx_sampler = {
    ckpt: _MODEL
    clip: _CLIP
    latent: HasSingle_LATENT
    positive: string | _CONDITIONING
    negative: string | _CONDITIONING
    preview?: boolean
    vae: _VAE
}

export const run_highresfix = (
    ui: OutputFor<typeof ui_highresfix>,
    ctx: ctx_sampler,
    width: _INT | undefined,
    height: _INT | undefined,
) => {
    //
    const run = getCurrentRun()
    const nodes = run.nodes
    let ckpt = ctx.ckpt
    if (ui?.settings.EnvyHiResFixXLLora) {
        ckpt = nodes.LoraLoader({
            model: ctx.ckpt ?? run.AUTO,
            clip: ctx.clip ?? run.AUTO,
            lora_name: 'EnvyBetterHiresFixXL01.safetensors',
            strength_clip: ui.settings.EnvyHiResFixXLLora.strength, // tok.loraDef.strength_clip,
            strength_model: ui.settings.EnvyHiResFixXLLora.strength, // tok.loraDef.strength_model,
        })
    }
    if (ui?.settings.KohyaDeepShrink) {
        ckpt = nodes.PatchModelAddDownscale({
            downscale_factor: ui.scaleFactor,
            model: ckpt,
            block_number: 3,
            start_percent: 0,
            end_percent: ui.settings.KohyaDeepShrink.endPercent,
            downscale_after_skip: true,
            downscale_method: 'bicubic',
            upscale_method: 'bicubic',
        })
    }
    const ctx_sampler_fix: ctx_sampler = {
        ckpt: ckpt ?? run.AUTO,
        clip: ctx.clip ?? run.AUTO,
        vae: ctx.vae ?? run.AUTO,
        latent: ctx.latent ?? run.AUTO,
        positive: ctx.positive ?? run.AUTO,
        negative: ctx.negative ?? run.AUTO,
        preview: false,
    }
    if (ui?.settings.saveIntermediaryImage) {
        nodes.SaveImage({ images: nodes.VAEDecode({ samples: ctx.latent ?? run.AUTO, vae: ctx.vae ?? run.AUTO }) })
    }
    let latent: HasSingle_LATENT =
        ui?.upscaleMethod.id === 'regular'
            ? nodes.LatentUpscale({
                  samples: ctx.latent ?? run.AUTO,
                  crop: 'disabled',
                  upscale_method: 'nearest-exact',
                  height: typeof height === 'number' ? height * ui.scaleFactor : run.AUTO,
                  width: typeof width === 'number' ? width * ui.scaleFactor : run.AUTO,
              })
            : nodes.NNLatentUpscale({
                  latent: ctx.latent ?? run.AUTO,
                  version: ui?.upscaleMethod.id == 'Neural XL' ? 'SDXL' : 'SD 1.x',
                  upscale: ui?.scaleFactor ?? 1.5,
              })
    latent = run_sampler(
        run,
        {
            seed: ui?.settings.sampler.seed ?? 0,
            cfg: ui?.settings.sampler.cfg ?? 7,
            steps: ui?.settings.sampler.steps ?? 20,
            denoise: ui?.settings.sampler.denoise ?? 1,
            sampler_name: ui?.settings.sampler.sampler_name ?? 'ddim',
            scheduler: ui?.settings.sampler.scheduler ?? 'ddim_uniform',
        },
        { ...ctx_sampler_fix, latent, preview: false },
    ).latent

    return { latent, width, height }
}

// CTX -----------------------------------------------------------
export type Ctx_sampler_ui_opts = {
    seed: number
    cfg: number
    steps: number
    sampler_name: Enum_KSampler_sampler_name
    scheduler: Enum_KSampler_scheduler
    denoise: number
}

export const epic_run_sampler = (run: Runtime, opts: Ctx_sampler_ui_opts, ctx: Ctx_sampler): { latent: KSampler } => {
    const graph = run.nodes
    // flow.output_text(`run_sampler with seed : ${opts.seed}`)
    const latent = graph.KSampler({
        model: ctx.ckpt,
        seed: opts.seed,
        latent_image: ctx.latent,
        cfg: opts.cfg,
        steps: opts.steps,
        sampler_name: opts.sampler_name,
        scheduler: opts.scheduler,
        denoise: opts.denoise,
        positive:
            typeof ctx.positive === 'string' //
                ? graph.CLIPTextEncode({ clip: ctx.clip, text: ctx.positive })
                : ctx.positive,
        negative:
            typeof ctx.negative === 'string' //
                ? graph.CLIPTextEncode({ clip: ctx.clip, text: ctx.negative })
                : ctx.negative,
    })
    // const image = graph.VAEDecode({
    //     vae: ctx.vae,
    //     samples: latent,
    // })
    if (ctx.preview)
        graph.PreviewImage({
            images: graph.VAEDecode({
                vae: ctx.vae,
                samples: latent,
            }),
        })
    return { latent }
}
