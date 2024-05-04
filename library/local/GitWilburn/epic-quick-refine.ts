import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { ui_sampler } from './_prefabs/_prefabs'
import { run_refiners_fromImage, ui_refiners } from './_prefabs/prefab_detailer'

app({
    metadata: {
        name: 'epic improve face',
        description: 'epic improve face',
        help: `This app is made to be run from click on an image and sending it to drafts of this app.`,
    },
    canStartFromImage: true,
    ui: (form) => ({
        image: form.image({}),
        model: ui_model(),
        refiners: ui_refiners(),
    }),
    //                  👇👇👇👇👇
    run: async (run, ui, startImg) => {
        let img: _IMAGE
        if (startImg == null) {
            const _img = run.loadImage(ui.image.imageID)
            img = await _img.loadInWorkflow()
        } else {
            img = await startImg.loadInWorkflow()
        }
        run_model(ui.model)
        img = run_refiners_fromImage(ui.refiners, img)
        run.add_previewImage(img)
        await run.PROMPT()
    },
})
