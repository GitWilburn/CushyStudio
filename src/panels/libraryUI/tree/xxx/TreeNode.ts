import type { Tree } from './Tree'

import { makeAutoObservable } from 'mobx'

import { SQLITE_false, SQLITE_true } from 'src/db/SQLITE_boolean'
import { asTreeEntryID } from 'src/db/TYPES.gen'
import { TreeEntryL } from 'src/models/TreeEntry'
import { ITreeEntry } from '../TreeEntry'
import { buildTreeItem } from '../nodes/buildTreeItem'
import { FAIL } from './utils'

export type NodeId = string
export type NodeKey = string
export type NodeKeyKind = 'Property' | 'ArrayIndex' | 'unknown'

export type MoveConflictResolution = 'disambiguate' | 'overwrite' | 'fail'
export type NodeData = ITreeEntry

type IArrayLike = { [x: number]: TreeNode }

export const getId = (node: TreeNode | NodeId) => {
    if (typeof node === 'string') return node
    return node.id
}

/** nested array that looks like [child, [parent..]]
 * i.e. ["0",["Foo",["3",["D",["A"]]]]] */
type NodePath = [NodeKey] | [NodeKey, NodePath]

const renderNodePath = (path: NodePath): string => {
    if (path.length === 1) return `/${path[0]}`
    return `${renderNodePath(path[1])}/${path[0]}`
}

export interface TreeNode extends IArrayLike {}
export class TreeNode {
    get opened() {
        return this.entryL.data.isExpanded ?? false
    }
    open() {
        this.data.onExpand?.(this)
        this.entryL.update({ isExpanded: SQLITE_true })
    }
    close() {
        this.entryL.update({ isExpanded: SQLITE_false })
    }
    toggle() {
        if (this.opened) this.close()
        else this.open()
    }

    onPrimaryAction = () => this.data.onPrimaryAction?.(this)
    onFocusItem = () => this.data.onFocusItem?.(this)

    data: ITreeEntry
    id: string
    entryL: TreeEntryL
    constructor(
        //
        public tree: Tree,
        public ref: string,
        public parent: TreeNode | undefined,
    ) {
        this.id = (parent?.id ?? '') + '/' + ref
        // console.log(`[👙] `, this.id)
        this.data = buildTreeItem(this.tree.st, this.ref)
        this.entryL = this.tree.st.db.tree_entries.upsert({ id: asTreeEntryID(this.id) })!
        this.tree.indexNode(this)
        makeAutoObservable(this, { _children_: false })
    }

    get valid() {
        return true
        // if (this.typeName === 'any') return true
        // return false // TODO
    }

    get childrenIds(): NodeId[] {
        return this.data.children?.() ?? []
    }

    _children_: { [ref: string]: TreeNode } = {}
    get children(): TreeNode[] {
        // return []
        const ids = this.childrenIds
        const out: TreeNode[] = []
        for (const childID of ids) {
            // const path = this.id + '/' + childID
            if (this._children_[childID]) {
                out.push(this._children_[childID])
            } else {
                const node = new TreeNode(this.tree, childID, this)
                this._children_[childID] = node
                out.push(node)
            }
        }
        return out
        // return this.tree.getChildrenOf(this.data.id)
    }

    get depth(): number {
        if (this.parent == null) return 0
        return 1 + this.parent.depth
    }

    /** remove node from module */
    delete = () => {
        this.tree.deleteNode(this)
    }

    get siblingsIncludingSelf() {
        if (this.parent == null) return this.tree.topLevelNodes
        return this.parent.children
        // ❌ return this.tree.getChildrenOf(this.parentId)
    }

    get siblingsExcludingSelf() {
        return this.siblingsIncludingSelf.filter((i) => i !== this)
        // ❌ return this.tree.getChildrenOf(this.parentId).filter((i) => i !== this)
    }

    get nextSibling(): TreeNode | undefined {
        let siblings = this.siblingsIncludingSelf
        if (siblings.length === 0) FAIL('IMPOSSIBLE 1')
        if (siblings[siblings.length - 1] === this) return // last of the fratry
        for (let i = 0; i < siblings.length - 1; i++) {
            if (siblings[i] === this) return siblings[i + 1]
        }
        return
    }

    get prevSibling(): TreeNode | undefined {
        let siblings = this.siblingsIncludingSelf
        let self = this
        if (siblings.length === 0) FAIL('IMPOSSIBLE 2')
        if (siblings[0] === self) return // first of the fratry
        for (let i = siblings.length - 1; i > 0; i--) {
            if (siblings[i] === self) return siblings[i - 1]
        }
        return
    }

    /** return the first child of a given node
     * or undefined if node has no child */
    get firstChild(): TreeNode | undefined {
        const children = this.children
        if (children.length === 0) return
        return children[0]
    }

    get_descendant_and_self(mode: 'dfs' | 'bfs') {
        const stack: TreeNode[] = [this]
        let ix: number = 0
        let at: TreeNode | undefined
        while ((at = stack[ix++])) {
            if (mode === 'bfs') stack.push(...at.children)
            else stack.splice(ix, 0, ...at.children)
        }
        return stack
    }

    get lastChild(): TreeNode | undefined {
        if (this.children.length === 0) return
        return this.children[this.children.length - 1]
    }

    /** return the last descendant
     * [a[b,c],x[y,z]] => z */
    get lastDescendant(): TreeNode | undefined {
        let at: TreeNode | undefined = this
        let out: TreeNode | undefined
        while ((at = at.lastChild)) out = at
        return out
    }

    get isRoot(): boolean {
        return this.parent == null
    }

    get root(): TreeNode | undefined {
        let at: TreeNode | undefined = this
        while (at.parent) {
            at = at.parent
        }
        return at
    }

    get rootOrSelf(): TreeNode {
        return this.root ?? this
    }

    get lastOpenedDescendant(): TreeNode | undefined {
        let at: TreeNode | undefined = this
        let out: TreeNode | undefined
        if (!at.opened) return
        while ((at = at.lastChild)) {
            out = at
            if (!at.opened) break
        }
        return out
    }

    get_descendant(mode: 'dfs' | 'bfs') {
        return this.get_descendant_and_self(mode).slice(1)
    }

    get descendantBFS() {
        return this.get_descendant('bfs')
    }

    get descendantDFS() {
        return this.get_descendant('dfs')
    }

    get nodeAboveInView(): TreeNode | undefined {
        return this.prevSibling?.lastOpenedDescendant ?? this.prevSibling ?? this.parent
    }

    get nodeBelowInView(): TreeNode | undefined {
        if (this.opened && this.firstChild) return this.firstChild
        if (this.nextSibling) return this.nextSibling
        let at: TreeNode | undefined = this
        while ((at = at.parent)) if (at.nextSibling) return at.nextSibling
    }
}
