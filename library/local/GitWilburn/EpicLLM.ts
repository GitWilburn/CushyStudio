import type { OutputFor } from '../../built-in/_prefabs/_prefabs'

import { Cnet_args, type Cnet_return, run_cnet, ui_cnet } from '../../built-in/_controlNet/prefab_cnet'
import { run_IPAdapterV2, ui_IPAdapterV2 } from '../../built-in/_ipAdapter/prefab_ipAdapter_baseV2'
import { run_FaceIDV2, ui_IPAdapterFaceIDV2 } from '../../built-in/_ipAdapter/prefab_ipAdapter_faceV2'
import { run_refiners_fromImage, ui_refiners } from '../../built-in/_prefabs/prefab_detailer'
import { ui_latent_v3 } from '../../built-in/_prefabs/prefab_latent_v3'
import { ui_mask } from '../../built-in/_prefabs/prefab_mask'
import { run_model, run_model_modifiers, ui_model } from '../../built-in/_prefabs/prefab_model'
import { run_prompt } from '../../built-in/_prefabs/prefab_prompt'
import { run_rembg_v1, ui_rembg_v1 } from '../../built-in/_prefabs/prefab_rembg'
import { type Ctx_sampler, run_sampler } from '../../built-in/_prefabs/prefab_sampler'
import { run_customSave, ui_customSave } from '../../built-in/_prefabs/saveSmall'
import { epicLLM_getSystemPrompt, epicLLMSystemPromptType } from './_prefabs/_llm_systemPrompts'
// import { epicLLM_getSystemPrompt, epicLLMSystemPromptType } from './_prefabs/_llm_systemPrompts'
import {
    run_highresfix,
    run_latent_vEpic,
    run_SDXL_aspectRatio,
    ui_epic_llm,
    ui_highresfix,
    ui_sampler,
    ui_SDXL_aspectRatio,
} from './_prefabs/_prefabs'
import { run_autoBrightness, ui_autoBrightness } from './_prefabs/post_processing'
import { run_selection, ui_selection } from './_prefabs/prefab_PonyDiffusion'
import { run_promptList, ui_promptList } from './_prefabs/prompt_list'
import { view_basicDraftParameters } from './_prefabs/view_basicParameters'

app({
    metadata: {
        name: 'EPIC Diffusion',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'EPIC diffusion with LLM expansion.',
    },
    ui: (form) => ({
        promptList: ui_promptList(),
        promptFromLlm: ui_epic_llm(),
        userPrefacePrompt: form.prompt({
            default: ['highly detailed, masterpiece, best quality,'].join('\n'),
        }),
        facePrompt: form
            .prompt({
                default: 'face',
                tooltip:
                    'include the string face_prompt where you want it included in the prompt, otherwise it will append at the end',
            })
            .optional(),
        eyePrompt: form
            .prompt({
                default: 'eyes',
                tooltip:
                    'include the string eye_prompt where you want it included in the prompt, otherwise it will append at the end',
            })
            .optional(),

        stylePrompt: form
            .prompt({
                default: 'realistic, photorealistic, concept art',
                tooltip:
                    'include the string style_prompt where you want it included in the prompt, otherwise it will append at the end',
            })
            .optional(),

        ponyAdders: ui_selection(),

        // askLLM: form.button({ onClick: (form) => void askLLM(form) }),
        negative: form.prompt({
            startCollapsed: true,
            default: 'bad quality, blurry, low resolution, pixelated, noisy',
        }),
        model: ui_model(),
        textEncoderType: form.choice({
            appearance: 'tab',
            items: {
                CLIP: form.group({}),
                SDXL: form.group({}),
            },
        }),
        mask: ui_mask(),
        latent: ui_latent_v3(),
        aspect: ui_SDXL_aspectRatio(),
        sampler: ui_sampler().optional(),
        highResFix: ui_highresfix(),
        refine: ui_refiners(),
        //upscale: ui_upscaleWithModel(),
        customSave: ui_customSave(),
        removeBG: ui_rembg_v1(),

        controlnets: ui_cnet(),
        ipAdapter: ui_IPAdapterV2().optional(),
        faceID: ui_IPAdapterFaceIDV2().optional(),
        autoBrightness: ui_autoBrightness().optional(),
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
            const ponyAdders = run_selection(ui.ponyAdders)
            // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
            // const joinedPrompt = { text: ui.userPrefacePrompt.text + ', ' + expandedPrompt }
            let faceString: Maybe<string>
            let eyeString: Maybe<string>
            let styleString: Maybe<string>
            if (ui.facePrompt) {
                faceString = run_prompt({ prompt: ui.facePrompt, printWildcards: true }).promptIncludingBreaks
            }
            if (ui.eyePrompt) {
                eyeString = run_prompt({ prompt: ui.eyePrompt, printWildcards: true }).promptIncludingBreaks
            }
            if (ui.stylePrompt) {
                styleString = run_prompt({ prompt: ui.stylePrompt, printWildcards: true }).promptIncludingBreaks
            }
            const joinedPrompt = { text: ui.userPrefacePrompt.text + ', ' + expandedPrompt }
            const posPrompt = run_prompt({
                prompt: joinedPrompt,
                clip,
                ckpt,
                printWildcards: true,
            })
            let positiveString: string
            clip = posPrompt.clip
            const addPonyTags =
                ui.model.ckpt_name.includes('pony') ||
                ui.model.ckpt_name.includes('sdxxxl') ||
                ui.model.ckpt_name.includes('PDXL') ||
                ui.model.ckpt_name.includes('PNY')
            if (addPonyTags) {
                //only include pony if pony is selected as the model
                positiveString = ponyAdders + posPrompt.promptIncludingBreaks
            } else {
                positiveString = posPrompt.promptIncludingBreaks
            }
            // embed face prompt and eye prompt if enabled -------- ---------------------------------------------------------------
            if (ui.facePrompt) {
                const replacedFace = positiveString.replace('face_prompt', faceString ?? 'face')
                if (replacedFace) {
                    positiveString = replacedFace
                } else {
                    positiveString += faceString
                }
                if (addPonyTags) {
                    faceString = ponyAdders + faceString
                }
                if (ui.stylePrompt && faceString) {
                    const replacedStyle = faceString.includes('style_prompt')
                        ? faceString.replace('style_prompt', styleString ?? 'realistic, photorealistic, concept art')
                        : faceString + (styleString ?? 'realistic, photorealistic, concept art')

                    faceString = replacedStyle
                }
            }
            if (ui.eyePrompt) {
                const replacedEye = positiveString.replace('eye_prompt', eyeString ?? 'eyes')
                if (replacedEye) {
                    positiveString = replacedEye
                } else {
                    positiveString += eyeString
                }
                if (addPonyTags) {
                    eyeString = ponyAdders + eyeString
                }
                if (ui.stylePrompt && eyeString) {
                    const replacedStyle = eyeString.includes('style_prompt')
                        ? eyeString.replace('style_prompt', styleString ?? 'realistic, photorealistic, concept art')
                        : eyeString + (styleString ?? 'realistic, photorealistic, concept art')

                    eyeString = replacedStyle
                }
            }
            if (ui.stylePrompt) {
                const replacedStyle = positiveString.includes('style_prompt')
                    ? positiveString.replace('style_prompt', styleString ?? 'realistic, photorealistic, concept art')
                    : positiveString + (styleString ?? 'realistic, photorealistic, concept art')

                positiveString = replacedStyle
            }

            // console.log('[]!!#####!EPIC?' + positiveString)
            // START IMAGE -------------------------------------------------------------------------------
            const epicAspect = run_SDXL_aspectRatio(
                ui.aspect,
                ui.latent.emptyLatent?.size.width,
                ui.latent.emptyLatent?.size.height,
            )

            let { latent, width, height, blankLatent } = await run_latent_vEpic({
                opts: ui.latent,
                vae,
                width_override: epicAspect.width,
                height_override: epicAspect.height,
            })

            const posPromptNode = ui.textEncoderType.SDXL
                ? graph.CLIPTextEncodeSDXL({
                      clip,
                      text_g: positiveString,
                      text_l: positiveString,
                      width,
                      height,
                      target_height: height,
                      target_width: width,
                  })
                : graph.CLIPTextEncode({
                      clip,
                      text: positiveString,
                  })

            run.output_text({ title: 'positive', message: positiveString })
            const clipPos = posPrompt.clip
            let ckptPos = posPrompt.ckpt
            let positive: _CONDITIONING = posPromptNode._CONDITIONING
            // let negative = x.conditionningNeg
            //
            const negPrompt = run_prompt({ prompt: ui.negative, clip, ckpt })
            const negPromptNode = ui.textEncoderType.SDXL
                ? graph.CLIPTextEncodeSDXL({
                      clip,
                      text_g: negPrompt.promptIncludingBreaks,
                      text_l: negPrompt.promptIncludingBreaks,
                      width,
                      height,
                      target_height: height,
                      target_width: width,
                  })
                : graph.CLIPTextEncode({
                      clip,
                      text: positiveString,
                  })
            let negative: _CONDITIONING = negPromptNode

            const promptList = await run_promptList({
                opts: ui.promptList,
                conditioning: positive,
                encoderTypeSDXL: ui.textEncoderType.SDXL ? true : false,
                width,
                height,
                promptPreface: ponyAdders,
                ckpt: ckptPos,
            })
            positive = promptList.conditioning
            ckptPos = promptList.ckpt //this may be nothing if not masked, but may contain an updated model

            // const y = run_prompt({ richPrompt: negPrompt, clip, ckpt, outputWildcardsPicked: true })
            // let negative = y.conditionning

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
            let ip_adapter: _IPADAPTER | undefined
            if (ui.ipAdapter) {
                const ipAdapter_out = await run_IPAdapterV2(ui.ipAdapter, ckptPos, ip_adapter)
                ckptPos = ipAdapter_out.ip_adapted_model
                ip_adapter = ipAdapter_out.ip_adapter
            }
            if (ui.faceID) {
                const faceID_out = await run_FaceIDV2(ui.faceID, ckptPos, ip_adapter)
                ckptPos = faceID_out.ip_adapted_model
                ip_adapter = faceID_out.ip_adapter
            }

            let mask: Maybe<_MASK>
            let inpaint_adapted_model: Maybe<_MODEL>
            if (ui.mask.mask) {
                mask = await ui.mask.mask.image.loadInWorkflowAsMask(ui.mask.mask.mode)
                if (ui.mask.mask.invert) mask = graph.InvertMask({ mask: mask })
                if (ui.mask.mask.blur > 0) mask = graph.MaskBlur$6({ amount: ui.mask.mask.blur, mask })
                latent = graph.SetLatentNoiseMask({ mask: mask, samples: latent })
                if (ui.mask.mask.fooocus) {
                    inpaint_adapted_model = graph.INPAINT$_ApplyFooocusInpaint({
                        model: run.AUTO,
                        patch: graph.INPAINT$_LoadFooocusInpaint({
                            head: ui.mask.mask.fooocus.head,
                            patch: ui.mask.mask.fooocus.patch,
                        }),
                        latent,
                    })._MODEL
                }
            }

            // FIRST PASS --------------------------------------------------------------------------------
            const ctx_sampler: Ctx_sampler = {
                ckpt: run_model_modifiers(ui.model, inpaint_adapted_model ?? ckptPos, false),
                clip: clipPos,
                vae,
                latent,
                positive: positive,
                negative: negative,
                preview: false,
            }
            if (ui.sampler) {
                let firstSampler = run_sampler(run, ui.sampler, ctx_sampler, blankLatent)
                latent = firstSampler.latent
            }

            // SECOND PASS (a.k.a. highres fix) ---------------------------------------------------------
            const HRF = ui.highResFix
            if (HRF) {
                const ctx_sampler_fix: Ctx_sampler = {
                    ckpt: run_model_modifiers(ui.model, ckptPos, true),
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
                finalImage = run_refiners_fromImage(
                    ui.refine,
                    finalImage,
                    run_model_modifiers(ui.model, ckptPos, false),
                    1024,
                    faceString ?? 'face,' + styleString ?? 'realistic,',
                    eyeString ?? 'eyes,' + styleString ?? 'realistic,',
                )
                // latent = graph.VAEEncode({ pixels: image, vae })
            }

            // REMOVE BACKGROUND ---------------------------------------------------------------------
            if (ui.removeBG) {
                const sub = run_rembg_v1(ui.removeBG, finalImage)
                if (sub.length > 0 && sub[0]) finalImage = graph.AlphaChanelRemove({ images: sub[0] })
            }
            if (ui.autoBrightness) {
                finalImage = run_autoBrightness({ image: finalImage, ui: ui.autoBrightness })
            }

            graph.SaveImage({ images: finalImage })
            // }

            // if (ui.upscale) {
            //     finalImage = run_upscaleWithModel(ui.upscale, { image: finalImage })
            // }
            run.output_custom({
                view: view_basicDraftParameters,
                params: {
                    positivePrompt: JSON.stringify(ui.userPrefacePrompt.serial.val),
                    negativePrompt: JSON.stringify(ui.negative.serial.val),
                    denoise: ui.sampler?.denoise,
                    ksampler: ui.sampler?.sampler_name,
                    scheduler: ui.sampler?.scheduler,
                    seed: ui.sampler?.seed,
                    uiState: JSON.stringify(ui),
                },
            })
            const saveFormat = run_customSave(ui.customSave)
            await run.PROMPT({ saveFormat })
        }
    },
})
