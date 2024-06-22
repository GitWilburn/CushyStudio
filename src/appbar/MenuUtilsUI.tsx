import { observer } from 'mobx-react-lite'

import { KEYS } from '../app/shortcuts/shorcutKeys'
import { Dropdown } from '../csuite/dropdown/Dropdown'
import { MenuItem } from '../csuite/dropdown/MenuItem'
import { useSt } from '../state/stateContext'

export const MenuUtilsUI = observer(function MenuUtilsUI_(p: {}) {
    const st = useSt()
    return (
        <Dropdown
            // startIcon={<span className='material-symbols-outlined text-green-400'>code</span>}
            // startIcon={<span className='material-symbols-outlined'>code</span>}
            title='Utils'
            content={() => (
                <>
                    <MenuItem
                        onClick={() => st.layout.FOCUS_OR_CREATE('Models', {})}
                        icon='cdiExternalCivitai'
                        shortcut={KEYS.openPage_Models}
                        label='Civitai (fast and clean)'
                    />
                    <MenuItem
                        onClick={() => st.layout.FOCUS_OR_CREATE('Civitai', {})}
                        icon='cdiExternalCivitai'
                        shortcut={KEYS.openPage_Civitai}
                        label='Civitai (iframe)'
                    />

                    <MenuItem
                        onClick={() => st.layout.FOCUS_OR_CREATE('Squoosh', {})}
                        icon={'cdiExternalSquoosh'}
                        shortcut={KEYS.openPage_Squoosh}
                        label='Squoosh'
                    />
                    <MenuItem
                        onClick={() => st.layout.FOCUS_OR_CREATE('IFrame', { url: 'https://app.posemy.art/' })}
                        iconClassName='text-red-400'
                        icon='mdiBrush'
                        shortcut={KEYS.openPage_Posemy}
                        label='3d Poser (posemy.art)'
                    />
                    <MenuItem
                        onClick={() => st.layout.FOCUS_OR_CREATE('Paint', {})}
                        iconClassName='text-red-400'
                        icon='mdiBrush'
                        shortcut={KEYS.openPage_Paint}
                        label='Minipaint'
                    />
                    <MenuItem
                        onClick={() => st.layout.FOCUS_OR_CREATE('IFrame', { url: 'https://unsplash.com/' })}
                        iconClassName='text-purple-400'
                        icon='mdiImageSearch'
                        shortcut={KEYS.openPage_Unsplash}
                        label='Unsplash - Free images'
                    />
                </>
            )}
        />
    )
})
