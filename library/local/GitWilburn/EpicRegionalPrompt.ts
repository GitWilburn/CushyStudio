import { run_latent_v3, ui_latent_v3 } from '../../built-in/_prefabs/prefab_latent_v3'
import { ui_mask } from '../../built-in/_prefabs/prefab_mask'
import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { run_prompt } from '../../built-in/_prefabs/prefab_prompt'
import { type Ctx_sampler, run_sampler } from '../../built-in/_prefabs/prefab_sampler'
import { type Ctx_sampler_ui_opts, epic_run_sampler, ui_sampler } from './_prefabs/_prefabs'

app({
    metadata: {
        name: 'EPIC Regional',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'Simple interface similar to Fooocus.',
    },
    ui: (ui) => ({
        // positivePrompt: ui.promptV2(),
        basePrompt: ui.promptV2({}),
        // baseMask: ui.image({}),
        promptList: ui.list({
            element: () => ui.fields({ prompt: ui.promptV2({}), mask: ui.image({}) }),
        }),
        // secondPrompt: ui.promptV2({}),
        // latent: ui_latent_v3(),
        // regionalPrompt: ui.regional({
        //     height: 512,
        //     width: 512,
        //     initialPosition: ({ width: w, height: h }) => ({
        //         fill: `#${Math.round(Math.random() * 0xffffff).toString(16)}`,
        //         height: 64,
        //         width: 64,
        //         depth: 1,
        //         x: Math.round(Math.random() * w),
        //         y: Math.round(Math.random() * h),
        //         z: 1,
        //     }),
        //     element: ({ width: w, height: h }) =>
        //         ui.fields({
        //             prompt: ui.prompt({}),
        //             mode: ui.selectOne({
        //                 choices: [{ id: 'combine' }, { id: 'concat' }],
        //             }),
        //         }),
        // }),
        // mask: ui.image({}),
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
            prompt: ui.basePrompt,
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
        // START IMAGE -------------------------------------------------------------------------
        let { latent, width, height } = imgCtx
            ? /* 🔴 */ await (async () => ({
                  /* 🔴 */ latent: graph.VAEEncode({ pixels: await imgCtx.loadInWorkflow(), vae }),
                  /* 🔴 */ height: imgCtx.height,
                  /* 🔴 */ width: imgCtx.width,
                  /* 🔴 */
              }))()
            : await run_latent_v3({ opts: ui.advanced.latent, vae })

        let promptCount = 0
        let condList: { cond: _CONDITIONING; mask: _MASK }[] = []
        for (const regionalPrompt of ui.promptList) {
            promptCount += 1
            const _img = run.loadImage(regionalPrompt.mask.imageID)
            const mask = graph.InvertMask({ mask: await _img.loadInWorkflowAsMask('alpha') })
            const cond = run_prompt({
                prompt: regionalPrompt.prompt,
                clip,
                ckpt,
                printWildcards: true,
            }).conditioning
            // const mask = graph.ImageToMask({ image, channel: 'alpha' })
            condList[promptCount] = { cond, mask }
        }
        let attentionCoupleNode: EPIC_Attention_Couple | undefined = undefined
        // const _img = run.loadImage(ui.baseMask.imageID)
        // const mask = await _img.loadInWorkflowAsMask('alpha')
        if (condList[1]) {
            attentionCoupleNode = graph.EPIC_Attention_Couple({
                model: ckpt,
                base_mask: graph.InvertMask({ mask: condList[1].mask }),
                cond_1: condList[1].cond,
                mask_1: condList[1].mask,
                cond_2: condList[2]?.cond,
                mask_2: condList[2]?.mask,
                cond_3: condList[3]?.cond,
                mask_3: condList[3]?.mask,
                cond_4: condList[4]?.cond,
                mask_4: condList[4]?.mask,
                cond_5: condList[5]?.cond,
                mask_5: condList[5]?.mask,
                cond_6: condList[6]?.cond,
                mask_6: condList[6]?.mask,
                cond_7: condList[7]?.cond,
                mask_7: condList[7]?.mask,
                cond_8: condList[8]?.cond,
                mask_8: condList[8]?.mask,
                cond_9: condList[9]?.cond,
                mask_9: condList[9]?.mask,
                cond_10: condList[10]?.cond,
                mask_10: condList[10]?.mask,
            })
            // for (const square of ui.regionalPrompt.items) {
            //     const squareCond = graph.ConditioningSetArea({
            //         conditioning: graph.CLIPTextEncode({ clip, text: square.value.prompt.text }),
            //         height: square.position.height,
            //         width: square.position.width,
            //         x: square.position.x,
            //         y: square.position.y,
            //         strength: square.value.strength,
            //     })
            //     // positive = graph.ConditioningBlend({
            //     //     conditioning_a: positive,
            //     //     conditioning_b: squareCond,
            //     //     blending_strength: square.value.strength,
            //     //     blending_mode: square.value.mode,
            //     // })
            //     positive = graph.ConditioningCombine({
            //         conditioning_1: positive,
            //         conditioning_2: squareCond,
            //     })
            // }
        }

        // FIRST PASS --------------------------------------------------------------------------------
        const ctx_sampler: Ctx_sampler = {
            ckpt: attentionCoupleNode?._MODEL ?? ckpt,
            clip: clip,
            vae,
            latent,
            positive: positivePrompt.conditioning,
            negative: negativePrompt.conditioning,
            preview: false,
        }

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
