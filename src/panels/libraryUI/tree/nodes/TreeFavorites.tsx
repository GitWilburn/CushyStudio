import type { DraftL } from 'src/models/Draft'
import type { STATE } from 'src/state/state'
import type { ITreeElement, ITreeEntry } from '../TreeEntry'

import { TreeNode } from '../xxx/TreeNode'
import { TreeApp } from './TreeApp'
import { TreeAppFolder } from './TreeAppFolders'
import { TreeDraft } from './TreeDraft'
import { TreeDraftFolder } from './TreeDraftFolders'
import { VirtualFolder } from '../../VirtualHierarchy'

export class TreeFavoriteApps implements ITreeEntry {
    isFolder = true
    icon = (<span className='material-symbols-outlined _text-yellow-500'>star</span>)
    name = 'Favorite Apps'
    constructor(public st: STATE, p: {}) {}
    onPrimaryAction = (n: TreeNode) => n.toggle()
    children = (): ITreeElement<CushyAppID>[] => {
        return this.st.favoriteApps.map((app): ITreeElement<CushyAppID> => ({ ctor: TreeApp, key: app.id, props: app.id }))
    }
}

export class TreeFavoriteDrafts implements ITreeEntry {
    isFolder = true
    icon = (<span className='material-symbols-outlined _text-blue-500'>star</span>)
    name = 'Favorite Drafts'
    constructor(public st: STATE, p: {}) {}
    onPrimaryAction = (n: TreeNode) => n.toggle()
    children = (): ITreeElement<DraftL>[] => {
        return this.st.favoriteDrafts.map((draft): ITreeElement<DraftL> => ({ ctor: TreeDraft, key: draft.id, props: draft }))
    }
}

export class TreeAllDrafts implements ITreeEntry {
    isFolder = true
    icon = (<span className='material-symbols-outlined _text-blue-500'>palette</span>)
    name = 'All Drafts'
    constructor(public st: STATE, p: {}) {}
    onPrimaryAction = (n: TreeNode) => n.toggle()
    children = (): ITreeElement<any>[] => {
        const vh = this.st.virtualDraftHierarchy
        console.log( `[👙] AAAA`, vh.items.map((i) => i.virtualFolder) ) // prettier-ignore
        console.log(`[👙] AAAA`, vh.getTopLevelFolders())
        return [
            ...vh.getTopLevelFolders().map(
                (folderPath): ITreeElement<VirtualFolder> => ({
                    ctor: TreeDraftFolder,
                    key: folderPath,
                    props: { folderPath, vh },
                }),
            ),
            ...vh.topLevelItems.map(
                (draft): ITreeElement<DraftL> => ({
                    ctor: TreeDraft,
                    key: draft.id,
                    props: draft,
                }),
            ),
        ]
    }
}

export class TreeAllApps implements ITreeEntry {
    isFolder = true
    icon = (<span className='material-symbols-outlined _text-yellow-500'>palette</span>)
    name = 'All Apps'
    constructor(public st: STATE, p: {}) {}
    onPrimaryAction = (n: TreeNode) => n.toggle()
    children = (): ITreeElement<any>[] => {
        const vh = this.st.virtualAppHierarchy
        return [
            ...vh.getTopLevelFolders().map(
                (folderPath): ITreeElement<VirtualFolder> => ({
                    ctor: TreeAppFolder,
                    key: folderPath,
                    props: { folderPath, vh },
                }),
            ),
            ...vh.topLevelItems.map((app): ITreeElement<CushyAppID> => ({ ctor: TreeApp, key: app.id, props: app.id })),
        ]
    }
}
