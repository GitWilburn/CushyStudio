import type { OutputFor } from './_prefabs/_prefabs'
import type { FormBuilder, Runtime } from 'src'
import type { IWidget } from 'src/controls/IWidget'
import type { Widget_listExt } from 'src/controls/widgets/listExt/WidgetListExt'
import type { OpenRouter_Models } from 'src/llm/OpenRouter_models'

import * as X from 'child_process'
import { run_prompt } from 'library/built-in/_prefabs/prefab_prompt'

import { regionalConditioningSystemMessage, tools } from './_prefabs/_llm_systemPrompts'
import { openRouterInfos } from 'src/llm/OpenRouter_infos'

app({
    metadata: {
        name: 'EPIC LLM',
        illustration: 'library/built-in/_illustrations/mc.jpg',
        description: 'EPIC diffusion with LLM function calling.',
    },
    ui: (form) => ({ ...ui_llm(form) }),
    run: async (run, ui) => {
        console.log('[⚡⚡]EpicLLM is running')
        if (!run.LLM.isConfigured) {
            run.output_text(`Enter your api key in Config`)
            return
        }
        run.formInstance.fields.regionalPrompt.removemAllItems()

        const main_prompt_arg: Subject = { subject: ui.userMessage, mode: 'combine', width: 100, height: 100, x: 0, y: 0 }
        newRegion(main_prompt_arg, run)

        const llmSystemMessage = regionalConditioningSystemMessage

        // ask LLM to generate
        const llmResult = await run.LLM.functionCall(ui.userMessage, ui.llmModel.id, llmSystemMessage, tools, {
            type: 'function',
            function: {
                name: 'regional_prompt',
            },
        })
        const res = llmResult.llmResponse
        if (res.choices.length === 0) throw new Error('no choices in response')
        const msg0 = res.choices[0].message
        if (msg0 == null) throw new Error('choice 0 is null')
        if (typeof msg0 === 'string') throw new Error('choice 0 seems to be an error')
        console.log('[⚡⚡]msg0' + JSON.stringify(msg0))

        if (typeof msg0 === 'object' && msg0 !== null) {
            //this seems to be the way that chatGPT responds,
            if (msg0.tool_calls) {
                msg0.tool_calls.forEach((tool_call) => {
                    const function_name = tool_call.function.name
                    const function_params = JSON.parse(tool_call.function.arguments)

                    console.log('[⚡⚡]function_params' + JSON.stringify(function_params))

                    const functionObject = functionsMap[function_name]

                    if (functionObject && typeof functionObject.func === 'function') {
                        const functionResult = functionObject.func(function_params)
                        console.log('[⚡⚡]functionResult:' + functionResult)
                    } else {
                        throw new Error(`Function ${function_name} is not allowed or does not exist.`)
                    }
                })
            } else if (msg0.content) {
                //try to parse the message because it seems like mistral responds in this format
                const jsonArgs = validateJSON(msg0.content)
                console.log('[⚡⚡]jsonArgs' + JSON.stringify(jsonArgs))

                // const function_name = element.function
                // const function_params = element.parameters
                if (!jsonArgs) {
                    console.log('[⚡⚡🔴]Invalid function call')
                } else {
                    jsonArgs.run = run
                    // console.log('[⚡⚡]function_params' + JSON.stringify(augmented_params))

                    const functionObject = functionsMap[jsonArgs.function]

                    if (functionObject && typeof functionObject.func === 'function') {
                        const functionResult = functionObject.func(jsonArgs)
                        console.log('[⚡⚡]functionResult:' + functionResult)
                    } else {
                        throw new Error(`Function ${jsonArgs.function} is not allowed or does not exist.`)
                    }
                }
            }
        }

        const graph = run.nodes

        let ckpt = graph.CheckpointLoaderSimple({ ckpt_name: 'dreamshaperXL_lightningDPMSDE.safetensors' })
        let clip = ckpt
        let vae = ckpt

        // let positive: _CONDITIONING = run_prompt(flow, { richPrompt: form.mainPos, clip: ckpt, ckpt: ckpt }).conditionning
        let positive: _CONDITIONING = graph.ConditioningZeroOut({
            conditioning: graph.CLIPTextEncode({ clip: clip, text: '' }),
        })
        let negative: _CONDITIONING = run_prompt({
            prompt: { text: 'poor quality, low res, text, watermark' },
            clip: ckpt,
            ckpt: ckpt,
        }).positiveConditionning

        for (const { position: x, value: item } of ui.regionalPrompt.items) {
            const y = run_prompt({ prompt: item.prompt, clip: ckpt, ckpt: ckpt })
            const localConditionning = graph.ConditioningSetArea({
                conditioning: y.positiveConditionning,
                height: x.height * (x.scaleX ?? 1),
                width: x.width * (x.scaleY ?? 1),
                x: x.x,
                y: x.y,
                strength: 1,
            })

            positive =
                item.mode.id === 'combine'
                    ? graph.ConditioningCombine({
                          conditioning_1: positive,
                          conditioning_2: localConditionning,
                      })
                    : graph.ConditioningConcat({
                          conditioning_from: localConditionning,
                          conditioning_to: positive,
                      })
        }

        graph.PreviewImage({
            images: graph.VAEDecode({
                vae,
                samples: graph.KSampler({
                    seed: run.randomSeed(),
                    model: ckpt,
                    sampler_name: 'dpmpp_sde',
                    scheduler: 'karras',
                    positive: positive,
                    negative: negative,
                    cfg: 1.5,
                    steps: 3,
                    latent_image: graph.EmptyLatentImage({
                        batch_size: 1,
                        width: ui.regionalPrompt.width,
                        height: ui.regionalPrompt.height,
                    }),
                }),
            }),
        })
        await run.PROMPT()
    },
})

const ui_llm = (form: FormBuilder) => ({
    userMessage: form.string({ textarea: true }),
    llmModel: form.selectOne({
        choices: Object.entries(openRouterInfos).map(([id, info]) => ({
            id: id as OpenRouter_Models,
            label: info.name,
        })),
    }),
    regionalPrompt: form.regional({
        height: 1024,
        width: 1024,
        initialPosition: ({ width: w, height: h }) => ({
            fill: `#${Math.round(Math.random() * 0xffffff).toString(16)}`,
            height: 64,
            width: 64,
            depth: 1,
            x: Math.round(Math.random() * w),
            y: Math.round(Math.random() * h),
            z: 1,
        }),
        element: ({ width: w, height: h }) =>
            form.group({
                items: () => ({
                    prompt: form.prompt({}),
                    mode: form.selectOne({
                        choices: [{ id: 'combine' }, { id: 'concat' }],
                    }),
                }),
            }),
    }),
})

const addObjectToRegion = (run: Runtime) => {
    const regional = run.formInstance.fields.regionalPrompt
    regional.addItem()
    regional.entries[0].shape.width = 256
    regional.entries[0].shape.height = 256
    regional.entries[0].shape.x = 0
    regional.entries[0].shape.y = 128
    regional.entries[0].widget.fields.prompt.text = `Set to dynamic prompt at ${Date.now()}`
}

const functionsMap: Record<string, FunctionObject> = {
    regional_prompt: {
        func: (args: Reg_args): string => {
            console.log('[⚡⚡] Inside regional prompt!!!')
            const subjects = args.subject_array
            const run = args.run
            if (!run) return 'no valid run'
            if (subjects) {
                // const stringify = JSON.stringify(subjects)
                // if (stringify) console.log('[⚡⚡]' + stringify)
                args.subject_array.forEach((i) => {
                    newRegion(i, run)
                })
            } else console.log('[⚡⚡] no subject_array!!!')
            return 'regional_prompt called successfully!!'
        },
    },
}

//how to type this correctly?
const newRegion = (subject: Subject, run: Runtime) => {
    console.log('[⚡⚡]subject object ', JSON.stringify(subject))
    console.log('[⚡⚡]subject params ', subject.width, subject.height, subject.x, subject.y)
    const regional = run.formInstance.fields.regionalPrompt
    const width = subject.width >= 0 && subject.width < 100 ? (subject.width * regional.width) / 100 : regional.width //how to access the regional prompt width/height
    const height = subject.height >= 0 && subject.height < 100 ? (subject.height * regional.height) / 100 : regional.height //how to access the regional prompt width/height
    const x = subject.x >= 0 && subject.x < 100 ? (subject.x * 512) / 100 : 0 //how to access the regional prompt width/height
    const y = subject.y >= 0 && subject.y < 100 ? (subject.y * 512) / 100 : 0 //how to access the regional prompt width/height

    regional.addItem()
    const i = regional.entries.length - 1
    regional.entries[i].shape.width = width
    regional.entries[i].shape.height = height
    regional.entries[i].shape.x = x
    regional.entries[i].shape.y = y
    regional.entries[i].widget.fields.prompt.text = subject.subject
    regional.entries[i].widget.fields.prompt.mode = subject.mode
}

// export type ParamType = string | number | boolean

export interface FunctionObject {
    func: (args: Reg_args) => string // replace void with your return type
}

type Reg_args = {
    subject_array: Subject[]
    function: string
    run: Runtime | undefined
}

type Subject = {
    subject: string
    mode: string
    width: number
    height: number
    x: number
    y: number
}

//
function validateJSON(json: string): Reg_args | undefined {
    let objs: any = JSON.parse(json)

    console.log('[⚡⚡🔴]string objs ' + JSON.stringify(objs))
    // Validate the data
    for (let obj of objs) {
        console.log('[⚡⚡🔴]string obj ' + JSON.stringify(obj))

        if (
            typeof obj.subject !== 'string' ||
            typeof obj.width !== 'number' ||
            typeof obj.height !== 'number' ||
            typeof obj.x !== 'number' ||
            typeof obj.y !== 'number'
        ) {
            console.error('Invalid subject')
            return undefined
        }

        // Cast obj as Subject and set mode
        obj = obj as Subject
        obj.mode = 'concat'
    }

    let reg_args: Reg_args = {
        subject_array: objs, // Assuming the first object's subject_array is what you want
        function: 'regional_prompt', //objs[0].function,
        run: undefined,
    }
    console.log('[⚡⚡🔴]reg_args ' + JSON.stringify(reg_args))
    return reg_args
}

// let json =
//     '[{ "function": "regional_prompt", "parameters": { "subject_array": [ { "prompt": "woman with red hair", "width": 50, "height": 100, "x": 0, "y": 0 }, { "prompt": "white haired man", "width": 50, "height": 100, "x": 25, "y": 0 } ] } }]'
// let reg_args = validateJSON(json)
// console.log(reg_args)
