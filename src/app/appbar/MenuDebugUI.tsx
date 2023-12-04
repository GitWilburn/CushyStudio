import { observer } from 'mobx-react-lite'
import { Dropdown, MenuItem } from 'src/rsuite/Dropdown'
import { useSt } from '../../state/stateContext'

export const MenuDebugUI = observer(function MenuDebugUI_(p: {}) {
    const st = useSt()

    return (
        <Dropdown
            appearance='subtle'
            startIcon={<span className='material-symbols-outlined text-orange-500'>sync</span>}
            title='Debug'
        >
            <MenuItem
                icon={<span className='material-symbols-outlined text-orange-500'>panorama_horizontal</span>}
                onClick={st.layout.resetCurrent}
                label='Fix Layout'
            />
            <MenuItem
                icon={<span className='material-symbols-outlined text-orange-500'>sync</span>}
                onClick={st.restart}
                label='Reload'
            />
            <div tw='divider my-0' />
            <MenuItem
                //
                // tw={[st.db.healthColor]}
                onClick={() => {
                    st.db.reset()
                    st.restart()
                }}
                icon={<span className='material-symbols-outlined text-red-500'>sync</span>}
            >
                Reset DB
                {/* ({st.db.health.sizeTxt}) */}
            </MenuItem>
            <MenuItem //
                icon={<span className='material-symbols-outlined text-red-500'>bug_report</span>}
                onClick={st.electronUtils.toggleDevTools}
                label='console'
            />
            <MenuItem
                icon={<span className='material-symbols-outlined text-red-500'>sync</span>}
                onClick={st.fullReset_eraseConfigAndSchemaFilesAndDB}
                label='Full Reset'
            />
            <div tw='divider my-0' />
            <MenuItem //
                icon={<span className='material-symbols-outlined text-purple-500'>storage</span>}
                onClick={st.db.migrate}
                label='Migrate'
            />
            <MenuItem //
                icon={<span className='material-symbols-outlined text-purple-500'>group_work</span>}
                onClick={st.db.runCodegen}
                label='CodeGen'
            />
        </Dropdown>
    )
})
