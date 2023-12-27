import type { FormBuilder, Runtime } from "src"
import { Cnet_args, cnet_preprocessor_ui_common, cnet_ui_common } from "../prefab_cnet"
import { OutputFor } from "library/built-in/_prefabs/_prefabs"

// 🅿️ Lineart FORM ===================================================
export const ui_subform_Lineart = (form: FormBuilder) => {
    return form.group({
        label: 'Lineart',
        items: () => ({
            ...cnet_ui_common(form),
            preprocessor: ui_subform_Lineart_Preprocessor(form),
            cnet_model_name: form.enum({
                enumName: 'Enum_ControlNetLoader_control_net_name',
                default: 'control_v11p_sd15_lineart.pth',
                group: 'Controlnet',
                label: 'Model',
            }),
        }),
    })
}

export const ui_subform_Lineart_Preprocessor = (form: FormBuilder) => {
    return form.groupOpt({
        label: 'Lineart Preprocessor',
        items: () => ({
            type: form.choice({
                label: 'Type',
                items: () => ({
                    Realistic: ui_subform_Lineart_realistic(form),
                    Anime: ui_subform_Lineart_Anime(form),
                    Manga: ui_subform_Lineart_Manga(form),
                    Standard: ui_subform_Lineart_Standard(form)
                })
            })
            // TODO: Add support for auto-modifying the resolution based on other form selections
            // TODO: Add support for auto-cropping   
        }),
    })
}

export const ui_subform_Lineart_realistic = (form: FormBuilder) => {
    return form.group({
        label: 'Realistic Lineart',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            coarse: form.bool({ default: false }),
        })
    })
}

export const ui_subform_Lineart_Anime = (form: FormBuilder) => {
    return form.group({
        label: 'Anime Lineart',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
        })
    })
}

export const ui_subform_Lineart_Manga = (form: FormBuilder) => {
    return form.group({
        label: 'Mange Lineart',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
        })
    })
}

export const ui_subform_Lineart_Standard = (form: FormBuilder) => {
    return form.group({
        label: 'Standard Lineart',
        items: () => ({
            ...cnet_preprocessor_ui_common(form),
            gaussian_sigma: form.float({ default: 6.0 }),
            intensity_threshold: form.int({ default: 8, min: 0, max: 16 })
        })
    })
}

export const run_cnet_Lineart = async (flow: Runtime, Lineart: OutputFor<typeof ui_subform_Lineart>, cnet_args: Cnet_args) => {
    const graph = flow.nodes
    let image: IMAGE
    const cnet_name = Lineart.cnet_model_name
    //crop the image to the right size
    //todo: make these editable
    image = graph.ImageScale({
        image: (await flow.loadImageAnswer(Lineart.image))._IMAGE,
        width: cnet_args.width ?? 512,
        height: cnet_args.height ?? 512,
        upscale_method: Lineart.upscale_method,
        crop: Lineart.crop,
    })._IMAGE

    // PREPROCESSOR - Lineart ===========================================================
    if (Lineart.preprocessor) {
        if (Lineart.preprocessor.type.Realistic) {
            const Realistic = Lineart.preprocessor.type.Realistic
            image = graph.LineArtPreprocessor({
                image: image,
                resolution: Realistic.resolution,
                coarse: Realistic.coarse ? 'enable' : 'disable'
            })._IMAGE
            if (Realistic.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Lineart\\realistic' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Lineart.preprocessor.type.Anime) {
            const anime = Lineart.preprocessor.type.Anime
            image = graph.AnimeLineArtPreprocessor({
                image: image,
                resolution: anime.resolution,
            })._IMAGE
            if (anime.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Lineart\\anime' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Lineart.preprocessor.type.Manga) {
            const manga = Lineart.preprocessor.type.Manga
            image = graph.Manga2Anime$_LineArt$_Preprocessor({
                image: image,
                resolution: manga.resolution,
            })._IMAGE
            if (manga.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Lineart\\manga' })
            else
                graph.PreviewImage({ images: image })
        }
        else if (Lineart.preprocessor.type.Standard) {
            const standard = Lineart.preprocessor.type.Standard
            image = graph.LineartStandardPreprocessor({
                image: image,
                resolution: standard.resolution,
                guassian_sigma: standard.gaussian_sigma,
                intensity_threshold: standard.intensity_threshold
            })._IMAGE
            if (standard.saveProcessedImage)
                graph.SaveImage({ images: image, filename_prefix: 'cnet\\Lineart\\standard' })
            else
                graph.PreviewImage({ images: image })
        }
    }

    return { cnet_name, image }
}