import { run_model, ui_model } from '../../built-in/_prefabs/prefab_model'
import { ui_sampler } from './_prefabs/_prefabs'
import { run_refiners_fromImage, ui_refiners } from './_prefabs/prefab_detailer'

app({
    metadata: {
        name: 'epic prompt data',
        description: 'epic prompt data',
        help: `This app is made to be run from click on an image and sending it to drafts of this app.`,
    },
    canStartFromImage: true,
    ui: (form) => ({
        image: form.image({}),
    }),
    //                  👇👇👇👇👇
    run: async (run, ui, startImg?) => {
        const image = startImg ?? ui.image
        const enumName = await image.uploadAndReturnEnumName()
        const prompt_reader = run.nodes.SDPromptReader({ image: enumName })
        run.output_text({
            title: 'Embedded Prompt Data',
            message: [
                `Image Prompt:${image.prompt}`,

                `Positive Prompt:${prompt_reader.outputs.POSITIVE}`, //this doesn't work. it just returns objects. looks like these are only to access the workflow schema, not be able to read any of the values passed through the workflow
                `Negative Prompt:${prompt_reader.outputs.NEGATIVE}`,
                `Positive Prompt:${prompt_reader.outputs.MODEL_NAME}`,
                `Positive Prompt:${prompt_reader.outputs.CFG}`,
                `Positive Prompt:${prompt_reader.outputs.STEPS}`,
                `Positive Prompt:${prompt_reader.outputs.SETTINGS}`,
                `Positive Prompt:${prompt_reader.outputs.WIDTH}`,
                `Positive Prompt:${prompt_reader.outputs.HEIGHT}`,
                `Positive Prompt:${prompt_reader.outputs.SEED}`,
                `Positive Prompt:${prompt_reader.outputs.FILENAME}`,
            ].join('\n'),
        })
        //await run.PROMPT()
    },
})
