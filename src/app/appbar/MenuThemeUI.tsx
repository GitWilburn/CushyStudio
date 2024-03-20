import { observer } from 'mobx-react-lite'

import { useSt } from '../../state/stateContext'
import { ThemePreviewUI } from './utils/ThemePreviewUI'
import { Dropdown } from '../../rsuite/Dropdown'

export const MenuThemeUI = observer(function MenuThemeUI_(p: {}) {
    const st = useSt()
    return (
        <Dropdown //
            startIcon={<span className='material-symbols-outlined text-primary'>color_lens</span>}
            title='Theme'
        >
            {st.themeMgr.themes.map((theme) => (
                <div
                    tw='cursor-pointer hover:bg-base-300 p-0.5'
                    key={theme}
                    // icon={<span className='text-orange-400 material-symbols-outlined'>sync</span>}
                    onClick={(ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        st.themeMgr.theme = theme
                    }}
                >
                    <ThemePreviewUI theme={theme} />
                </div>
            ))}
        </Dropdown>
    )
})
