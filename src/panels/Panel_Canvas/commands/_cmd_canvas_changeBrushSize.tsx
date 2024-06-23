import { SimpleMouseActivity } from '../../../csuite/activity/SimpleMouseActivity'
import { command } from '../../../csuite/commands/Command'
import { Trigger } from '../../../csuite/trigger/Trigger'
import { ctx_unifiedCanvas } from '../../../operators/contexts/ctx_unifiedCanvas'

export const cmd_canvas_changeBrushSize = command({
    id: 'canvas.changeBrushSize',
    ctx: ctx_unifiedCanvas.derive((ctx) => {
        if (ctx.currentTool === ctx.toolPaint) return ctx
        if (ctx.currentTool === ctx.toolMask) return ctx
        return Trigger.UNMATCHED
    }),
    combos: 'f',
    description: 'change brush size by moving ...',
    label: 'Change brush size',
    action: (ctx) => {
        const startSize = ctx.maskToolSize
        return cushy.activityManager.start_(
            new SimpleMouseActivity({
                onStart: () => {
                    console.log(`[🐭🟢] canvas.changeBrushSize: start`)
                },
                onMove: (info) => {
                    console.log(`[🐭🟢] canvas.changeBrushSize: move`, info)
                    ctx.setBrushSize(Math.round(startSize + info.offsetFromStart / 10))
                },
                onCancel: (info) => {
                    console.log(`[🐭❌] canvas.changeBrushSize: cancel`, info)
                    ctx.setBrushSize(startSize)
                },
            }),
        )
    },
})
