import type { ITreeEntry } from '../TreeEntry'

import { nanoid } from 'nanoid'

export class TreeError implements ITreeEntry {
    get id() { return `error#${this.uid}` } // prettier-ignore
    get name() { return `❌ ${this.title}` } // prettier-ignore
    isFolder = false
    icon = (<span className='material-symbols-outlined'>Error</span>)
    constructor(public title: string, public uid = nanoid()) {}
}
