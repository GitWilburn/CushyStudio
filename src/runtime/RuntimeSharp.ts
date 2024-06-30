import type { MediaImageL } from '../models/MediaImage'
import type { Runtime } from './Runtime'

import { makeAutoObservable } from 'mobx'
import sharp, { type Blend } from 'sharp'

import { createMediaImage_fromBuffer } from '../models/createMediaImage_fromWebFile'

export class RuntimeSharp {
    constructor(private rt: Runtime) {
        makeAutoObservable(this)
    }

    sharp = sharp

    toMediaImage(buffer: Buffer): Promise<MediaImageL> {
        return createMediaImage_fromBuffer(buffer, `outputs/unknown-${Date.now()}.png`)
    }
}
