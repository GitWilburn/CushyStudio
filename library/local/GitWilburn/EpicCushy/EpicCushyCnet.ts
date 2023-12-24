import { exhaust } from 'src/utils/misc/ComfyUtils'
import { run_latent, ui_latent } from 'library/built-in/_prefabs/prefab_latent'
import { run_model, ui_model } from 'library/built-in/_prefabs/prefab_model'
import { run_prompt } from 'library/built-in/_prefabs/prefab_prompt'
import { ui_recursive } from 'library/built-in/_prefabs/prefab_recursive'
import { Ctx_sampler, run_sampler, ui_sampler } from 'library/built-in/_prefabs/prefab_sampler'
import { ui_highresfix } from 'library/built-in/_prefabs/_prefabs'
import { output_demo_summary } from 'library/built-in/_prefabs/prefab_markdown'
import { ui_cnet, run_cnet } from 'library/local/GitWilburn/EpicCushy/_prefabs/prefab_cnet'
import { Cnet_args } from './_prefabs/prefab_cnet';
import { dz_faceDetailer_args, run_dz_face_detailer, ui_dz_face_detailer } from './_prefabs/prefab_faceDetailer'
import { HasSingle_LATENT } from '../../../../schema/global';


app({
    metadata: {
        name: 'Cushy Diffusion UI',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'A card that contains all the features needed to play with stable diffusion - but EPIC',
    },
    ui: (form) => ({
        positive: form.prompt({
            default: {
                tokens: [
                    { type: 'text', text: 'cyberpunk, masterpiece, concept art, artgerm' },
                ],
            },
        }),
        negative: form.prompt({
            startCollapsed: true,
            default: 'bad hands, deformed, nude, nsfw',
        }),
        model: ui_model(form),
        latent: ui_latent(form),
        sampler: ui_sampler(form),
        highResFix: ui_highresfix(form, { activeByDefault: true }),
        controlnets: ui_cnet(form),
        faceDetailer: ui_dz_face_detailer(form),
        recursiveImgToImg: ui_recursive(form),
        loop: form.groupOpt({
            items: () => ({
                batchCount: form.int({ default: 1 }),
                delayBetween: form.int({ tooltip: 'in ms', default: 0 }),
            }),
        }),
        // startImage
        removeBG: form.bool({ default: false }),
        reversePositiveAndNegative: form.bool({ default: false }),
        makeAVideo: form.bool({ default: false }),
        summary: form.bool({ default: false }),
        gaussianSplat: form.bool({ default: false }),
        show3d: form.groupOpt({
            items: () => {
                return {
                    normal: form.selectOne({
                        default: { id: 'MiDaS' },
                        choices: [{ id: 'MiDaS' }, { id: 'BAE' }],
                    }),
                    depth: form.selectOne({
                        default: { id: 'Zoe' },
                        choices: [{ id: 'MiDaS' }, { id: 'Zoe' }, { id: 'LeReS' }],
                    }),
                }
            },
        }),
    }),

    run: async (run, ui) => {
        const graph = run.nodes
        // MODEL, clip skip, vae, etc. ---------------------------------------------------------------
        let { ckpt, vae, clip } = run_model(run, ui.model)

        const posPrompt = ui.reversePositiveAndNegative ? ui.negative : ui.positive
        const negPrompt = ui.reversePositiveAndNegative ? ui.positive : ui.negative

        // RICH PROMPT ENGINE -------- ---------------------------------------------------------------
        const x = run_prompt(run, { richPrompt: posPrompt, clip, ckpt, outputWildcardsPicked: true })
        const clipPos = x.clip
        let ckptPos = x.ckpt
        let positive = x.conditionning

        const y = run_prompt(run, { richPrompt: negPrompt, clip, ckpt, outputWildcardsPicked: true })
        let negative = y.conditionning

        // START IMAGE -------------------------------------------------------------------------------

        let { latent, width, height } = await run_latent({ run: run, opts: ui.latent, vae })

        // CNETS -------------------------------------------------------------------------------
        const pre_cnet_positive = positive
        const pre_cnet_negative = negative
        if (ui.controlnets) {
            const Cnet_args: Cnet_args = {
                positive,
                negative,
                width,
                height,
                ckptPos,
            }
            var cnet_out = await run_cnet(run, ui.controlnets, Cnet_args)
            positive = cnet_out.positive
            negative = cnet_out.negative
            ckptPos = cnet_out.ckpt_return //only used for ipAdapter, otherwise it will just be a passthrough
        }

        // FIRST PASS --------------------------------------------------------------------------------
        let ctx_sampler: Ctx_sampler = {
            ckpt: ckptPos,
            clip: clipPos,
            vae,
            latent,
            positive: positive,
            negative: negative,
            preview: false,
        }
        latent = run_sampler(run, ui.sampler, ctx_sampler).latent

        if (ui.controlnets && !ui.controlnets.useControlnetConditioningForUpscalePassIfEnabled) {
            //it can sometimes be useful to only use the controlnets on the first pass. They can yield strange results when upscaling
            ctx_sampler.positive = pre_cnet_positive,
                ctx_sampler.negative = pre_cnet_negative
        }

        // RECURSIVE PASS ----------------------------------------------------------------------------
        if (ui.recursiveImgToImg) {

            for (let i = 0; i < ui.recursiveImgToImg.loops; i++) {
                latent = run_sampler(
                    run,
                    {
                        seed: ui.sampler.seed + i,
                        cfg: ui.recursiveImgToImg.cfg,
                        steps: ui.recursiveImgToImg.steps,
                        denoise: ui.recursiveImgToImg.denoise,
                        sampler_name: ui.sampler.sampler_name,
                        scheduler: ui.sampler.scheduler,
                    },
                    { ...ctx_sampler, latent, preview: true },
                ).latent
            }
        }

        // SECOND PASS (a.k.a. highres fix) ---------------------------------------------------------
        if (ui.highResFix) {
            if (ui.highResFix.saveIntermediaryImage) {
                graph.SaveImage({ images: graph.VAEDecode({ samples: latent, vae }) })
            }
            latent = graph.LatentUpscale({
                samples: latent,
                crop: 'disabled',
                upscale_method: 'nearest-exact',
                height: ui.latent.size.height * ui.highResFix.scaleFactor,
                width: ui.latent.size.width * ui.highResFix.scaleFactor,
            })
            latent = latent = run_sampler(
                run,
                {
                    seed: ui.highResFix.samplerSelect ? ui.highResFix.samplerSelect.sampler.seed : ui.sampler.seed,
                    cfg: ui.highResFix.samplerSelect ? ui.highResFix.samplerSelect.sampler.cfg : ui.sampler.cfg,
                    steps: ui.highResFix.samplerSelect ? ui.highResFix.samplerSelect.sampler.steps : ui.sampler.steps,
                    denoise: ui.highResFix.samplerSelect ? ui.highResFix.samplerSelect.sampler.denoise : ui.highResFix.denoise,
                    sampler_name: ui.highResFix.samplerSelect ? ui.highResFix.samplerSelect.sampler.sampler_name : ui.sampler.sampler_name,
                    scheduler: ui.highResFix.samplerSelect ? ui.highResFix.samplerSelect.sampler.scheduler : ui.sampler.scheduler,
                },
                { ...ctx_sampler, latent, preview: false },
            ).latent
        }

        // DZ Face Detailer ------------------------------------------------------------------
        //if (ui.faceDetailer) {
        let fd_sampler: Ctx_sampler = {
            ckpt: ckptPos,
            clip: clipPos,
            vae,
            latent,
            positive: positive,
            negative: negative,
            preview: false,
        }
        let fd_args: dz_faceDetailer_args = {
            base_sampler: fd_sampler,
            base_sampler_opts: ui.sampler //send in the base sampler
        }
        const dz = await run_dz_face_detailer(run, ui.faceDetailer, fd_args)
        latent = dz.return_latent//set to new latent if it exists
        const dz_mask = dz.return_mask
        //}


        let finalImage: HasSingle_IMAGE = graph.VAEDecode({ samples: latent, vae })

        // REMOVE BACKGROUND ---------------------------------------------------------------------
        if (ui.removeBG) {
            finalImage = graph.Image_Rembg_$1Remove_Background$2({
                images: run.AUTO,
                model: 'u2net',
                background_color: 'none',
            })
            graph.SaveImage({ images: finalImage })
        }

        // SHOW 3D --------------------------------------------------------------------------------
        const show3d = ui.show3d
        if (show3d) {
            run.add_saveImage(finalImage, 'base')

            const depth = (() => {
                if (show3d.depth.id === 'MiDaS') return graph.MiDaS$7DepthMapPreprocessor({ image: finalImage })
                if (show3d.depth.id === 'Zoe') return graph.Zoe$7DepthMapPreprocessor({ image: finalImage })
                if (show3d.depth.id === 'LeReS') return graph.LeReS$7DepthMapPreprocessor({ image: finalImage })
                return exhaust(show3d.depth)
            })()
            run.add_saveImage(depth, 'depth')

            const normal = (() => {
                if (show3d.normal.id === 'MiDaS') return graph.MiDaS$7NormalMapPreprocessor({ image: finalImage })
                if (show3d.normal.id === 'BAE') return graph.BAE$7NormalMapPreprocessor({ image: finalImage })
                return exhaust(show3d.normal)
            })()
            run.add_saveImage(normal, 'normal')
        } else {
            // DECODE --------------------------------------------------------------------------------
            graph.SaveImage({ images: finalImage })
        }

        await run.PROMPT()

        if (ui.gaussianSplat) run.output_GaussianSplat({ url: '' })
        if (ui.summary) output_demo_summary(run)
        if (show3d) run.output_3dImage({ image: 'base', depth: 'depth', normal: 'normal' })

        // LOOP IF NEED BE -----------------------------------------------------------------------
        const loop = ui.loop
        if (loop) {
            const ixes = new Array(ui.loop.batchCount).fill(0).map((_, i) => i)
            for (const i of ixes) {
                await new Promise((r) => setTimeout(r, loop.delayBetween))
                await run.PROMPT()
            }
        }

        if (ui.makeAVideo) await run.Videos.output_video_ffmpegGeneratedImagesTogether(undefined, 2)
    },
})