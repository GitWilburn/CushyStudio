import { makeAutoObservable } from 'mobx'
import type { STATE } from 'src/state/state'

// prettier-ignore
export type ThemeName =
    | 'light'
    | 'dark'
    | 'cupcake'
    | 'valentine'
    | 'wireframe'
    | 'aqua'
    | 'forest'
// | 'sunset'
// | 'luxury'
// | 'business'

export class ThemeManager {
    themes: ThemeName[] = [
        //
        'light',
        'dark',
        'cupcake',
        'valentine',
        'wireframe',
        'aqua',
        'forest',
        // 'sunset',
        // 'luxury',
        // 'business',
    ]
    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark'
    }
    get theme(): ThemeName {
        return this.st.configFile.value.theme ?? 'dark'
    }
    set theme(v: ThemeName) {
        this.st.configFile.update({ theme: v })
    }

    constructor(public st: STATE) {
        //
        makeAutoObservable(this)
    }
}
