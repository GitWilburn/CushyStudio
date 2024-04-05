import { run_latent_v3, ui_latent_v3 } from '../../built-in/_prefabs/prefab_latent_v3'
import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { run_prompt } from '../../built-in/_prefabs/prefab_prompt'
import { type Ctx_sampler, run_sampler } from '../../built-in/_prefabs/prefab_sampler'
import { type Ctx_sampler_ui_opts, epic_run_sampler, ui_sampler } from './_prefabs/_prefabs'

app({
    metadata: {
        name: 'EPIC Silly Tavern',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'Generate character emotion image set.',
    },
    ui: (ui) => ({
        positivePrompt: ui.promptV2(),
        negativePrompt: ui.promptV2(),
        characterName: ui.string({}),
        characterFace: ui.image({}),
        characterImage: ui.image({}),
        emotionsToGenerate: ui.fields({
            admiration:     ui.bool({}), //prettier-ignore
            amusement:      ui.bool({}), //prettier-ignore
            anger:          ui.bool({default:true}), //prettier-ignore
            annoyance:      ui.bool({}), //prettier-ignore
            approval:       ui.bool({}), //prettier-ignore
            caring:         ui.bool({}), //prettier-ignore
            confusion:      ui.bool({}), //prettier-ignore
            curiosity:      ui.bool({}), //prettier-ignore
            desire:         ui.bool({}), //prettier-ignore
            disappoint:     ui.bool({}), //prettier-ignore
            disapproval:    ui.bool({}), //prettier-ignore
            disgust:        ui.bool({}), //prettier-ignore
            embarrassment:  ui.bool({}), //prettier-ignore
            excitement:     ui.bool({}), //prettier-ignore
            fear:           ui.bool({}), //prettier-ignore
            gratitude:      ui.bool({}), //prettier-ignore
            grief:          ui.bool({}), //prettier-ignore
            joy:            ui.bool({}), //prettier-ignore
            love:           ui.bool({}), //prettier-ignore
            nervousness:    ui.bool({}), //prettier-ignore
            neutral:        ui.bool({}), //prettier-ignore
            optimism:       ui.bool({}), //prettier-ignore
            pride:          ui.bool({}), //prettier-ignore
            realization:    ui.bool({}), //prettier-ignore
            relief:         ui.bool({}), //prettier-ignore
            remorse:        ui.bool({}), //prettier-ignore
            sadness:        ui.bool({}), //prettier-ignore
            surprise:       ui.bool({}), //prettier-ignore
        }),
        // quality: ui.choice({
        //     appearance: 'tab',
        //     items: {
        //         Instant: ui.group({}),
        //         Lightning: ui.group({}),
        //         Turbo: ui.group({}),
        //         SamplerSettings: ui.group({}),
        //     },
        // }),
        advanced: ui.fields(
            {
                negativePrompt: ui.promptV2({
                    default: 'text, watermark, bad quality, blurry, low resolution, pixelated, noisy',
                }),
                model: ui_model(),
                sampler: ui_sampler({ cfg: 1, steps: 6, sampler_name: 'dpmpp_sde', scheduler: 'karras' }),
                latent: ui_latent_v3(),
            },
            { startCollapsed: true },
        ),
    }),
    //
    run: async (run, ui, imgCtx) => {
        const graph = run.nodes
        let { ckpt, vae, clip } = run_model(ui.advanced.model)
        const positivePrompt = run_prompt({
            prompt: ui.positivePrompt,
            clip,
            ckpt,
            printWildcards: true,
        })
        const negativePrompt = run_prompt({
            prompt: ui.advanced.negativePrompt,
            clip,
            ckpt,
            printWildcards: true,
        })

        let { latent, width, height } = imgCtx
            ? /* 🔴 */ await (async () => ({
                  /* 🔴 */ latent: graph.VAEEncode({ pixels: await imgCtx.loadInWorkflow(), vae }),
                  /* 🔴 */ height: imgCtx.height,
                  /* 🔴 */ width: imgCtx.width,
                  /* 🔴 */
              }))()
            : await run_latent_v3({ opts: ui.advanced.latent, vae })

        // FIRST PASS --------------------------------------------------------------------------------
        const emotion = 'angry'
        const ctx_sampler: Ctx_sampler = {
            ckpt: ckpt,
            clip: clip,
            vae,
            latent,
            positive: graph.CLIPTextEncode({ clip: run.AUTO(), text: '(' + emotion + ':1.5)' }),
            negative: negativePrompt.conditioning,
            preview: false,
        }

        // const steps = ui.quality.Instant ? 2 : ui.quality.Lightning ? 5 : ui.quality.Turbo ? 10 : ui.advanced.sampler.steps
        const ctx_ui_sampler: Ctx_sampler_ui_opts = {
            seed: ui.advanced.sampler.seed,
            cfg: ui.advanced.sampler.cfg,
            steps: ui.advanced.sampler.steps,
            sampler_name: ui.advanced.sampler.sampler_name,
            scheduler: ui.advanced.sampler.scheduler,
            denoise: ui.advanced.sampler.denoise,
        }

        latent = epic_run_sampler(run, ctx_ui_sampler, ctx_sampler).latent

        let finalImage: _IMAGE = graph.VAEDecode({ samples: latent, vae })
        graph.SaveImage({ images: finalImage })
        await run.PROMPT({})
    },
})
