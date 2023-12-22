import type * as R from 'src/controls/Widget'
import { WidgetDI } from '../widgets/WidgetUI.DI'

export function isWidgetCollapsible(req: R.Widget): boolean {
    const KLS = WidgetDI
    if (req instanceof KLS.Widget_markdown) return true
    if (req instanceof KLS.Widget_custom) return true
    if (req instanceof KLS.Widget_image) return true
    if (req instanceof KLS.Widget_imageOpt) return true
    if (req instanceof KLS.Widget_size) return true
    if (req instanceof KLS.Widget_matrix) return true
    if (req instanceof KLS.Widget_group) return true
    if (req instanceof KLS.Widget_groupOpt) return true
    if (req instanceof KLS.Widget_list) return true
    if (req instanceof KLS.Widget_choice) return true
    if (req instanceof KLS.Widget_choiceOpt) return true
    if (req instanceof KLS.Widget_choices) return true
    if (req instanceof KLS.Widget_listExt) return true
    if (req instanceof KLS.Widget_str && req.input.textarea) return true
    if (req instanceof KLS.Widget_prompt) return true
    if (req instanceof KLS.Widget_promptOpt) return true
    return false
}
