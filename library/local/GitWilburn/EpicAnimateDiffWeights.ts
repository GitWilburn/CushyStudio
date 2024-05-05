import { run_latent_v3, ui_latent_v3 } from '../../built-in/_prefabs/prefab_latent_v3'
import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { run_prompt } from '../../built-in/_prefabs/prefab_prompt'
import { type Ctx_sampler, run_sampler, ui_sampler } from '../../built-in/_prefabs/prefab_sampler'
import { ui_vhsExport } from './_prefabs/vhs_export'

app({
    metadata: {
        name: 'EPIC AnimateDiff IPAdapter Weights',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'EPIC AnimateDiff With IPAdapter Weights',
    },
    ui: (form) => ({
        model: ui_model(),
        // latent: ui_latent_v3(),
        images: form.list({ element: form.image({}) }),
        positivePrompt: form.promptV2({}),
        negativePrompt: form.promptV2({}),
        AnimateDiffSettings: form.fields({
            model_name: form.enum.Enum_ADE$_AnimateDiffLoaderGen1_model_name({ default: 'v3_sd15_mm.ckpt' }),
            lcm_lora: form.enum.Enum_LoraLoader_lora_name({ default: 'animateDiff\\lcm-lora-sdv1-5.safetensors' }),
            context_overlap: form.int({ default: 4, min: 0, softMax: 16, max: 128 }),
            AdvancedSettings: form.fields(
                {
                    lcm_lora_strength: form.float({ default: 1, min: -1, max: 1, step: 0.01 }),
                    context_length: form.int({ default: 16, min: 1, max: 128 }),
                    beta_schedule: form.enum.Enum_CheckpointLoaderSimpleWithNoiseSelect_beta_schedule({
                        default: 'lcm avg(sqrt_linear,linear)',
                    }),
                    fuse_method: form.enum.Enum_ADE$_StandardStaticContextOptions_fuse_method({ default: 'pyramid' }),
                    use_on_equal_length: form.boolean({ default: false }),
                    start_percent: form.float({ default: 0, min: 0, max: 1, step: 0.001 }),
                    guarantee_steps: form.int({ default: 1, min: 0, max: 9007199254740991 }),
                },
                { startCollapsed: true },
            ),
        }),
        IPAdapterSettings: form.fields(
            {
                preset: form.enum.Enum_IPAdapterUnifiedLoader_preset({ default: 'PLUS (high strength)' }),
                weight: form.float({ default: 1, min: -1, max: 5, step: 0.05 }),
                framesPerImage: form.int({ default: 6, min: 0, softMax: 32, max: 9999, step: 1 }),
                add_ending_frames: form.int({ default: 8, min: 0, softMax: 16, max: 9999, step: 1 }),
                add_starting_frames: form.int({ default: 8, min: 0, softMax: 16, max: 9999, step: 1 }),
                AdvancedSettings: form.fields(
                    {
                        weights: form.string({ default: '1.0, 0.0' }),
                        weight_type: form.enum.Enum_IPAdapterAdvanced_weight_type({ default: 'linear' }),
                        start_at: form.float({ default: 0, min: 0, max: 1, step: 0.001 }),
                        end_at: form.float({ default: 1, min: 0, max: 1, step: 0.001 }),
                        embeds_scaling: form.enum.Enum_IPAdapterAdvanced_embeds_scaling({ default: 'V only' }),
                        encode_batch_size: form.int({ default: 0, min: 0, max: 4096 }),
                        start_frame: form.int({ default: 0, min: 0, softMax: 16, max: 9999, step: 1 }),
                        end_frame: form.int({ default: 9999, min: 0, softMax: 16, max: 9999, step: 1 }),
                        timing: form.enum.Enum_IPAdapterWeights_timing({ default: 'linear' }),
                        method_2: form.enum.Enum_IPAdapterWeights_method({ default: 'alternate batches' }),
                        negativeImageNoiseAdditionType: form.enum.Enum_IPAdapterNoise_type({ default: 'gaussian' }),
                        negativeImageNoiseAdditionStrength: form.float({ default: 0.55, min: 0, max: 1, step: 0.05 }),
                        negativeImageNoiseAdditionBlur: form.int({ default: 0, min: 0, max: 32, step: 1 }),
                    },
                    { startCollapsed: true },
                ),
            },
            { startCollapsed: true },
        ),
        sampler: ui_sampler({ steps: 8, cfg: 2, sampler_name: 'lcm', scheduler: 'sgm_uniform', startCollapsed: true }),

        SecondPass: form.fields(
            {
                sampler: ui_sampler({
                    steps: 10,
                    cfg: 2,
                    sampler_name: 'lcm',
                    scheduler: 'sgm_uniform',
                    denoise: 0.8,
                    startCollapsed: true,
                }),
                control_net_name: form.enum.Enum_ControlNetLoader_control_net_name({
                    default: 'animate_controlnet_checkpoint.ckpt',
                }),
                strength: form.float({ default: 0.6, min: 0, softMax: 2, max: 10, step: 0.01 }),
                start_percent: form.float({ default: 0, min: 0, max: 1, step: 0.001 }),
                end_percent: form.float({ default: 0.6, min: 0, max: 1, step: 0.001 }),
                IPAdapter: form.fields(
                    {
                        weight: form.float({ default: 0.35, min: -1, max: 5, step: 0.05 }),
                        weight_type: form.enum.Enum_IPAdapterAdvanced_weight_type({ default: 'linear' }),
                        start_at: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
                        end_at: form.float({ default: 1, min: 0, max: 1, step: 0.1 }),
                        embeds_scaling: form.enum.Enum_IPAdapterAdvanced_embeds_scaling({ default: 'V only' }),
                        encode_batch_size: form.int({ default: 0, min: 0, max: 4096 }),
                    },
                    { startCollapsed: true },
                ),
            },
            { startCollapsed: true },
        ),
        videoCombineOptions: ui_vhsExport(),
    }),

    run: async (run, ui) => {
        const graph = run.nodes
        let { ckpt, vae, clip } = run_model(ui.model)
        const posPrompt = run_prompt({
            prompt: ui.positivePrompt,
            clip,
            ckpt,
            printWildcards: true,
        })
        const negPrompt = run_prompt({
            prompt: ui.negativePrompt,
            clip,
            ckpt,
            printWildcards: true,
        })
        const positiveConditioning = posPrompt.conditioning
        const negativeConditioning = negPrompt.conditioning
        const lcmLora = graph.LoraLoaderModelOnly({
            lora_name: ui.AnimateDiffSettings.lcm_lora,
            strength_model: ui.AnimateDiffSettings.AdvancedSettings.lcm_lora_strength,
            model: ckpt,
        })
        const modelSamplingDiscrete = graph.ModelSamplingDiscrete({ sampling: 'lcm', zsnr: false, model: lcmLora._MODEL })
        const aDE$_LoadAnimateDiffModel = graph.ADE$_LoadAnimateDiffModel({ model_name: ui.AnimateDiffSettings.model_name })
        const aDE$_ApplyAnimateDiffModelSimple = graph.ADE$_ApplyAnimateDiffModelSimple({
            motion_model: aDE$_LoadAnimateDiffModel,
        })
        const aDE$_StandardStaticContextOptions = graph.ADE$_StandardStaticContextOptions({
            context_length: ui.AnimateDiffSettings.AdvancedSettings.context_length,
            context_overlap: ui.AnimateDiffSettings.context_overlap,
            fuse_method: ui.AnimateDiffSettings.AdvancedSettings.fuse_method,
            use_on_equal_length: ui.AnimateDiffSettings.AdvancedSettings.use_on_equal_length,
            start_percent: ui.AnimateDiffSettings.AdvancedSettings.start_percent,
            guarantee_steps: ui.AnimateDiffSettings.AdvancedSettings.guarantee_steps,
        })
        const aDE$_UseEvolvedSampling = graph.ADE$_UseEvolvedSampling({
            beta_schedule: ui.AnimateDiffSettings.AdvancedSettings.beta_schedule,
            model: modelSamplingDiscrete,
            m_models: aDE$_ApplyAnimateDiffModelSimple,
            context_options: aDE$_StandardStaticContextOptions,
        })
        let images: _IMAGE | undefined
        let width = 512
        let height = 512
        for (const img of ui.images) {
            const _img = graph.LoadImage({ image: await run.loadImageAnswerAsEnum(img) })
            if (images) {
                images = graph.ImageBatch({ image1: images, image2: _img._IMAGE })
            } else {
                images = _img._IMAGE
                width = img.width
                height = img.height
            }
        }

        const iPAdapterWeights = graph.IPAdapterWeights({
            weights: ui.IPAdapterSettings.AdvancedSettings.weights,
            timing: ui.IPAdapterSettings.AdvancedSettings.timing,
            frames: ui.IPAdapterSettings.framesPerImage,
            start_frame: ui.IPAdapterSettings.AdvancedSettings.start_frame,
            end_frame: ui.IPAdapterSettings.AdvancedSettings.end_frame,
            add_starting_frames: ui.IPAdapterSettings.add_starting_frames,
            add_ending_frames: ui.IPAdapterSettings.add_ending_frames,
            method: ui.IPAdapterSettings.AdvancedSettings.method_2,
            image: images,
        })
        let latent: _LATENT = graph.EmptyLatentImage({ batch_size: iPAdapterWeights._INT, height, width })._LATENT
        const iPAdapterUnified = graph.IPAdapterUnifiedLoader({
            preset: ui.IPAdapterSettings.preset,
            model: aDE$_UseEvolvedSampling,
        })
        const iPAdapterNoise = graph.IPAdapterNoise({
            type: ui.IPAdapterSettings.AdvancedSettings.negativeImageNoiseAdditionType,
            strength: ui.IPAdapterSettings.AdvancedSettings.negativeImageNoiseAdditionStrength,
            blur: ui.IPAdapterSettings.AdvancedSettings.negativeImageNoiseAdditionBlur,
        })
        const controlNetLoaderAdvanced = graph.ControlNetLoaderAdvanced({ control_net_name: ui.SecondPass.control_net_name })
        const iPAdapterBatch = graph.IPAdapterBatch({
            weight: ui.IPAdapterSettings.weight,
            weight_type: ui.IPAdapterSettings.AdvancedSettings.weight_type,
            start_at: ui.IPAdapterSettings.AdvancedSettings.start_at,
            end_at: ui.IPAdapterSettings.AdvancedSettings.end_at,
            embeds_scaling: ui.IPAdapterSettings.AdvancedSettings.embeds_scaling,
            encode_batch_size: ui.IPAdapterSettings.AdvancedSettings.encode_batch_size,
            model: iPAdapterUnified,
            ipadapter: iPAdapterUnified,
            image: iPAdapterWeights.outputs.image_1,
            image_negative: iPAdapterNoise,
        })
        const iPAdapterBatchInvert = graph.IPAdapterBatch({
            weight: ui.IPAdapterSettings.weight,
            weight_type: ui.IPAdapterSettings.AdvancedSettings.weight_type,
            start_at: ui.IPAdapterSettings.AdvancedSettings.start_at,
            end_at: ui.IPAdapterSettings.AdvancedSettings.end_at,
            embeds_scaling: ui.IPAdapterSettings.AdvancedSettings.embeds_scaling,
            encode_batch_size: ui.IPAdapterSettings.AdvancedSettings.encode_batch_size,
            model: iPAdapterBatch,
            ipadapter: iPAdapterUnified,
            image: iPAdapterWeights.outputs.image_2,
            image_negative: iPAdapterNoise,
        })
        const ctx_sampler: Ctx_sampler = {
            ckpt: iPAdapterBatchInvert._MODEL,
            clip: run.AUTO,
            vae,
            latent: latent,
            positive: positiveConditioning,
            negative: negativeConditioning,
            preview: false,
        }
        let firstSampler = run_sampler(run, ui.sampler, ctx_sampler)
        latent = firstSampler.latent

        const decodedImages = graph.VAEDecode({ samples: latent, vae })
        //const imagePreview = graph.PreviewImage({ images: decodedImages })
        const AdvancedControlNetApply = graph.ACN$_AdvancedControlNetApply({
            strength: ui.SecondPass.strength,
            start_percent: ui.SecondPass.start_percent,
            end_percent: ui.SecondPass.end_percent,
            positive: posPrompt.conditioning,
            negative: negPrompt.conditioning,
            control_net: controlNetLoaderAdvanced,
            image: decodedImages,
        })
        const secondPassIPAdapter = graph.IPAdapterBatch({
            weight: ui.SecondPass.IPAdapter.weight,
            weight_type: ui.SecondPass.IPAdapter.weight_type,
            start_at: ui.SecondPass.IPAdapter.start_at,
            end_at: ui.SecondPass.IPAdapter.end_at,
            embeds_scaling: ui.SecondPass.IPAdapter.embeds_scaling,
            encode_batch_size: ui.SecondPass.IPAdapter.encode_batch_size,
            model: iPAdapterUnified,
            ipadapter: iPAdapterUnified,
            image: iPAdapterWeights.outputs.image_1,
            image_negative: iPAdapterNoise,
        })
        const second_ctx_sampler: Ctx_sampler = {
            ckpt: secondPassIPAdapter._MODEL,
            clip: run.AUTO,
            vae,
            latent,
            positive: run.AUTO,
            negative: run.AUTO,
            preview: false,
        }
        let secondSampler = run_sampler(run, ui.SecondPass.sampler, second_ctx_sampler)
        latent = secondSampler.latent
        const vAEDecode1 = graph.VAEDecode({ samples: latent, vae })
        const rife_vfi = graph.RIFE_VFI({
            ckpt_name: ui.videoCombineOptions.advancedSettings.RIFEckpt_name,
            clear_cache_after_n_frames: ui.videoCombineOptions.advancedSettings.RIFEclear_cache_after_n_frames,
            multiplier: ui.videoCombineOptions.advancedSettings.RIFEmultiplier,
            fast_mode: ui.videoCombineOptions.advancedSettings.RIFEfast_mode,
            ensemble: ui.videoCombineOptions.advancedSettings.RIFEensemble,
            scale_factor: ui.videoCombineOptions.advancedSettings.RIFEscale_factor,
            frames: vAEDecode1,
        })
        // const vHS$_VideoCombine1 = graph.VHS$_VideoCombine({
        //     frame_rate: ui.videoCombineOptions.frame_rate,
        //     loop_count: ui.videoCombineOptions.advancedSettings.loop_count,
        //     filename_prefix: ui.videoCombineOptions.filename_prefix,
        //     format: ui.videoCombineOptions.format,
        //     pingpong: ui.videoCombineOptions.advancedSettings.pingpong,
        //     save_output: ui.videoCombineOptions.advancedSettings.save_output,
        //     images: rife_vfi,
        // })
        //const finalPreviewImages = graph.PreviewImage({ images: vAEDecode1 })
        const save = graph.SaveImage({
            filename_prefix: ui.videoCombineOptions.filename_prefix + '\\Images',
            images: rife_vfi._IMAGE,
        })
        if (ui.videoCombineOptions.include_gif) {
            const gif = graph.Write_to_GIF({
                image: rife_vfi,
            })
        }
        await run.PROMPT()
        run.Videos.output_video_ffmpegGeneratedImagesTogether(undefined, ui.videoCombineOptions.frame_rate)
    },
})
