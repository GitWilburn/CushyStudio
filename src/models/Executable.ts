import type { CushyScriptL } from './CushyScriptL'

import { App, WidgetDict } from 'src/cards/App'
import { asCushyAppID } from 'src/db/TYPES.gen'
import { basename } from 'pathe'

export class Executable {
    constructor(
        //
        public script: CushyScriptL,
        public ix: number,
        public def: App<WidgetDict>,
    ) {}

    get ui() {
        return this.def.ui
    }

    get run() {
        return this.def.run
    }

    get metadata() {
        return this.def.metadata
    }

    get name(): string {
        return this.def.metadata?.name ?? basename(this.script.relPath)
    }

    get tags(): string[] {
        return this.def.metadata?.tags ?? []
    }

    get description(): Maybe<string> {
        return this.def.metadata?.description
    }

    get illustration(): Maybe<string> {
        return this.def.metadata?.illustration
    }

    get appID(): CushyAppID {
        return asCushyAppID(this.script.relPath + ':' + this.ix)
    }
}
