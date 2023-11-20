import type { StepL, StepOutput } from 'src/models/Step'

import { observer } from 'mobx-react-lite'
import { ReactNode } from 'react'
import { Button, Message, Panel } from 'src/rsuite/shims'
import { exhaust } from '../../utils/misc/ComfyUtils'
import { ImageUI } from '../galleries/ImageUI'
import { ButtonDownloadFilesUI } from './ButtonDownloadFilesUI'
import { ButtonOpenInComfyUI } from './ButtonOpenInComfyUI'
import { GraphSummaryUI } from './GraphSummaryUI'
import { useSt } from 'src/state/stateContext'
import { JsonViewUI } from './JsonViewUI'

export const OutputWrapperUI = observer(function OutputWrapperUI_(p: { label: string; children: ReactNode }) {
    return (
        <div className='flex flex-rowcol-info virtualBorder'>
            {p.label ? (
                <div className='flex items-baseline'>
                    <div className='font-bold'>{p.label}</div>
                    <div>{p.children}</div>
                </div>
            ) : (
                p.children
            )}
        </div>
    )
})

export const StepOutputUI = observer(function StepOutputUI_(p: { step: StepL; output: StepOutput }) {
    const msg = p.output
    const outputGraph = p.step.outputGraph.item
    const db = outputGraph.db
    const st = useSt()
    if (msg.type === 'print') {
        return (
            <OutputWrapperUI label=''>
                <div className='text-base'>{msg.message}</div>
            </OutputWrapperUI>
        )
    }

    if (msg.type === 'prompt') {
        const prompt = db.prompts.get(msg.promptID)
        const graph = prompt?.graph.item
        if (graph == null) return <>no graph</>
        // const currNode = graph.currentExecutingNode
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex flex-wrap'>
                    {prompt?.images.map((img) => (
                        <ImageUI key={img.id} img={img} />
                    ))}
                </div>
                {/* {currNode && <ComfyNodeUI node={currNode} />} */}
                {graph.done ? null : (
                    <Button
                        tw='self-end'
                        size='xs'
                        appearance='ghost'
                        onClick={() => {
                            st.stopCurrentPrompt()
                        }}
                    >
                        STOP GENERATING
                    </Button>
                )}
                <GraphSummaryUI graph={graph} />
            </div>
        )
    }

    if (msg.type === 'execution_error') {
        // const prompt = graph.db.prompts.get(msg.data.prompt_id)
        // const graph = prompt?.graph.item
        // console.log(toJS(msg.data)) 🔴 TODO: fix this so more infos are shown
        return (
            <div>
                <ButtonDownloadFilesUI graph={outputGraph} />
                <ButtonOpenInComfyUI graph={outputGraph} />
                <Message type='error' header='Execution error' showIcon>
                    <div>node: {msg.data.node_type}</div>
                    <div>{msg.data.exception_message}</div>
                    <div>{msg.data.exception_type}</div>
                    <Panel header='Details' collapsible defaultExpanded={false}>
                        <pre>{JSON.stringify(msg.data, null, 3)}</pre>
                    </Panel>
                </Message>
            </div>
        )
    }
    if (msg.type === 'executed') return <div>✅</div>
    if (msg.type === 'runtimeError')
        return (
            <Panel
                header={
                    <div className='flex items-center bg-red-950'>
                        <div tw='flex-grow'>❌ Runtime Error: {msg.message}</div>
                        {msg.graphID ? (
                            <div tw='shrink-0'>
                                <ButtonDownloadFilesUI graph={msg.graphID} />
                                <ButtonOpenInComfyUI graph={outputGraph} />
                            </div>
                        ) : null}
                    </div>
                }
            >
                <JsonViewUI value={JSON.parse(JSON.stringify(msg.infos))} />
                {/* <pre>{JSON.stringify(msg.infos?.message, null, 3)}</pre> */}
                {/* <pre>{JSON.stringify(msg.infos?.message, null, 3)}</pre> */}
                {/* <pre>{JSON.stringify(msg.infos, null, 3)}</pre> */}
            </Panel>
        )

    if (msg.type === 'show-html')
        return (
            <Panel>
                <div>{msg.title}</div>
                <div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
            </Panel>
        )
    exhaust(msg)
    return <div className='border'>❌ unhandled message of type `{(msg as any).type}`</div>
})
