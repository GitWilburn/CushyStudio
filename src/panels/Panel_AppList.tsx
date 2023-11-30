import { observer } from 'mobx-react-lite'
import SortableList, { SortableItem } from 'react-easy-sort'
import { PkgUI, AppEntryInvalidUI, AppEntryUI } from '../cards/CardPicker2UI'
import { useSt } from '../state/stateContext'
import { Joined } from 'src/rsuite/shims'

export const Panel_AppList = observer(function Panel_AppList_(p: {}) {
    const st = useSt()
    const library = st.library
    return (
        <>
            <div tw='flex w-full'>
                <button tw='btn btn-sm btn-active flex-grow' onClick={() => st.toggleFullLibrary()}>
                    <span className='material-symbols-outlined'>view_list</span>
                    Library
                </button>
                <button tw='btn btn-sm' onClick={() => library.decksSorted.forEach((d) => (d.folded = true))}>
                    <span className='material-symbols-outlined'>minimize</span>
                </button>
            </div>
            {/* FAVORITES */}
            {library.allFavorites.length ? (
                <div
                    tw='bg-base-200 cursor-pointer items-center gap-1  hover:bg-base-300  flex justify-between'
                    onClick={() => (library.favoritesFolded = !library.favoritesFolded)}
                >
                    <div>
                        <span
                            //
                            style={{ fontSize: '2rem' }}
                            tw='text-yellow-500'
                            className='material-symbols-outlined'
                        >
                            star
                        </span>
                    </div>
                    <div tw='flex-1 text-base-content font-bold'>Favorites</div>
                    <div>{library.favoritesFolded ? '▸' : '▿'}</div>
                </div>
            ) : null}
            {library.favoritesFolded ? null : ( //
                <SortableList onSortEnd={library.moveFavorite} className='list' draggedItemClassName='dragged'>
                    {library.allFavorites.map((fav, ix) => (
                        //
                        <SortableItem key={fav.appPath}>
                            {/* 👇 wrapper div so SortableItem work */}
                            <div>
                                {fav.app ? ( //
                                    <AppEntryUI key={fav?.appPath} app={fav.app} />
                                ) : (
                                    <AppEntryInvalidUI appPath={fav.appPath} />
                                )}
                            </div>
                        </SortableItem>
                    ))}
                </SortableList>
            )}

            {/* INSTALLED */}
            <div tw='flex flex-col'>
                {library.decksSorted.map((pack) => (
                    <PkgUI key={pack.folderRel} deck={pack} />
                ))}
            </div>
        </>
    )
})
