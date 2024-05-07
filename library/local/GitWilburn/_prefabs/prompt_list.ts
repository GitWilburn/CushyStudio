import type { OutputFor } from './_prefabs'

import { run_prompt } from '../../../built-in/_prefabs/prefab_prompt'

export const ui_promptList = () => {
    const form = getCurrentForm()
    return form.fields(
        {
            joinType: form.choice({
                items: {
                    mask: form.fields({}),
                    concat: form.fields({}),
                    combine: form.fields({}),
                    average: form.fields({ strength: form.float({ default: 1 }) }),
                },
                appearance: 'tab',
                startCollapsed: true,
            }),
            promptList: form.list({
                element: form.fields(
                    {
                        prompt: form.promptV2(),
                        mask: form.image({}),
                        invert: form.bool({}),
                        mode: form.enum.Enum_LoadImageMask_channel({}),
                        blur: form.float({ default: 6, min: 0, max: 2048, softMax: 24, step: 1 }),
                    },
                    {
                        summary: (ui) => {
                            return `${ui.prompt}`
                        },
                    },
                ),
            }),
        },
        {
            summary: (ui) => {
                return `(${ui.promptList.length})${ui.joinType}`
            },
        },
    )
}

export const run_promptList = async (p: {
    opts: OutputFor<typeof ui_promptList>
    conditioning: _CONDITIONING
    ckpt: _MODEL
    width?: number
    height?: number
    encoderTypeSDXL?: boolean
    promptPreface?: string
    promptSuffix?: string
}) => {
    const run = getCurrentRun()
    const graph = run.nodes
    let newConditioning = p.conditioning

    let promptCount = 0
    let condList: { cond: _CONDITIONING; mask: _MASK }[] = []
    for (const item of p.opts.promptList) {
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

        if (p.opts.joinType.average) {
            newConditioning = run.nodes.ConditioningAverage({
                conditioning_from: newConditioning,
                conditioning_to: promptEncode._CONDITIONING,
                conditioning_to_strength: p.opts.joinType.average?.strength,
            })
        } else if (p.opts.joinType.combine) {
            newConditioning = run.nodes.ConditioningCombine({
                conditioning_1: promptEncode._CONDITIONING,
                conditioning_2: newConditioning,
            })
        } else if (p.opts.joinType.mask) {
            if (!item.mask) throw new Error('❌ input mask required')
            if (promptCount > 10) throw new Error('❌ conditioning node cannot account for more masks')
            promptCount += 1
            const _img = run.loadImage(item.mask.imageID)
            let mask = await _img.loadInWorkflowAsMask(item.mode)
            const _mask = item.blur > 0 ? graph.MaskBlur$6({ amount: item.blur, mask }) : mask
            if (item.invert) {
                const _maskInvert = graph.InvertMask({ mask: _mask }).outputs.MASK
                condList[promptCount] = { cond: promptEncode._CONDITIONING, mask: _maskInvert }
            } else {
                condList[promptCount] = { cond: promptEncode._CONDITIONING, mask: _mask }
            }
        } else {
            newConditioning = run.nodes.ConditioningConcat({
                conditioning_from: newConditioning,
                conditioning_to: promptEncode._CONDITIONING,
            })
        }
    }
    let ckpt = p.ckpt
    if (p.opts.joinType.mask && condList[1]) {
        const attentionCoupleNode = graph.EPIC_Attention_Couple({
            model: p.ckpt,
            base_mask: graph.InvertMask({ mask: condList[1].mask }),
            cond_1: condList[1].cond,
            mask_1: condList[1].mask,
            cond_2: condList[2]?.cond,
            mask_2: condList[2]?.mask,
            cond_3: condList[3]?.cond,
            mask_3: condList[3]?.mask,
            cond_4: condList[4]?.cond,
            mask_4: condList[4]?.mask,
            cond_5: condList[5]?.cond,
            mask_5: condList[5]?.mask,
            cond_6: condList[6]?.cond,
            mask_6: condList[6]?.mask,
            cond_7: condList[7]?.cond,
            mask_7: condList[7]?.mask,
            cond_8: condList[8]?.cond,
            mask_8: condList[8]?.mask,
            cond_9: condList[9]?.cond,
            mask_9: condList[9]?.mask,
            cond_10: condList[10]?.cond,
            mask_10: condList[10]?.mask,
        })
        ckpt = attentionCoupleNode.outputs.MODEL
    }

    return { conditioning: newConditioning, ckpt: ckpt }
}
