import { observer } from 'mobx-react-lite'
import { useSt } from '../../state/stateContext'
import { recursivelyFindAppsInFolder } from 'src/cards/walkLib'

export const LibraryHeaderUI = observer(function LibraryHeaderUI_(p: {}) {
    const st = useSt()
    const library = st.library
    return (
        <div tw='flex w-full'>
            <IndexAllAppsBtnUI />
            <div tw='btn btn btn-sm btn-active flex-grow' onClick={() => st.toggleFullLibrary()}>
                {/* <span className='material-symbols-outlined'>view_list</span> */}
                Browse
            </div>
            {/* <button tw='btn btn-sm' onClick={() => library.decksSorted.forEach((d) => (d.folded = true))}>
                <span className='material-symbols-outlined'>minimize</span>
            </button> */}
        </div>
    )
})

export const IndexAllAppsBtnUI = observer(function IndexAllAppsBtnUI_(p: {}) {
    const st = useSt()
    return (
        <div
            tw='btn-sm btn btn-primary'
            onClick={async () => {
                //
                // throw new Error('not implemented; should walk, list all apps, and compile them to executable')
                const allFiles = recursivelyFindAppsInFolder(st.library, st.libraryFolderPathAbs)
                console.log(`[👙] allFiles:`, allFiles.length)
                for (const x of allFiles) await x.extractScriptFromFile()
            }}
        >
            Index All Apps
        </div>
    )
})
