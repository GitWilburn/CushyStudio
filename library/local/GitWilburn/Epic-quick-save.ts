import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { run_customSave, ui_customSave } from '../../built-in/_prefabs/saveSmall'

app({
    metadata: {
        name: 'epic quick save',
        description: 'Determine a favorites folder to save all your favorites into',
        help: `This app is made to be run from click on an image and sending it to drafts of this app.`,
        illustration: 'library/local/GitWilburn/_assets/img/heart.png',
    },
    canStartFromImage: true,
    ui: (form) => ({
        folderPath: form.string({ default: 'C:\\StableDiffusion\\like\\' }),
    }),
    //                  👇👇👇👇👇
    run: async (run, ui, startImg) => {
        if (startImg == null) throw new Error('no image provided')
        let img: _IMAGE = await startImg.loadInWorkflow()
        const saveNode = run.nodes.Image_Save({
            output_path: ui.folderPath,
            images: img,
            filename_prefix: 'cushy_like_',
            extension: 'png',
            embed_workflow: 'false',
            filename_delimiter: '_',
            filename_number_padding: 4,
            filename_number_start: 'false',
            quality: 100,
            lossless_webp: 'false',
            overwrite_mode: 'false',
            show_history: 'false',
            show_history_by_prefix: 'true',
            show_previews: 'false',
        })
        await run.PROMPT({})
    },
})
