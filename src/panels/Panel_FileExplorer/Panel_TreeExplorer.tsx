import { observer } from 'mobx-react-lite'

import { useSt } from '../../state/stateContext'
import { TreeUI } from '../libraryUI/tree/tree/TreeUI'
import { PanelHeaderUI } from '../PanelHeader'
import { LibraryHeaderUI } from './TreeExplorerHeader'

export const Panel_TreeExplorer = observer(function Panel_TreeExplorer_(p: {}) {
    const st = useSt()
    return (
        <>
            <PanelHeaderUI>
                <LibraryHeaderUI />
            </PanelHeaderUI>
            {/* <TreeUI shortcut='mod+1' title='Apps' tw='flex-1 overflow-auto' treeView={st.tree1View} /> */}
            <TreeUI shortcut='mod+2' title='File Explorer' tw='flex-2 overflow-auto' treeView={st.tree2View} />
        </>
    )
})
