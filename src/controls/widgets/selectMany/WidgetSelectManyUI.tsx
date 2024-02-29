import type { BaseSelectEntry } from '../selectOne/WidgetSelectOne'
import type { Widget_selectMany } from './WidgetSelectMany'

import { observer } from 'mobx-react-lite'

import { SelectUI } from 'src/rsuite/SelectUI'

export const WidgetSelectManyUI = observer(function WidgetSelectOneUI_<T extends BaseSelectEntry>(p: {
    widget: Widget_selectMany<T>
}) {
    const widget = p.widget
    return (
        <SelectUI<T>
            multiple
            getLabelText={(t) => t.label ?? t.id}
            getLabelUI={(t) => t.label ?? t.id}
            options={() => widget.choices}
            value={() => widget.serial.values}
            equalityCheck={(a, b) => a.id === b.id}
            onChange={(selectOption) => widget.toggleItem(selectOption)}
        />
    )
})
