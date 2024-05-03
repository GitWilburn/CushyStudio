import type { FormBuilder } from '../../../src/controls/FormBuilder'
import type { OutputFor } from './_prefabs'

export const ui_latent_v3 = () => {
    const form: FormBuilder = getCurrentForm()
    const batchSize = form.shared('batchSize', form.int({ step: 1, default: 1, min: 1, max: 8 }))

    return form.choice({
        appearance: 'tab',
        default: 'emptyLatent',
        label: 'Latent Input',
        items: {
            emptyLatent: form.group({
                collapsed: false,
                border: false,
                items: { batchSize, size: form.size({ label: false, collapsed: false, border: false }) },
            }),
            image: form.group({
                collapsed: false,
                border: false,
                items: {
                    batchSize,
                    image: form.image(),
                    scale: form
                        .fields(
                            {
                                type: form.choice({
                                    appearance: 'tab',
                                    items: {
                                        scaleAuto: form.fields({}),
                                        scaleBy: form.float({ default: 1, step: 0.25, min: 0, max: 4 }),
                                        scaleToSelectedSize: form.fields({
                                            width: form.float({ default: 1024 }),
                                            height: form.float({ default: 1024 }),
                                        }),
                                    },
                                }),
                            },
                            {
                                summary: (ui) => {
                                    return `${ui.type.scaleBy}`
                                },
                            },
                        )
                        .optional(),
                },
            }),
        },
    })
}

export const run_latent_v3 = async (p: {
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
    let width = p.width_override || opts.emptyLatent?.size.width || 1024
    let height = p.height_override || opts.emptyLatent?.size.height || 1024
    let latent: HasSingle_LATENT

    // case 1. start form image
    if (opts.image) {
        const _img = run.loadImage(opts.image.image.imageID)
        let image = await (await _img.loadInWorkflow())._IMAGE
        if (width != _img.width || height != _img.height) {
            const max = Math.min(width / _img.width, height / _img.height)
            image = graph.ImageScaleBy({ image: image, scale_by: max, upscale_method: 'lanczos' })._IMAGE
        }
        latent = graph.VAEEncode({ pixels: image, vae: p.vae })

        if (opts.image.batchSize > 1) {
            latent = graph.RepeatLatentBatch({
                samples: latent,
                amount: opts.image.batchSize,
            })
        }
    }

    // case 2. start form empty latent
    else if (opts.emptyLatent) {
        width = opts.emptyLatent.size.width
        height = opts.emptyLatent.size.height
        latent = graph.EmptyLatentImage({
            batch_size: opts.emptyLatent.batchSize ?? 1,
            height: height,
            width: width,
        })
    }

    // default case
    else {
        throw new Error('no latent')
    }

    // return everything
    return { latent, width, height }
}
