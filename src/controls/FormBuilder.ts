import { makeAutoObservable } from 'mobx'
import type { ComfySchemaL } from 'src/models/Schema'
import { exhaust } from 'src/utils/misc/ComfyUtils'
import { _FIX_INDENTATION } from '../utils/misc/_FIX_INDENTATION'
import * as W from './Widget'
import { Widget_group, type Widget_group_config } from './widgets/WidgetIGroupUI'
import { Widget_bool, type Widget_bool_config } from './widgets2/WidgetBool'
import { Widget_choices, type Widget_choices_config } from './widgets2/WidgetChoices'
import { Widget_color, type Widget_color_config } from './widgets2/WidgetColor'
import { Widget_number, type Widget_number_config } from './widgets2/WidgetNumber'
import { Widget_str, type Widget_str_config } from './widgets2/WidgetString'
import { Widget_optional, Widget_optional_config } from './widgets2/WidgetOptional'

export class FormBuilder {
    /** (@internal) don't call this yourself */
    constructor(public schema: ComfySchemaL) {
        makeAutoObservable(this)
    }

    // string
    string = (opts: Widget_str_config) => new Widget_str(this, this.schema, opts)
    stringOpt = (opts: Widget_str_config & { startActive?: boolean }) =>
        this.optional({
            label: opts.label,
            startActive: opts.startActive,
            widget: () => new Widget_str(this, this.schema, opts),
        })

    /** @deprecated */
    str = this.string

    /** @deprecated */
    strOpt = this.stringOpt

    // boolean
    boolean = (opts: Widget_bool_config) => new Widget_bool(this, this.schema, opts) // prettier-ignore
    bool    = (opts: Widget_bool_config) => new Widget_bool(this, this.schema, opts) // prettier-ignore

    // number
    int       = (opts: Omit<Widget_number_config,'mode'>) => new Widget_number(this, this.schema, { mode: 'int',   ...opts }) // prettier-ignore
    float     = (opts: Omit<Widget_number_config,'mode'>) => new Widget_number(this, this.schema, { mode: 'float', ...opts }) // prettier-ignore
    number    = (opts: Omit<Widget_number_config,'mode'>) => new Widget_number(this, this.schema, { mode: 'float', ...opts }) // prettier-ignore

    intOpt = (opts: Omit<Widget_number_config, 'mode'> & { startActive?: boolean }) =>
        this.optional({
            label: opts.label,
            startActive: opts.startActive,
            widget: () => new Widget_number(this, this.schema, { mode: 'int', ...opts }),
        })
    floatOpt = (opts: Omit<Widget_number_config, 'mode'> & { startActive?: boolean }) =>
        this.optional({
            label: opts.label,
            startActive: opts.startActive,
            widget: () => new Widget_number(this, this.schema, { mode: 'float', ...opts }),
        })
    numberOpt = (opts: Omit<Widget_number_config, 'mode'> & { startActive?: boolean }) =>
        this.optional({
            label: opts.label,
            startActive: opts.startActive,
            widget: () => new Widget_number(this, this.schema, { mode: 'float', ...opts }),
        })

    // --------------------
    color     = (opts: Widget_color_config)       => new Widget_color(this, this.schema, opts) // prettier-ignore
    size      = (opts: W.Widget_size_config)      => new W.Widget_size(this, this.schema, opts) // prettier-ignore
    orbit     = (opts: W.Widget_orbit_config)     => new W.Widget_orbit(this, this.schema, opts) // prettier-ignore
    prompt    = (opts: W.Widget_prompt_config)    => new W.Widget_prompt(this, this.schema, opts) // prettier-ignore
    promptOpt = (opts: W.Widget_promptOpt_config) => new W.Widget_promptOpt(this, this.schema, opts) // prettier-ignore
    seed      = (opts: W.Widget_seed_config)      => new W.Widget_seed(this, this.schema, opts) // prettier-ignore

    matrix = (opts: W.Widget_matrix_config) => new W.Widget_matrix(this, this.schema, opts)

    inlineRun = (opts: W.Widget_inlineRun_config) => new W.Widget_inlineRun(this, this.schema, opts)
    loras = (opts: W.Widget_loras_config) => new W.Widget_loras(this, this.schema, opts)
    image = (opts: W.Widget_image_config) => new W.Widget_image(this, this.schema, opts)
    markdown = (opts: W.Widget_markdown_config | string) =>
        new W.Widget_markdown(this, this.schema, typeof opts === 'string' ? { markdown: opts } : opts)
    custom = <TViewState>(opts: W.Widget_custom_config<TViewState>) => new W.Widget_custom<TViewState>(this, this.schema, opts)
    imageOpt = (opts: W.Widget_imageOpt_config) => new W.Widget_imageOpt(this, this.schema, opts)
    enum = <const T extends KnownEnumNames>(p: W.Widget_enum_config<T>) => new W.Widget_enum(this, this.schema, p)
    enumOpt = <const T extends KnownEnumNames>(p: W.Widget_enumOpt_config<T>) => new W.Widget_enumOpt(this, this.schema, p)
    list = <const T extends W.Widget>(p: W.Widget_list_config<T>) => new W.Widget_list(this, this.schema, p)

    optional = <const T extends W.Widget>(p: Widget_optional_config<T>) => new Widget_optional(this, this.schema, p)

    listExt = <const T extends W.Widget>(p: W.Widget_listExt_config<T>) => new W.Widget_listExt(this, this.schema, p)

    timeline = <const T extends W.Widget>(p: W.Widget_listExt_config<T>) =>
        new W.Widget_listExt(this, this.schema, { mode: 'timeline', ...p })

    regional = <const T extends W.Widget>(p: W.Widget_listExt_config<T>) =>
        new W.Widget_listExt(this, this.schema, { mode: 'regional', ...p })

    groupOpt = <const T extends { [key: string]: W.Widget }>(p: Widget_group_config<T> & { startActive?: boolean }) =>
        this.optional({
            startActive: p.startActive,
            widget: () => this.group(p),
        })

    group = <const T extends { [key: string]: W.Widget }>(p: Widget_group_config<T>) => new Widget_group(this, this.schema, p)

    // List API--------------
    selectOne = <const T extends W.BaseSelectEntry>(p: W.Widget_selectOne_config<T>) =>
        new W.Widget_selectOne(this, this.schema, p)

    selectMany = <const T extends W.BaseSelectEntry>(p: W.Widget_selectMany_config<T>) =>
        new W.Widget_selectMany(this, this.schema, p)

    // Object API-------------
    choice = <const T extends { [key: string]: () => W.Widget }>(p: Widget_choices_config<T>) =>
        new Widget_choices(this, this.schema, { multi: false, ...p })
    choices = <const T extends { [key: string]: () => W.Widget }>(p: Widget_choices_config<T>) =>
        new Widget_choices(this, this.schema, { multi: true, ...p })

    _FIX_INDENTATION = _FIX_INDENTATION

    /** (@internal); */
    _cache: { count: number } = { count: 0 }

    /** (@internal) will be set at builer creation, to allow for dyanmic recursive forms */
    _ROOT!: Widget_group<any>

    /** (@internal) advanced way to restore form state. used internally */
    _HYDRATE = (type: W.Widget['type'], input: any, serial?: any): any => {
        if (type === 'optional') return new Widget_optional(this, this.schema, input, serial)
        if (type === 'bool') return new Widget_bool(this, this.schema, input, serial)
        if (type === 'str') return new Widget_str(this, this.schema, input, serial)
        if (type === 'choices') return new Widget_choices(this, this.schema, input, serial)
        if (type === 'number') return new Widget_number(this, this.schema, input, serial)
        if (type === 'group') return new Widget_group(this, this.schema, input, serial)
        if (type === 'color') return new Widget_color(this, this.schema, input, serial)

        if (type === 'inlineRun') return new W.Widget_inlineRun(this, this.schema, input, serial)
        if (type === 'seed') return new W.Widget_seed(this, this.schema, input, serial)
        if (type === 'matrix') return new W.Widget_matrix(this, this.schema, input, serial)
        if (type === 'prompt') return new W.Widget_prompt(this, this.schema, input, serial)
        if (type === 'promptOpt') return new W.Widget_promptOpt(this, this.schema, input, serial)
        if (type === 'loras') return new W.Widget_loras(this, this.schema, input, serial)
        if (type === 'image') return new W.Widget_image(this, this.schema, input, serial)
        if (type === 'imageOpt') return new W.Widget_imageOpt(this, this.schema, input, serial)
        if (type === 'enum') return new W.Widget_enum(this, this.schema, input, serial)
        if (type === 'enumOpt') return new W.Widget_enumOpt(this, this.schema, input, serial)
        if (type === 'list') return new W.Widget_list(this, this.schema, input, serial)
        if (type === 'listExt') return new W.Widget_listExt(this, this.schema, input, serial)
        if (type === 'selectOne') return new W.Widget_selectOne(this, this.schema, input, serial)
        if (type === 'selectMany') return new W.Widget_selectMany(this, this.schema, input, serial)
        if (type === 'size') return new W.Widget_size(this, this.schema, input, serial)
        if (type === 'markdown') return new W.Widget_markdown(this, this.schema, input, serial)
        if (type === 'custom') return new W.Widget_custom(this, this.schema, input, serial)
        if (type === 'orbit') return new W.Widget_orbit(this, this.schema, input, serial)
        if (type === 'orbit') return new W.Widget_orbit(this, this.schema, input, serial)
        console.log(`🔴 unknown type ${type}`)
        exhaust(type)
    }
}
