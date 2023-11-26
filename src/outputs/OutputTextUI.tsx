import { observer } from 'mobx-react-lite'
import { StepL } from 'src/models/Step'
import { StepOutput_Text } from 'src/types/MessageFromExtensionToWebview'
import { OutputWrapperUI } from './OutputWrapperUI'
import { OutputPreviewWrapperUI } from './OutputPreviewWrapperUI'

export const OutputTextUI = observer(function OutputTextUI_(p: { step: StepL; output: StepOutput_Text }) {
    return <OutputWrapperUI label=''>{p.output.message}</OutputWrapperUI>
})

export const OutputTextPreviewUI = observer(function OutputTextPreviewUI_(p: { step: StepL; output: StepOutput_Text }) {
    return (
        <OutputPreviewWrapperUI output={p.output}>
            <div tw='text-xs whitespace-pre-wrap overflow-hidden overflow-ellipsis'>{p.output.message}</div>
            <OutputTextUI step={p.step} output={p.output} />
        </OutputPreviewWrapperUI>
    )
})
