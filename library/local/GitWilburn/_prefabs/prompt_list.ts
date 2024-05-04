import type { OutputFor } from './_prefabs'

import { run_prompt } from '../../../built-in/_prefabs/prefab_prompt'

export const ui_promptList = () => {
    const form = getCurrentForm()
    return form.list({
        element: form.fields(
            {
                prompt: form.promptV2(),
                joinType: form.choice({
                    items: {
                        concat: form.fields({}),
                        combine: form.fields({}),
                        average: form.fields({ strength: form.float({ default: 1 }) }),
                    },
                    appearance: 'tab',
                    startCollapsed: true,
                }),
            },
            {
                summary: (ui) => {
                    return `${ui.joinType}:${ui.prompt}`
                },
            },
        ),
    })
}

export const run_promptList = (p: {
    opts: OutputFor<typeof ui_promptList>
    conditioning: _CONDITIONING
    width?: number
    height?: number
    encoderTypeSDXL?: boolean
    promptPreface?: string
    promptSuffix?: string
}): { conditioning: _CONDITIONING } => {
    const run = getCurrentRun()
    const graph = run.nodes
    let newConditioning = p.conditioning

    for (const item of p.opts) {
        const promptReturn = run_prompt({
            prompt: item.prompt,
            clip: run.AUTO,
            ckpt: run.AUTO,
            printWildcards: true,
        })
        const promptText = p.promptPreface + promptReturn.promptIncludingBreaks + p.promptSuffix
        const promptEncode = p.encoderTypeSDXL
            ? run.nodes.CLIPTextEncodeSDXL({
                  clip: run.AUTO,
                  text_g: promptText,
                  text_l: promptText,
                  width: p.width ?? 1024,
                  height: p.height ?? 1024,
                  target_height: p.width ?? 1024,
                  target_width: p.height ?? 1024,
              })
            : graph.CLIPTextEncode({
                  clip: run.AUTO,
                  text: promptText,
              })
        if (item.joinType.average) {
            newConditioning = run.nodes.ConditioningAverage({
                conditioning_from: newConditioning,
                conditioning_to: promptEncode._CONDITIONING,
                conditioning_to_strength: item.joinType.average?.strength,
            })
        } else if (item.joinType.combine) {
            newConditioning = run.nodes.ConditioningCombine({
                conditioning_1: promptEncode._CONDITIONING,
                conditioning_2: newConditioning,
            })
        } else {
            newConditioning = run.nodes.ConditioningConcat({
                conditioning_from: newConditioning,
                conditioning_to: promptEncode._CONDITIONING,
            })
        }
    }
    return { conditioning: newConditioning }
}
