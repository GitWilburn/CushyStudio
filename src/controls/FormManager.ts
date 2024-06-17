import type { BaseWidget } from './BaseWidget'
import type { IFormBuilder } from './IFormBuilder'
import type { ISpec, SchemaDict } from './ISpec'
import type { Widget_group } from './widgets/group/WidgetGroup'

import { type DependencyList, useMemo } from 'react'

import { runWithGlobalForm } from './context/runWithGlobalForm'
import { Form, FormProperties } from './Form'

/**
 * you need one per project;
 * singleton.
 * allow to inject the proper form config for your specific project.
 * to avoid problem with hot-reload, export an instance from a module directly and use it from there.
 */
export class FormManager<BUILDER extends IFormBuilder> {
    //
    _allForms: Map<string, Form> = new Map()
    _allWidgets: Map<string, BaseWidget> = new Map()
    _allWidgetsByType: Map<string, Map<string, BaseWidget>> = new Map()

    getFormByID = (uid: string): Maybe<Form> => {
        return this._allForms.get(uid)
    }

    getWidgetByID = (widgetUID: string): Maybe<BaseWidget> => {
        return this._allWidgets.get(widgetUID)
    }

    /**
     * return all currently instanciated widgets
     * field of a given input type
     */
    getWidgetsByType = <W extends BaseWidget = BaseWidget>(type: string): W[] => {
        const typeStore = this._allWidgetsByType.get(type)
        if (!typeStore) return []
        return Array.from(typeStore.values()) as W[]
    }

    constructor(
        //
        public builderCtor: { new (form: Form<any /* SchemaDict */, BUILDER>): BUILDER },
    ) {}

    _builders = new WeakMap<Form, BUILDER>()

    getBuilder = (form: Form<any, BUILDER>): BUILDER => {
        const prev = this._builders.get(form)
        if (prev) return prev
        const builder = new this.builderCtor(form)
        this._builders.set(form, builder)
        return builder
    }

    /** LEGACY API; TYPES ARE COMPLICATED DUE TO MAINTAINING BACKWARD COMPAT */
    fields = <FIELDS extends SchemaDict>(
        ui: (form: BUILDER) => FIELDS,
        formProperties: FormProperties<ISpec<Widget_group<FIELDS>>, BUILDER> = { name: 'unnamed' },
    ): Form<ISpec<Widget_group<FIELDS>>, BUILDER> => {
        const FN = (builder: BUILDER): ISpec<Widget_group<FIELDS>> => {
            return runWithGlobalForm(builder, () =>
                builder.group({
                    label: false,
                    items: ui(builder as BUILDER),
                    collapsed: false,
                }),
            )
        }
        const form = new Form<ISpec<Widget_group<FIELDS>>, BUILDER>(this, FN, formProperties)
        return form
    }

    /** simple alias to create a new Form */
    form = <ROOT extends ISpec>(
        ui: (form: BUILDER) => ROOT,
        formProperties: FormProperties<ROOT, BUILDER> = { name: 'unnamed' },
    ): Form<ROOT, BUILDER> => {
        return new Form<ROOT, BUILDER>(this, ui, formProperties)
    }

    /** simple way to defined forms and in react components */
    use = <ROOT extends ISpec>(
        ui: (form: BUILDER) => ROOT,
        formProperties: FormProperties<ROOT, BUILDER> = { name: 'unnamed' },
        deps: DependencyList = [],
    ): Form<ROOT, BUILDER> => {
        return useMemo(() => {
            return new Form<ROOT, BUILDER>(this, ui, formProperties)
        }, deps)
    }
}
