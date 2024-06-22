import type { IconName } from '../csuite/icons/icons'

import { type MenuEntry, menuWithoutProps } from '../csuite/menu/Menu'
import { SimpleMenuAction } from '../csuite/menu/SimpleMenuAction'

export class Panel<Props> {
    $Props!: Props

    get name(): string {
        return this.p.name
    }

    get widget(): React.FC<Props> {
        return this.p.widget()
    }

    get header() {
        return this.p.header
    }

    get icon(): IconName | undefined {
        return this.p.icon
    }

    get menuEntries(): MenuEntry[] {
        const presets = Object.entries(this.p.presets ?? {})
        const out: MenuEntry[] = []

        const defEntry = new SimpleMenuAction({
            label: this.name,
            icon: this.p.icon,
            onPick: () => {
                const props: Props = this.p.def()
                cushy.layout.FOCUS_OR_CREATE(this.name as any, {}, 'LEFT_PANE_TABSET')
            },
        })
        if (presets.length === 0) {
            out.push(defEntry)
        } else {
            const sub = presets.map(([name, preset]) => {
                return new SimpleMenuAction({
                    label: name,
                    icon: this.p.icon,
                    onPick: () => {
                        const props: Props = preset()
                        cushy.layout.FOCUS_OR_CREATE(this.name as any, props, 'LEFT_PANE_TABSET')
                    },
                })
            })
            const x = menuWithoutProps({
                icon: this.p.icon,
                title: this.name,
                id: this.name,
                entries: () => [defEntry, ...sub],
            }).bind()
            out.push(x)
        }
        return out
    }

    constructor(
        public p: {
            //
            name: string
            widget: () => React.FC<Props>
            header: (p: NoInfer<Props>) => { title: string }
            icon?: IconName
            def: () => NoInfer<Props>
            presets?: { [name: string]: () => NoInfer<Props> }
        },
    ) {}
}
