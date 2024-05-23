import type { IWidget } from '../IWidget'

import { isWidgetGroup } from '../widgets/WidgetUI.DI'

export const getBorderStatusForWidget = (widget: IWidget): boolean => {
    // avoif borders for the top level form
    if (widget.parent == null) return false
    // if (widget.parent.subWidgets.length === 0) return false
    // if app author manually specify they want no border, then we respect that
    if (widget.config.border != null) return widget.config.border
    // if the widget override the default border => we respect that
    if (widget.border != null) return widget.border
    // if the widget do NOT have a body => we do not show the border
    if (widget.DefaultBodyUI == null) return false // 🔴 <-- probably a mistake here
    // default case when we have a body => we show the border
    return true
}
