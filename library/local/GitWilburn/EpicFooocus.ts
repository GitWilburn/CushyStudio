import { run_latent_v3, ui_latent_v3 } from '../../built-in/_prefabs/prefab_latent_v3'
import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { run_prompt } from '../../built-in/_prefabs/prefab_prompt'
import { type Ctx_sampler, run_sampler } from '../../built-in/_prefabs/prefab_sampler'
import { type Ctx_sampler_ui_opts, epic_run_sampler, ui_sampler } from './_prefabs/_prefabs'

app({
    metadata: {
        name: 'EPIC Fooocus',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'Simple interface similar to Fooocus.',
    },
    ui: (ui) => ({
        positivePrompt: ui.promptV2(),
        quality: ui.choice({
            appearance: 'tab',
            items: {
                Instant: ui.group({}),
                Lightning: ui.group({}),
                Turbo: ui.group({}),
                SamplerSettings: ui.group({}),
            },
        }),
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
        const ctx_sampler: Ctx_sampler = {
            ckpt: ckpt,
            clip: clip,
            vae,
            latent,
            positive: positivePrompt.conditioning,
            negative: negativePrompt.conditioning,
            preview: false,
        }

        const steps = ui.quality.Instant ? 2 : ui.quality.Lightning ? 5 : ui.quality.Turbo ? 10 : ui.advanced.sampler.steps
        const ctx_ui_sampler: Ctx_sampler_ui_opts = {
            seed: ui.advanced.sampler.seed,
            cfg: ui.advanced.sampler.cfg,
            steps: steps,
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
