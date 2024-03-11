import { observer, useLocalObservable } from 'mobx-react-lite'

import { useSt } from '../state/stateContext'
import { ImageUI } from '../widgets/galleries/ImageUI'
import { PanelHeaderUI } from './PanelHeader'
import { FormUI } from 'src/controls/FormUI'
import { OutputPreviewWrapperUI } from 'src/outputs/OutputPreviewWrapperUI'
import { SelectUI } from 'src/rsuite/SelectUI'
import { SpacerUI } from 'src/controls/widgets/spacer/SpacerUI'
import { RevealUI } from 'src/rsuite/reveal/RevealUI'

export const Panel_Gallery = observer(function VerticalGalleryUI_(p: {}) {
    const st = useSt()
    return (
        <div //
            className='flex flex-col bg-base-00 h-full'
            style={{ background: st.galleryConf.value.galleryBgColor }}
        >
            <PanelHeaderUI>
                <SpacerUI />
                <RevealUI tw='WIDGET-FIELD' title='Gallery Options'>
                    <div tw='flex px-1 cursor-default bg-base-200 rounded w-full h-full items-center justify-center hover:brightness-125 border border-base-100'>
                        <span className='material-symbols-outlined'>settings</span>
                        <span className='material-symbols-outlined'>expand_more</span>
                    </div>
                    <GalleryControlsUI />
                </RevealUI>
            </PanelHeaderUI>
            <div tw='flex gap-1'>
                <input
                    tw='input my-0.5 input-xs'
                    placeholder='filter (unfinished)'
                    value={cushy.galleryFilterTag ?? ''}
                    type='text'
                    onChange={(x) => {
                        const next = x.target.value
                        if (!next) cushy.galleryFilterTag = null
                        else cushy.galleryFilterTag = next
                    }}
                />
                <SelectUI
                    key='45'
                    label='app'
                    options={() => cushy.db.cushy_apps.live((q) => q.select(['id', 'name']).compile()).all}
                    getLabelText={(i) => i.name ?? 'unnamed'}
                    value={() => cushy.galleryFilterAppName}
                    equalityCheck={(a, b) => a.id === b.id}
                    onChange={(next) => (cushy.galleryFilterAppName = next)}
                />
            </div>

            <div className='flex flex-wrap overflow-auto bg-base-300'>
                {/* <LatentPreviewUI /> */}
                {st.imageToDisplay.all.map((img_) => {
                    const img = st.db.media_images.get(img_.id)!
                    return (
                        <OutputPreviewWrapperUI //
                            size={st.galleryConf.get('gallerySize')}
                            key={img.id}
                            output={img}
                        >
                            <ImageUI tw='!rounded-none cursor-default' img={img} />
                        </OutputPreviewWrapperUI>
                    )
                })}
            </div>
        </div>
    )
})

export const LatentPreviewUI = observer(function LatentPreviewUI_(p: {}) {
    const st = useSt()
    const preview = st.latentPreview
    if (preview == null) return
    return (
        <img
            //
            style={{
                objectFit: 'contain',
                opacity: 1,
                padding: '0.2rem',
                borderRadius: '.5rem',
                width: st.gallerySizeStr,
                height: st.gallerySizeStr,
            }}
            src={preview.url}
        />
    )
})

export const FieldAndLabelUI = observer(function SubtlePanelConfUI_(p: { label: string; children: React.ReactNode }) {
    return (
        <div tw='line'>
            <div tw='text-base-content'>{p.label}</div>
            {p.children}
        </div>
    )
})

export const GalleryControlsUI = observer(function GalleryControlsUI_(p: { children?: React.ReactNode }) {
    const st = useSt()
    return (
        <div tw='flex flex-col overflow-auto gap-2 px-2 bg-base-200 w-full flex-shrink-0 min-w-80'>
            <FormUI form={st.galleryConf} />
        </div>
    )
})

//     const st = useSt()
//     // const preview = st.preview
//             {p.children}
//             <FieldAndLabelUI label='Preview Size'>
//                 <InputNumberUI
//                     style={{ width: '5rem' }}
//                     min={32}
//                     max={200}
//                     mode='int'
//                     onValueChange={(next) => (st.gallerySize = next)}
//                     value={st.gallerySize}
//                 />
//             </FieldAndLabelUI>
//             <FieldAndLabelUI label='Number of items'>
//                 <InputNumberUI
//                     style={{ width: '5rem' }}
//                     min={5}
//                     max={200}
//                     mode='int'
//                     onValueChange={(next) => st.configFile.set('galleryMaxImages', next)}
//                     value={st.configFile.get('galleryMaxImages') ?? 50}
//                 />
//             </FieldAndLabelUI>
//             <FieldAndLabelUI label='background'>
//                 <div tw='join'>
//                     <Button
//                         tw='btn-neutral join-item '
//                         icon={<span className='material-symbols-outlined'>format_color_reset</span>}
//                         size='xs'
//                         onClick={() => st.configFile.update({ galleryBgColor: undefined })}
//                     />
//                     <Input
//                         tw='join-item input-xs'
//                         type='color'
//                         value={st.configFile.value.galleryBgColor || '#000000'}
//                         onChange={(ev) => st.configFile.update({ galleryBgColor: ev.target.value })}
//                     />
//                 </div>
//             </FieldAndLabelUI>
//             {/* <FieldAndLabelUI label='full-screen'>
//                 <Toggle
//                     checked={st.showPreviewInFullScreen ?? true}
//                     onChange={(ev) => (st.showPreviewInFullScreen = ev.target.checked)}
//                 />
//             </FieldAndLabelUI> */}
//             <FieldAndLabelUI label='in-panel'>
//                 <Toggle checked={st.showPreviewInPanel} onChange={(ev) => (st.showPreviewInPanel = ev.target.checked)} />
//             </FieldAndLabelUI>
//             <FieldAndLabelUI label='hover opacity'>
//                 <Slider
//                     style={{ width: '5rem' }}
//                     step={0.01}
//                     min={0}
//                     max={1}
//                     onChange={(ev) => (st.galleryHoverOpacity = parseFloatNoRoundingErr(ev.target.value))}
//                     value={st.galleryHoverOpacity}
//                 />
//             </FieldAndLabelUI>
