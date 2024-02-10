import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useSt } from '../../state/stateContext'

import * as React from 'react'
import SortableList, { SortableItem } from 'react-easy-sort'
import { MediaImageL } from 'src/models/MediaImage'
import { toastError } from 'src/utils/misc/toasts'
import { useImageDrop } from 'src/widgets/galleries/dnd'
import { UnifiedCanvas } from './states/UnifiedCanvas'
import { useSize } from './useSize'
import { ComboUI } from 'src/app/shortcuts/ComboUI'
import { InputNumberUI } from 'src/rsuite/InputNumberUI'

// https://github.com/devforth/painterro
export const Panel_Canvas = observer(function Panel_Canvas_(p: {
    //
    imgID?: MediaImageID
}) {
    const st = useSt()
    const img0 = st.db.media_images.get(p.imgID!)

    const canvas = useMemo(() => {
        if (img0 == null) throw new Error('img0 is null')
        return new UnifiedCanvas(st, img0)
    }, [img0])

    if (img0 == null) return <>❌ error</>

    // add drop handlers
    const [dropStyle2, dropRef2] = useImageDrop(st, (img) => runInAction(() => canvas.addMask(img)))
    const [dropStyle, dropRef] = useImageDrop(st, (img) => runInAction(() => canvas.addImage(img)))

    // auto-resize canvas
    const size = useSize(canvas.rootRef)
    React.useEffect(() => {
        if (size == null) return
        canvas.stage.width(size.width)
        canvas.stage.height(size.width)
    }, [size?.width, size?.height])

    // auto-mount canvas
    React.useEffect(() => {
        if (canvas.rootRef.current == null) return
        canvas.stage.container(canvas.rootRef.current)
    }, [canvas.rootRef])

    return (
        <div
            //
            style={dropStyle}
            ref={dropRef}
            className='DROP_IMAGE_HANDLER'
            tw='_Panel_Canvas flex-grow flex flex-row h-full'
        >
            <div tw='virtualBorder flex flex-col gap-2'>
                {/* TOP LEVEL BUTTON */}
                <div tw='bd1'>
                    Virtual images for your form
                    <div tw='m-1 flex gap-1'>
                        <div tw='btn btn-square bd1'>Image</div>
                        <div tw='btn btn-square bd1'>Mask</div>
                    </div>
                </div>

                <div tw='bd'>
                    <div
                        tw='btn btn-primary'
                        onClick={() => {
                            //
                            const draft = st.db.drafts.get('HU3BR0X9yd6qB3rWTH3Dd')
                            if (draft == null) return toastError('NAH1')

                            const selection = canvas.activeSelection
                            if (selection == null) return toastError('NAH2')

                            const img = selection.saveImage()
                            if (img == null) return toastError('NAH3')

                            draft.start(null, img)
                        }}
                    >
                        AMAZE YOURSEF
                    </div>
                </div>
                {/* GRID SIZE */}
                <div tw='flex gap-1 items-center'>
                    {/*  */}
                    snap:
                    <input tw='input input-bordered input-sm w-24' type='number' value={canvas.snapSize} />
                    x
                    <input tw='input input-bordered input-sm w-24' type='number' value={canvas.snapSize} />
                </div>

                {/* SELECTIONS */}
                <div tw='bd1'>
                    <div tw='flex items-center justify-between'>
                        Selections
                        <div tw='btn btn-sm btn-square btn-outline' onClick={canvas.addSelection}>
                            <span className='material-symbols-outlined'>add</span>
                        </div>
                    </div>
                    <div tw='w-full bd1 m-1'>
                        {canvas.selections.map((uniSel) => (
                            <div key={uniSel.id} className='flex whitespace-nowrap justify-between'>
                                <div tw='flex gap-1 items-center'>
                                    <input
                                        type='radio'
                                        checked={canvas.activeSelection === uniSel}
                                        onChange={() => (canvas.activeSelection = uniSel)}
                                        name='active'
                                        className='radio'
                                    />
                                    <div>Selection 0</div>
                                </div>
                                <div
                                    //
                                    tw='btn btn-sm btn-square btn-outline'
                                    onClick={uniSel.saveImage}
                                >
                                    <span className='material-symbols-outlined'>save</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* <RevealUI>
                        <pre>{JSON.stringify(uist.stableData, null, 4)}</pre>
                    </RevealUI> */}
                </div>

                <div style={{ border: '1px solid cyan' }}>
                    <div tw='flex items-center gap-2'>
                        Mode:
                        <div
                            onClick={() => (canvas.mode = 'move')}
                            tw={['btn btn-sm', canvas.mode === 'move' ? 'btn-primary' : null]}
                        >
                            Move
                        </div>
                        <div
                            onClick={() => (canvas.mode = 'mask')}
                            tw={['btn btn-sm', canvas.mode === 'mask' ? 'btn-primary' : null]}
                        >
                            Mask
                        </div>
                    </div>
                    <div tw='flex items-center gap-2'>
                        Tool:
                        <div
                            onClick={() => (canvas.maskTool = 'paint')}
                            tw={['btn btn-sm', canvas.maskTool === 'paint' ? 'btn-primary' : null]}
                        >
                            Paint
                        </div>
                        <div
                            onClick={() => (canvas.maskTool = 'erase')}
                            tw={['btn btn-sm', canvas.maskTool === 'erase' ? 'btn-primary' : null]}
                        >
                            Mask
                        </div>
                    </div>
                    <div tw='flex items-center gap-2'>
                        size:
                        <InputNumberUI //
                            mode='int'
                            value={canvas.maskToolSize}
                            onValueChange={(next) => (canvas.maskToolSize = next)}
                            min={1}
                            max={1000}
                        />
                        px
                    </div>
                    <div tw='flex items-center gap-2'>
                        <ComboUI combo={'mod+m'} /> toggle mode
                    </div>
                    <div tw='flex items-center gap-2'>
                        <ComboUI combo={'mod+t'} /> toggle tools
                    </div>
                    <div tw='flex items-center gap-2'>
                        <ComboUI combo={'mod+shift+x'} /> increase tool weight
                    </div>
                    <div tw='flex items-center gap-2'>
                        <ComboUI combo={'mod+shift+y'} /> decrease tool weight
                    </div>
                </div>
                {/* Masks */}
                <div tw='bd1' style={dropStyle2} ref={dropRef2}>
                    <div tw='flex items-center justify-between'>
                        <div>Masks</div>
                        <div
                            tw='btn btn-sm btn-square btn-outline'
                            onClick={() => {
                                canvas.addMask()
                            }}
                        >
                            <span className='material-symbols-outlined'>add</span>
                        </div>
                    </div>
                    {canvas.masks.map((m) => {
                        const active = m === canvas.activeMask
                        return (
                            <div key={m.uid} tw='flex items-center gap-1 w-full'>
                                <input
                                    type='radio'
                                    checked={active}
                                    name='radio-1'
                                    className='radio'
                                    onChange={() => {
                                        canvas.activeMask = m
                                    }}
                                />
                                <div className='flex whitespace-nowrap items-center'>
                                    <div>masks {m.uid}</div>
                                    {/* <div tw='btn btn-square bd1'>Image</div> */}
                                    {/* <div tw='btn btn-square bd1'>Mask</div> */}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* TOP LEVEL BUTTON */}
                <div tw='bd1'>
                    Images
                    <SortableList onSortEnd={() => {}} className='list' draggedItemClassName='dragged'>
                        {canvas.images.map((p: { img: MediaImageL }) => {
                            // const img = p.img
                            return (
                                <SortableItem key={p.img.id}>
                                    <div tw='flex'>
                                        {/*  */}
                                        <input type='radio' name='radio-1' className='radio' />
                                        <input type='checkbox' checked className='checkbox' />
                                        <div tw='btn btn-sm'>{p.img.filename}</div>
                                        <div className='btn btn-square btn-sm btn-ghost'>
                                            <span className='material-symbols-outlined'>delete</span>
                                        </div>
                                    </div>
                                </SortableItem>
                            )
                        })}
                    </SortableList>
                </div>
            </div>
            <div ref={canvas.rootRef} tw='flex-1'></div>
        </div>
    )
})
