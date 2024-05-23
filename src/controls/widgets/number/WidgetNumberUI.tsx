import type { Widget_number } from './WidgetNumber'

import { observer } from 'mobx-react-lite'

import { Ikon } from '../../../icons/iconHelpers'
import { Button } from '../../../rsuite/button/Button'
import { InputNumberUI } from './InputNumberUI'

export const WidgetNumberUI = observer(function WidgetNumberUI_(p: { widget: Widget_number }) {
    const widget = p.widget
    const value = widget.serial.val
    const mode = widget.config.mode
    const step = widget.config.step ?? (mode === 'int' ? 1 : 0.1)

    return (
        <>
            <InputNumberUI
                //
                mode={mode}
                value={value}
                hideSlider={widget.config.hideSlider}
                max={widget.config.max}
                min={widget.config.min}
                softMin={widget.config.softMin}
                softMax={widget.config.softMax}
                step={step}
                suffix={widget.config.suffix}
                text={widget.config.text}
                onValueChange={(next) => (widget.value = next)}
                forceSnap={widget.config.forceSnap}
            />
            <Button icon='mdiUndoVariant' disabled={!widget.isChanged} onClick={() => widget.reset()}></Button>
        </>
    )
})
