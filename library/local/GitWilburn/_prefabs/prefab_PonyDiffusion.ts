import type { FormBuilder } from '../../../../src/controls/FormBuilder'
import type { GetWidgetResult } from '../../../../src/controls/IWidget'

import { compilePrompt } from '../../../../src/controls/widgets/prompt/_compile'

export type OutputFor<UIFn extends (form: FormBuilder) => any> = GetWidgetResult<ReturnType<UIFn>>

const ckpts = cushy.managerRepository.getKnownCheckpoints()

//

export const ui_selection = () => {
    const form = getCurrentForm()

    return form.fields(
        {
            score: form.choices({
                default: {
                    score_9: true,
                    score_8_up: true,
                    score_7_up: true,
                    score_6_up: true,
                    score_5_up: true,
                    score_4_up: true,
                },
                appearance: 'tab',
                items: {
                    score_9: form.group({}),
                    score_8_up: form.group({}),
                    score_7_up: form.group({}),
                    score_6_up: form.group({}),
                    score_5_up: form.group({}),
                    score_4_up: form.group({}),
                },
            }),

            source: form.choices({
                default: {
                    source_pony: false,
                    source_furry: false,
                    source_cartoon: false,
                    source_anime: false,
                },
                appearance: 'tab',

                items: {
                    source_pony: form.group({}),
                    source_furry: form.group({}),
                    source_cartoon: form.group({}),
                    source_anime: form.group({}),
                },
            }),
            rating: form.choices({
                default: {
                    rating_safe: true,
                    rating_questionable: false,
                    rating_explicit: false,
                },
                appearance: 'tab',
                items: {
                    rating_safe: form.group({}),
                    rating_questionable: form.group({}),
                    rating_explicit: form.group({}),
                },
            }),
        },
        {
            summary: (ui) => {
                return [
                    `${ui.rating.rating_safe ? '🟢safe' : ''}`,
                    ` ${ui.rating.rating_questionable ? '🟢questionable' : ''}`,
                    ` ${ui.rating.rating_explicit ? '🟢explicit' : ''}`,
                    ` ${ui.score.score_9 ? '🟢9' : ''}`,
                    ` ${ui.score.score_8_up ? '🟢8' : ''}`,
                    ` ${ui.score.score_7_up ? '🟢7' : ''}`,
                    ` ${ui.score.score_6_up ? '🟢6' : ''}`,
                    ` ${ui.score.score_5_up ? '🟢5' : ''}`,
                    ` ${ui.score.score_4_up ? '🟢4' : ''}`,
                    ` ${ui.source.source_pony ? '🟢pony' : ''}`,
                    ` ${ui.source.source_furry ? '🟢furry' : ''}`,
                    ` ${ui.source.source_cartoon ? '🟢cartoon' : ''}`,
                    ` ${ui.source.source_anime ? '🟢anime' : ''}`,
                ].join('')
            },
        },
    )
}

export const run_selection = (group: OutputFor<typeof ui_selection>) => {
    const pony = group
    let ponyString = ''
    // Score
    if (pony.score.score_9) {
        ponyString += 'score_9, '
    }
    if (pony.score.score_8_up) {
        ponyString += 'score_8_up, '
    }
    if (pony.score.score_7_up) {
        ponyString += 'score_7_up, '
    }
    if (pony.score.score_6_up) {
        ponyString += 'score_6_up, '
    }
    if (pony.score.score_5_up) {
        ponyString += 'score_5_up, '
    }
    if (pony.score.score_4_up) {
        ponyString += 'score_4_up, '
    }

    // Source
    if (pony.source.source_anime) {
        ponyString += 'source_anime, '
    }
    if (pony.source.source_cartoon) {
        ponyString += 'source_cartoon, '
    }
    if (pony.source.source_furry) {
        ponyString += 'source_furry, '
    }
    if (pony.source.source_pony) {
        ponyString += 'source_pony, '
    }
    // Rating
    if (pony.rating.rating_explicit) {
        ponyString += 'rating_explicit, '
    }
    if (pony.rating.rating_questionable) {
        ponyString += 'rating_questionable, '
    }
    if (pony.rating.rating_safe) {
        ponyString += 'rating_safe, '
    }

    return ponyString
}

// --------------------------------------------------------

// model
export const ui_model = () => {
    const form = getCurrentForm()
    return form.group({
        layout: 'H',
        items: () => ({
            ckpt: form.enum.Enum_CheckpointLoaderSimple_ckpt_name({
                default: 'ponyDiffusionV6XL_v6.safetensors',
                label: 'Checkpoint',
                requirements: ckpts.map((x) => ({ type: 'modelCustom', infos: x })),
            }),
            vae: form.enumOpt.Enum_VAELoader_vae_name({ default: 'sdxl_vae.safetensors', startActive: true }),
            clipSkip: form.int({ label: 'Clip Skip', default: 2, max: 10 }),
            freeU: form.bool({ default: false }),
        }),
    })
}
export const run_model = (ui: OutputFor<typeof ui_model>): { ckpt: _MODEL; vae: _VAE; clip: _CLIP } => {
    const run = getCurrentRun()
    const graph = run.nodes

    // 1. MODEL
    const ckptSimple = graph.CheckpointLoaderSimple({ ckpt_name: ui.ckpt })
    let ckpt: _MODEL = ckptSimple
    let clip: _CLIP = ckptSimple

    // 2. OPTIONAL CUSTOM VAE
    let vae: _VAE = ckptSimple._VAE
    if (ui.vae) vae = graph.VAELoader({ vae_name: ui.vae })

    // 3. OPTIONAL CLIP SKIP
    if (ui.clipSkip) clip = graph.CLIPSetLastLayer({ clip, stop_at_clip_layer: -Math.abs(ui.clipSkip) })

    // 4. Optional FreeU
    if (ui.freeU) ckpt = graph.FreeU({ model: ckpt })

    return { ckpt, vae, clip }
}

export const ui_sampler = () => {
    const form = getCurrentForm()

    return form.group({
        items: () => ({
            denoise: form.float({ step: 0.01, min: 0, max: 1, default: 1, label: 'Denoise' }),
            steps: form.int({ default: 25, label: 'Steps', min: 0, max: 50 }),
            cfg: form.float({ label: 'CFG', min: 0, default: 7, max: 30, step: 0.25 }),
            sampler_name: form.enum.Enum_KSampler_sampler_name({
                label: 'Sampler',
                default: 'euler_ancestral',
            }),
            scheduler: form.enum.Enum_KSampler_scheduler({
                label: 'Scheduler',
                default: 'normal',
            }),
        }),
    })
}

// sampler
export const run_sampler = (ui: {
    //
    ckpt: _MODEL
    clip: _CLIP
    latent: _LATENT
    positive: string | _CONDITIONING
    negative: string | _CONDITIONING
    model: OutputFor<typeof ui_sampler>
    vae: _VAE
    preview?: boolean
    seed?: number
}): { image: _IMAGE; latent: _LATENT } => {
    const run = getCurrentRun()

    const graph = run.nodes
    const latent: HasSingle_LATENT = graph.KSampler({
        model: ui.ckpt,
        seed: ui.seed ?? run.randomSeed(),
        latent_image: ui.latent,
        cfg: ui.model.cfg,
        steps: ui.model.steps,
        sampler_name: ui.model.sampler_name,
        scheduler: ui.model.scheduler,
        denoise: ui.model.denoise,
        positive: typeof ui.positive === 'string' ? graph.CLIPTextEncode({ clip: ui.clip, text: ui.positive }) : ui.positive,
        negative: typeof ui.negative === 'string' ? graph.CLIPTextEncode({ clip: ui.clip, text: ui.negative }) : ui.negative,
    })
    const image = graph.VAEDecode({
        vae: ui.vae,
        samples: latent,
    })
    if (ui.preview) {
        graph.PreviewImage({ images: image })
    }
    return { image, latent }
}

// latent
export const ui_latent = () => {
    const form = getCurrentForm()

    return form.group({
        items: () => ({
            image: form.image({}),
            size: form.size({
                step: 128,
                min: 0,
                max: 2048,
                default: {
                    modelType: 'SDXL 1024',
                    aspectRatio: '1:1',
                },
            }),
            batchSize: form.int({ default: 1, min: 1, max: 20 }),
        }),
    })
}
// RUN PART
export const run_latent = async (ui: {
    //

    opts: OutputFor<typeof ui_latent>
    vae: _VAE
    batchOverwrite?: number
}) => {
    // init stuff
    const run = getCurrentRun()

    const graph = run.nodes
    const opts = ui.opts

    // misc calculatiosn
    let width: number
    let height: number
    let latent: _LATENT

    // case 1. start form image
    if (opts.image) {
        let image = await (await run.loadImageAnswer(opts.image))._IMAGE
        image = graph.ImageScale({
            image: image,
            crop: 'disabled',
            upscale_method: 'bicubic',
            height: opts.size.height,
            width: opts.size.width,
        }).outputs.IMAGE
        width = opts.size.width
        height = opts.size.height

        latent = graph.VAEEncode({
            pixels: image,
            vae: ui.vae,
        })
    }
    // case 2. start form empty latent
    else {
        width = opts.size.width
        height = opts.size.height
        latent = graph.EmptyLatentImage({
            batch_size: ui.batchOverwrite ?? opts.batchSize ?? 1,
            height: height,
            width: width,
        })
    }

    // return everything
    return { latent, width, height }
}

// ControleNet
export const ui_ControleNet = (form: FormBuilder = getCurrentForm()) => {
    return form.list({
        min: 0,
        element: () =>
            form.group({
                items: () => ({
                    Image: form.image({}),
                    controleModel: form.enum.Enum_ControlNetLoader_control_net_name({
                        label: 'controleModel',
                    }),
                    strength: form.float({ min: 0, max: 1, step: 0.01, default: 1 }),
                    begin: form.float({ min: 0, max: 1, step: 0.01, default: 0 }),
                    end: form.float({ min: 0, max: 1, step: 0.01, default: 1 }),

                    resize: form.boolean({ label: 'resize', default: true }),
                    preprocessor: ui_preprocessor(form, 'OpenPose'),
                }),
            }),
    })
}

export const run_ControleNet = () => {
    const run = getCurrentRun()

    // WIP :P
}

//LMC
export const ui_LMC = () => {
    const form = getCurrentForm()
    return form.group({
        label: 'LMC (This will overwrite the sampler)',

        tooltip: 'This will overwrite the sampler',
        layout: 'V',
        items: () => ({
            denoise: form.float({ step: 0.01, min: 0, max: 1, default: 1, label: 'Denoise' }),
            steps: form.int({ default: 5, label: 'Steps', min: 0, max: 10 }),
            cfg: form.float({ label: 'CFG', min: 0, default: 1.5, max: 5, step: 0.1 }),
        }),
    })
}

// --------------------------------------------------------
export const ui_preprocessor = (
    form: FormBuilder,
    default_ui?: 'Lineart' | 'OpenPose' | 'Depth' | 'Normal' | 'softedge' | undefined,
) => {
    return form.choice({
        label: 'preprocessor',
        tooltip: 'preprocessor being used on Image',
        default: default_ui ?? 'OpenPose',
        appearance: 'tab',
        items: {
            OpenPose: form.selectOne({
                choices: [
                    { id: 'OpenPose', label: 'OpenPose' },
                    { id: 'DWPose', label: 'SpecialPose' },
                ],
            }),
            Depth: form.selectOne({
                choices: [
                    { id: 'DepthMiDaS', label: 'MiDaS' },
                    { id: 'DepthZoe', label: 'Zoe' },
                ],
            }),

            Normal: form.selectOne({
                choices: [
                    { id: 'NormalMiDaS', label: 'MiDaS' },
                    { id: 'NormalBAE', label: 'BAE' },
                ],
            }),
            Lineart: form.selectOne({
                choices: [
                    { id: 'LineartReal', label: 'Real' },
                    { id: 'LineartAnime', label: 'Anime' },
                    { id: 'LineartManga', label: 'Manga' },
                ],
            }),
            softedge: form.selectOne({
                choices: [
                    { id: 'HEDLines', label: 'HED' },
                    { id: 'PiDiNetLines', label: 'PiDiNet' },
                ],
            }),
            None: form.selectOne({
                choices: [{ id: 'None', label: 'None' }],
            }),
        },
    })
}

export const run_preprocessor = (ui: {
    //
    image: _IMAGE
    preprocessor: OutputFor<typeof ui_preprocessor>
    preview?: boolean
}): _IMAGE => {
    const run = getCurrentRun()
    const graph = run.nodes
    const preprocessor = ui.preprocessor
    const image = ui.image
    const preview = ui.preview ?? true
    let preprocessorImage: _IMAGE | undefined

    if (preprocessor.OpenPose) {
        switch (preprocessor.OpenPose.id) {
            case 'OpenPose':
                preprocessorImage = graph.OpenposePreprocessor({ image: image })
                break
            case 'DWPose':
                preprocessorImage = graph.DWPreprocessor({ image: image })
                break
        }
    }
    if (preprocessor.Depth) {
        switch (preprocessor.Depth.id) {
            case 'DepthMiDaS':
                preprocessorImage = graph.MiDaS$7DepthMapPreprocessor({ image: image })
                break
            case 'DepthZoe':
                preprocessorImage = graph.Zoe$7DepthMapPreprocessor({ image: image })
                break
        }
    }
    if (preprocessor.Normal) {
        switch (preprocessor.Normal.id) {
            case 'NormalMiDaS':
                preprocessorImage = graph.MiDaS$7NormalMapPreprocessor({ image: image })
                break
            case 'NormalBAE':
                preprocessorImage = graph.BAE$7NormalMapPreprocessor({ image: image })
                break
        }
    }
    if (preprocessor.Lineart) {
        switch (preprocessor.Lineart.id) {
            case 'LineartReal':
                preprocessorImage = graph.LineArtPreprocessor({ image: image })
                break
            case 'LineartAnime':
                preprocessorImage = graph.AnimeLineArtPreprocessor({ image: image })
                break
            case 'LineartManga':
                preprocessorImage = graph.Manga2Anime$_LineArt$_Preprocessor({ image: image })
                break
        }
    }
    if (preprocessor.softedge) {
        switch (preprocessor.softedge.id) {
            case 'HEDLines':
                preprocessorImage = graph.HEDPreprocessor({ image: image })
                break
            case 'PiDiNetLines':
                preprocessorImage = graph.PiDiNetPreprocessor({ image: image })
                break
        }
    }
    if (preprocessor.None) {
        switch (preprocessor.None.id) {
            case 'None':
                preprocessorImage = image
                break
        }
    }
    if (preview) {
        graph.PreviewImage({ images: preprocessorImage ?? image })
    }
    return preprocessorImage ?? image
}
