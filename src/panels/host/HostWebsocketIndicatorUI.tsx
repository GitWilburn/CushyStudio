import { observer } from 'mobx-react-lite'
import { HostL } from 'src/models/Host'
import { RevealUI } from 'src/rsuite/RevealUI'
import { Message } from 'src/rsuite/shims'
import { useSt } from '../../state/stateContext'

export const HostWebsocketIndicatorUI = observer(function HostWebsocketIndicatorUI_(p: {
    //
    showIcon?: boolean
    host: HostL
}) {
    const st = useSt()
    const ws = p.host.ws
    if (p.host.data.isVirtual)
        return (
            <RevealUI showDelay={0}>
                <div tw='btn btn-sm text-opacity-25'>WS</div>
                <div tw='p-2'>Not Applicable</div>
            </RevealUI>
        )
    return (
        <RevealUI showDelay={0}>
            {ws?.isOpen ? (
                <div tw='btn btn-sm'>
                    {p.showIcon && <span className='material-symbols-outlined text-green-400 '>check_circle</span>}
                    <span className='text-success'>WS</span>
                </div>
            ) : (
                <div tw='btn btn-sm btn-error flex-nowrap'>
                    <div tw='loading loading-spinner loading-xs' />
                    WS
                </div>
            )}
            <div tw='menu'>
                {ws?.isOpen ? null : (
                    <Message showIcon type='warning'>
                        <span>Is your ComfyUI server running? </span>
                        <span>You config file says it should be accessible at</span>
                        <div>{st.getWSUrl()}</div>
                    </Message>
                )}
                {ws?.debugMessages.map((x, ix) =>
                    x.type === 'error' ? ( //
                        <div key={ix} className='text-red-400'>
                            {x.message}
                        </div>
                    ) : (
                        <div key={ix}>{x.message}</div>
                    ),
                )}
            </div>
        </RevealUI>
    )
})
