import type { BaseField } from '../BaseField'
import type { Widget_optional } from '../widgets/optional/WidgetOptional'

import { observer } from 'mobx-react-lite'

import { InputBoolUI } from '../../csuite/checkbox/InputBoolUI'
import { isWidgetOptional } from '../widgets/WidgetUI.DI'

export const Widget_ToggleUI = observer(function Widget_ToggleUI_(p: { className?: string; widget: BaseField }) {
    if (!isWidgetOptional(p.widget)) return null
    const widget = p.widget as Widget_optional
    return (
        <InputBoolUI // toggle to activate/deactivate the optional widget
            className={p.className}
            value={widget.serial.active}
            expand={false}
            onValueChange={(value) => widget.setActive(value)}
        />
    )
})
