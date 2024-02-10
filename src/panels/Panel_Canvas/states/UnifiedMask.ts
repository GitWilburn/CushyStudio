import type { STATE } from 'src/state/state'
import type { UnifiedCanvas } from './UnifiedCanvas'
import type { MediaImageL } from 'src/models/MediaImage'

import { makeAutoObservable } from 'mobx'

import Konva from 'konva'
import { Stage } from 'konva/lib/Stage'
import { Layer } from 'konva/lib/Layer'
import { Image } from 'konva/lib/shapes/Image'
import { bang } from 'src/utils/misc/bang'
import { nanoid } from 'nanoid'

export class UnifiedMask {
    readonly st: STATE
    readonly layer: Layer
    readonly uid = nanoid(4)
    name: string = `mask-${this.uid}`

    image: Maybe<Image> = null

    constructor(
        //
        public canvas: UnifiedCanvas,
        img?: MediaImageL,
    ) {
        this.st = canvas.st
        makeAutoObservable(this, {})

        const stage: Stage = this.canvas.stage
        this.layer = new Konva.Layer({})
        this.layer.opacity(canvas.maskOpacity) // 🔴
        stage.add(this.layer)

        // if image provided, we add it as mask
        if (img) {
            this.image = new Konva.Image({
                draggable: true,
                image: img.asHTMLImageElement_noWait,
                // @ts-ignore
                threshold: 20,
            })
            this.layer.add(this.image)
        }
    }
}

export const setupStageForPainting = (canvas: UnifiedCanvas) => {
    const stage: Stage = canvas.stage
    stage.on('mousedown touchstart', function (e) {
        // 1. ensure pointer
        var pos = canvas.pointerPosition
        if (pos == null) return console.log(`[⁉️] paint failed: no cursor position`)

        if (canvas.mode === 'mask') {
            // 2. ensure active mask
            const layer = canvas.activeMask?.layer
            if (layer == null) return console.log(`[⁉️] paint failed: no canvas.activeMask.layer`)

            // 3. start drawing
            canvas._isPaint = true
            canvas._lastLine = new Konva.Line({
                // stroke: '#df4b26',
                stroke: canvas.maskColor, // 🔴
                strokeWidth: canvas.maskToolSize,
                globalCompositeOperation: canvas.maskTool === 'paint' ? 'source-over' : 'destination-out',
                // round cap for smoother lines
                lineCap: 'round',
                lineJoin: 'round',
                // add point twice, so we have some drawings even on a simple click
                points: [pos.x, pos.y, pos.x, pos.y],
            })

            layer.add(canvas._lastLine)
        }
    })

    stage.on('mouseup touchend', function () {
        canvas._isPaint = false
    })

    // and core function - drawing
    stage.on('mousemove touchmove', function (e) {
        if (!canvas._isPaint) return

        // prevent scrolling on touch devices
        e.evt.preventDefault()

        const pos__ = stage.getPointerPosition()
        if (pos__ == null) return console.log(`[⁉️] pos is null`)
        const pos = {
            x: canvas.infos.viewPointerX,
            y: canvas.infos.viewPointerY,
        }
        var newPoints = bang(canvas._lastLine).points().concat([pos.x, pos.y])
        bang(canvas._lastLine).points(newPoints)
    })
}
