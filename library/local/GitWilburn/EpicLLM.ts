import type { OpenRouter_Models } from '../../../src/llm/OpenRouter_models'

import { openRouterInfos } from '../../../src/llm/OpenRouter_infos'
import { Cnet_args, type Cnet_return, run_cnet, ui_cnet } from '../../built-in/_controlNet/prefab_cnet'
import { ui_latent_v3 } from '../../built-in/_prefabs/prefab_latent_v3'
import { run_prompt } from '../../built-in/_prefabs/prefab_prompt'
import { ui_rembg_v1 } from '../../built-in/_prefabs/prefab_rembg'
import { type Ctx_sampler, run_sampler } from '../../built-in/_prefabs/prefab_sampler'
import { run_customSave, ui_customSave } from '../../built-in/_prefabs/saveSmall'
import { epicLLM_getSystemPrompt, epicLLMSystemPromptType } from './_prefabs/_llm_systemPrompts'
import {
    run_highresfix,
    run_latent_vEpic,
    run_SDXL_aspectRatio,
    ui_highresfix,
    ui_sampler,
    ui_SDXL_aspectRatio,
} from './_prefabs/_prefabs'
import { run_refiners_fromImage, ui_refiners } from './_prefabs/prefab_detailer'
import { run_model, run_selection, ui_model, ui_selection } from './_prefabs/prefab_PonyDiffusion'

app({
    metadata: {
        name: 'EPIC Diffusion',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'EPIC diffusion with LLM expansion.',
    },
    ui: (form) => ({
        promptFromLlm: form.group({
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
                }),
                promptForExpansion: form.string({ textarea: true }),
                // runLlm: form.inlineRun({ text: 'Ask LLM', kind: 'special' }),
                runLLM: form.choices({
                    appearance: 'tab',
                    default: 'AskLLM',
                    items: {
                        AskLLM: form.group({}),
                        RunSD: form.group({}),
                    },
                }),
                llmResponse: form.markdown({
                    markdown: ``,
                }),
                //llmResponse: form.promptV2({}),
            }),
        }),
        userPrefacePrompt: form.prompt({
            default: ['highly detailed, masterpiece, best quality,'].join('\n'),
        }),
        ponyAdders: form.group({
            startCollapsed: true,
            items: {
                ponyui: ui_selection(),
            },
        }),
        // askLLM: form.button({ onClick: (form) => void askLLM(form) }),
        negative: form.prompt({
            startCollapsed: true,
            default: 'bad quality, blurry, low resolution, pixelated, noisy',
        }),
        model: ui_model(),
        latent: ui_latent_v3(),
        aspect: ui_SDXL_aspectRatio(),
        sampler: ui_sampler(),
        refine: ui_refiners(),
        highResFix: ui_highresfix(),
        //upscale: ui_upscaleWithModel(),
        customSave: ui_customSave(),
        removeBG: ui_rembg_v1(),

        controlnets: ui_cnet(),
        loop: form.group({
            items: () => ({
                batchCount: form.int({ default: 1 }),
                delayBetween: form.int({ tooltip: 'in ms', default: 0 }),
            }),
        }),
    }),
    //
    run: async (run, ui) => {
        // LOOP IF NEED BE ----------------------------------------------------------------------
        const loop = ui.loop
        // if (loop) {
        //     const ixes = new Array(ui.loop.batchCount).fill(0).map((_, i) => i)
        //     for (const i of ixes) {
        //         await new Promise((r) => setTimeout(r, loop.delayBetween))
        //
        // let expandedPrompt = run.formInstance.fields.promptFromLlm.fields.llmResponse.text ?? ui.promptFromLlm.promptForExpansion
        let expandedPrompt =
            run.formInstance.fields.promptFromLlm.fields.llmResponse.markdown ?? ui.promptFromLlm.promptForExpansion

        if (ui.promptFromLlm.runLLM.AskLLM) {
            if (!run.LLM.isConfigured) {
                run.output_text(`Enter your api key in Config`)
                return
            }
            const llmAction = ui.promptFromLlm.llmSettings.llmAction
            // const llmSystemMessage = ''
            // const llmSystemMessage = llmAction.Complete
            //     ? CompleteRewriteSystemMessage
            //     : llmAction.Cleanup
            //     ? PartialRewriteSystemMessage
            //     : KeywordAugmentRewriteSystemMessage
            let llmSystemMessage: string
            if (ui.promptFromLlm.llmSettings.llmAction.Cleanup) {
                llmSystemMessage = epicLLM_getSystemPrompt(epicLLMSystemPromptType.partial)
            } else if (ui.promptFromLlm.llmSettings.llmAction.Augment) {
                llmSystemMessage = epicLLM_getSystemPrompt(epicLLMSystemPromptType.keywordAugment)
            } else if (ui.promptFromLlm.llmSettings.llmAction.RandomName) {
                llmSystemMessage = epicLLM_getSystemPrompt(epicLLMSystemPromptType.randomNameGenerator)
            } else if (ui.promptFromLlm.llmSettings.llmAction.Complete) {
                llmSystemMessage = epicLLM_getSystemPrompt(epicLLMSystemPromptType.completeRewrite)
            } else {
                llmSystemMessage = epicLLM_getSystemPrompt(epicLLMSystemPromptType.randomNameGenerator)
            }
            // ask LLM to generate
            console.log('pre-call', llmSystemMessage)
            const llmResult = await run.LLM.expandPrompt(
                ui.promptFromLlm.promptForExpansion,
                ui.promptFromLlm.llmSettings.llmModel.id,
                llmSystemMessage,
            )

            expandedPrompt = ui.promptFromLlm.llmSettings.llmAction.Augment
                ? ui.promptFromLlm.promptForExpansion + ', ' + llmResult.prompt
                : llmResult.prompt
            console.log('[⚡⚡]expandedPrompt', expandedPrompt)

            // run.formInstance.fields.promptFromLlm.fields.llmResponse.text = expandedPrompt
            run.formInstance.fields.promptFromLlm.fields.llmResponse.markdown = expandedPrompt
        }
        if (ui.promptFromLlm.runLLM.RunSD) {
            const graph = run.nodes
            // MODEL, clip skip, vae, etc. ---------------------------------------------------------------
            let { ckpt, vae, clip } = run_model(ui.model)

            // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
            // const joinedPrompt = { text: ui.userPrefacePrompt.text + ', ' + expandedPrompt }
            const joinedPrompt = { text: ui.userPrefacePrompt.text + ', ' + expandedPrompt }
            const posPrompt = run_prompt({
                prompt: joinedPrompt,
                clip,
                ckpt,
                printWildcards: true,
            })
            let positiveString: string
            clip = posPrompt.clip
            if (ui.model.ckpt.includes('pony') || ui.model.ckpt.includes('sdxxxl')) {
                //only include pony if pony is selected as the model
                positiveString = run_selection(ui.ponyAdders.ponyui) + posPrompt.promptIncludingBreaks
            } else {
                positiveString = posPrompt.promptIncludingBreaks
            }
            console.log('[]!!#####!EPIC?' + positiveString)
            const posPromptNode = graph.CLIPTextEncode({ clip, text: positiveString })

            run.output_text({ title: 'positive', message: positiveString })
            const clipPos = posPrompt.clip
            let ckptPos = posPrompt.ckpt
            let positive: _CONDITIONING = posPromptNode._CONDITIONING
            // let negative = x.conditionningNeg
            //
            const negPrompt = run_prompt({ prompt: ui.negative, clip, ckpt })
            let negative: _CONDITIONING = graph.CLIPTextEncode({
                clip,
                text: negPrompt.promptIncludingBreaks,
            })

            // const y = run_prompt({ richPrompt: negPrompt, clip, ckpt, outputWildcardsPicked: true })
            // let negative = y.conditionning

            // START IMAGE -------------------------------------------------------------------------------
            const epicAspect = run_SDXL_aspectRatio(ui.aspect)

            let { latent, width, height } = await run_latent_vEpic({
                opts: ui.latent,
                vae,
                width_override: epicAspect.width,
                height_override: epicAspect.height,
            })
            //bit of a lazy hotwire to immediately override here, but wtf
            //
            // CNETS -------------------------------------------------------------------------------
            let cnet_out: Cnet_return | undefined
            if (ui.controlnets) {
                const Cnet_args: Cnet_args = { positive, negative, width, height, ckptPos }
                cnet_out = await run_cnet(ui.controlnets, Cnet_args)
                positive = cnet_out.cnet_positive
                negative = cnet_out.cnet_negative
                ckptPos = cnet_out.ckpt_return //only used for ipAdapter, otherwise it will just be a passthrough
            }

            // FIRST PASS --------------------------------------------------------------------------------
            const ctx_sampler: Ctx_sampler = {
                ckpt: ckptPos,
                clip: clipPos,
                vae,
                latent,
                positive: positive,
                negative: negative,
                preview: false,
            }
            let firstSampler = run_sampler(run, ui.sampler, ctx_sampler)
            latent = firstSampler.latent

            // SECOND PASS (a.k.a. highres fix) ---------------------------------------------------------
            const HRF = ui.highResFix
            if (HRF) {
                const ctx_sampler_fix: Ctx_sampler = {
                    ckpt: ckptPos,
                    clip: clipPos,
                    vae,
                    latent,
                    positive: cnet_out?.post_cnet_positive ?? positive,
                    negative: cnet_out?.post_cnet_negative ?? negative,
                    preview: false,
                }
                latent = run_highresfix(HRF, ctx_sampler_fix, width, height).latent
            }

            // UPSCALE with upscale model ------------------------------------------------------------
            // TODO

            // ---------------------------------------------------------------------------------------
            let finalImage: _IMAGE = graph.VAEDecode({ samples: latent, vae })

            // REFINE PASS AFTER ---------------------------------------------------------------------
            if (ui.refine) {
                finalImage = run_refiners_fromImage(ui.refine, finalImage)
                // latent = graph.VAEEncode({ pixels: image, vae })
            }

            // // REMOVE BACKGROUND ---------------------------------------------------------------------
            // if (ui.removeBG) {
            //     const sub = run_rembg_v1(ui.removeBG, finalImage)
            //     if (sub.length > 0) finalImage = graph.AlphaChanelRemove({ images: sub[0] })
            // }

            // // SHOW 3D --------------------------------------------------------------------------------
            // const show3d = ui.show3d
            // if (show3d) {
            //     run.add_previewImage(finalImage).storeAs('base')
            //     const depth = (() => {
            //         if (show3d.depth.MiDaS) return graph.MiDaS$7DepthMapPreprocessor({ image: finalImage })
            //         if (show3d.depth.Zoe) return graph.Zoe$7DepthMapPreprocessor({ image: finalImage })
            //         if (show3d.depth.LeReS) return graph.LeReS$7DepthMapPreprocessor({ image: finalImage })
            //         if (show3d.depth.Marigold) return graph.MarigoldDepthEstimation({ image: finalImage })
            //         throw new Error('❌ show3d activated, but no depth option choosen')
            //     })()
            //     run.add_previewImage(depth).storeAs('depth')

            //     const normal = (() => {
            //         if (show3d.normal.id === 'MiDaS') return graph.MiDaS$7NormalMapPreprocessor({ image: finalImage })
            //         if (show3d.normal.id === 'BAE') return graph.BAE$7NormalMapPreprocessor({ image: finalImage })
            //         if (show3d.normal.id === 'None') return graph.EmptyImage({ color: 0x7f7fff, height: 512, width: 512 })
            //         return exhaust(show3d.normal)
            //     })()
            //     run.add_previewImage(normal).storeAs('normal')
            // } else {
            //     // DECODE --------------------------------------------------------------------------------
            graph.SaveImage({ images: finalImage })
            // }

            // if (ui.upscale) {
            //     finalImage = run_upscaleWithModel(ui.upscale, { image: finalImage })
            // }

            const saveFormat = run_customSave(ui.customSave)
            await run.PROMPT({ saveFormat })

            // if (ui.testStuff?.gaussianSplat) run.output_GaussianSplat({ url: '' })
            // if (ui.testStuff?.summary) output_demo_summary(run)
            // if (show3d) run.output_3dImage({ image: 'base', depth: 'depth', normal: 'normal' })
            //
            // if (ui.testStuff?.makeAVideo) await run.Videos.output_video_ffmpegGeneratedImagesTogether(undefined, 2)
        }
    },
})
