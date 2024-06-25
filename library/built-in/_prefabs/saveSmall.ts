import type { OutputFor } from './_prefabs'

export function ui_customSave() {
    const form = getCurrentForm()
    return form
        .group({
            label: 'Save As...',
            icon: 'mdiContentSaveCogOutline',
            items: {
                subfolder: form.string({
                    label: 'Subfolder',
                    tooltip: [
                        //
                        'Apply to all images generated by prompt',
                        'leave blank to save in same subfolder as ComfyUI outputs.',
                        'tokens: {YYYY}, {MM}, {DD}, {HH}, {mm}, {ss}',
                    ].join('\n'),
                    default: '{YYYY}-{MM}-{DD}/{HH}h{mm}-{ss}',
                }),
                format: form.selectOne({
                    label: 'Format',
                    appearance: 'tab',
                    default: { id: 'raw', label: 'Raw' },
                    choices: [
                        { id: 'raw', label: 'Raw' },
                        { id: 'image/webp', label: 'WebP' },
                        { id: 'image/png', label: 'PNG' },
                        { id: 'image/jpeg', label: 'JPG' },
                    ],
                }),
                quality: form.float({
                    tooltip: 'only when saving as WebP or JPG',
                    default: 0.9,
                    min: 0,
                    max: 1,
                    step: 0.1,
                }),
            },
        })
        .optional(true)
}

export const run_customSave = (ui: OutputFor<typeof ui_customSave>): ImageSaveFormat | undefined => {
    if (ui == null) return undefined
    const now = new Date()
    return {
        format: ui.format.id,
        prefix: ui.subfolder //
            .replaceAll('{YYYY}', now.getFullYear().toString())
            .replaceAll('{MM}', (now.getMonth() + 1).toString())
            .replaceAll('{DD}', now.getDate().toString())
            .replaceAll('{HH}', now.getHours().toString().padStart(2, '0'))
            .replaceAll('{mm}', now.getMinutes().toString().padStart(2, '0'))
            .replaceAll('{ss}', now.getSeconds().toString().padStart(2, '0')),
        quality: ui.quality,
    }
}

// old way:
// 💽 /** need to be called after `await run.PROMPT()`, not before */
// 💽 export const run_saveAllImages = async (p: ImageSaveFormat = {}) => {
// 💽     const run = getCurrentRun()
// 💽     // 1. build canvas
// 💽     const canvas = document.createElement('canvas')
// 💽     let ctx = canvas.getContext('2d')
// 💽
// 💽     console.log(`[💪] found ${run.generatedImages.length} images`)
// 💽
// 💽     // 2. for every image generated
// 💽     for (const img of run.generatedImages) {
// 💽         // if (img.ComfyNodeMetadta?.tag !== 'final-image') {
// 💽         //     console.log(`[💪] skipping file ${img.url} because it doesnt' have tag "final-image"`)
// 💽         //     continue
// 💽         // }
// 💽         // get canvas size (use 'image-meta' that supports all the image file formats you can think of)
// 💽         const width = img.data.width
// 💽         const height = img.data.height
// 💽
// 💽         // resize the canvas accordingly
// 💽         canvas.width = width
// 💽         canvas.height = height
// 💽
// 💽         // paste html image onto your canvas
// 💽         const imgHtml = await run.Konva.createHTMLImage_fromURL(img.url)
// 💽         ctx!.drawImage(imgHtml, 0, 0, width, height)
// 💽
// 💽         // get the binary image data (as base64)
// 💽         // (https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/toDataURL)
// 💽         let dataUrl = canvas.toDataURL('image/webp', p.quality)
// 💽         let base64Data = dataUrl.replace(/^data:image\/webp;base64,/, '')
// 💽
// 💽         // non-integrated with CushyStudio way of saving an image
// 💽         run.Filesystem.mkdirSync('outputs/_b64', { recursive: true })
// 💽         const relPath = `outputs/_b64/output-${img.id}.webp` as RelativePath
// 💽         run.Filesystem.writeFileSync(relPath, base64Data, 'base64')
// 💽
// 💽         // register it on cushy
// 💽         const newImg = run.Images.createFromPath(relPath, { promptID: img.prompt?.id })
// 💽     }
// 💽 }
