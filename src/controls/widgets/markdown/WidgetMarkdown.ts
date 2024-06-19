import type { IBlueprint } from '../../IBlueprint'
import type { Model } from '../../Model'
import type { Problem_Ext } from '../../Validation'
import type { WidgetConfig } from '../../WidgetConfig'
import type { WidgetSerial } from '../../WidgetSerialFields'

import { nanoid } from 'nanoid'

import { makeAutoObservableInheritance } from '../../../utils/mobx-store-inheritance'
import { BaseField } from '../../BaseField'
import { registerWidgetClass } from '../WidgetUI.DI'
import { WidgetMardownUI } from './WidgetMarkdownUI'

// CONFIG
export type Widget_markdown_config = WidgetConfig<
    {
        markdown: string | ((form: Model) => string)
        inHeader?: boolean
    },
    Widget_markdown_types
>

// SERIAL
export type Widget_markdown_serial = WidgetSerial<{
    type: 'markdown'
    active: true
}>

// VALUE
export type Widget_markdown_value = { type: 'markdown' }

// TYPES
export type Widget_markdown_types = {
    $Type: 'markdown'
    $Config: Widget_markdown_config
    $Serial: Widget_markdown_serial
    $Value: Widget_markdown_value
    $Widget: Widget_markdown
}

// STATE
export class Widget_markdown extends BaseField<Widget_markdown_types> {
    get DefaultHeaderUI() {
        if (this.config.inHeader) return WidgetMardownUI
        return undefined
    }

    get DefaultBodyUI() {
        if (this.config.inHeader) return undefined
        return WidgetMardownUI
    }

    get baseErrors(): Problem_Ext {
        return null
    }
    readonly id: string

    readonly type: 'markdown' = 'markdown'
    readonly serial: Widget_markdown_serial

    get markdown(): string {
        const md = this.config.markdown
        if (typeof md === 'string') return md
        return md(this.form)
    }

    constructor(
        //
        public readonly form: Model,
        public readonly parent: BaseField | null,
        public readonly spec: IBlueprint<Widget_markdown>,
        serial?: Widget_markdown_serial,
    ) {
        super()
        this.id = serial?.id ?? nanoid()
        const config = spec.config
        this.serial = serial ?? { type: 'markdown', collapsed: config.startCollapsed, active: true, id: this.id }
        makeAutoObservableInheritance(this)
    }

    /** always return false */
    hasChanges = false

    /** do nothing */
    reset = () => {}

    setValue(val: Widget_markdown_value) {
        this.value = val
    }
    set value(val: Widget_markdown_value) {
        // do nothing; markdown have no real value; only config
    }
    get value(): Widget_markdown_value {
        return this.serial
    }
}

// DI
registerWidgetClass('markdown', Widget_markdown)
