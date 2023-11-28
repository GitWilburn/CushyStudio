import type { LiveInstance } from 'src/db/LiveInstance'
import type { HTMLContent, MDContent } from 'src/types/markdown'
import type { Cyto } from '../core/AutolayoutV1'
import type { ComfyNodeID } from '../types/ComfyNodeID'
import type { ComfyPromptJSON } from '../types/ComfyPrompt'
import type { WsMsgExecuting, WsMsgExecutionCached, WsMsgProgress } from '../types/ComfyWsApi'
import type { VisEdges, VisNodes } from '../widgets/misc/VisUI'
import type { ComfyNodeSchema, SchemaL } from './Schema'

import { marked } from 'marked'
import { join } from 'pathe'
import { IDNaminScheemeInPromptSentToComfyUI } from 'src/back/IDNaminScheemeInPromptSentToComfyUI'
import { ComfyWorkflowBuilder } from '../back/NodeBuilder'
import { CytoJSON, runAutolayout } from '../core/AutolayoutV2'
import { comfyColors } from '../core/Colors'
import { LiteGraphJSON, convertFlowToLiteGraphJSON } from '../core/LiteGraph'
import { ComfyNode } from '../core/Node'
import { asHTMLContent, asMDContent } from '../types/markdown'
import { asAbsolutePath } from '../utils/fs/pathUtils'
import { GraphT } from 'src/db2/TYPES.gen'
import { bang } from 'src/utils/misc/bang'

export type RunMode = 'fake' | 'real'

/**
 * graph abstraction
 * - holds the nodes
 * - holds the cyto graph
 * - can be instanciated in both extension and webview
 *   - so no link to workspace or run
 */

// export type GraphID = Branded<string, { GraphID: true }>
// export const asGraphID = (s: string): GraphID => s as any

// export type GraphT = {
//     /** graph ID */
//     id: GraphID
//     createdAt: number
//     updatedAt: number
//     /** graph json */
//     comfyPromptJSON: ComfyPromptJSON
// }

export const GraphIDCache = new Map<string, number>()

export interface GraphL extends LiveInstance<GraphT, GraphL> {}
export class GraphL {
    /** number of node in the graph */
    get size(): number {
        return this.nodes.length
    }

    _problems: { title: string; data?: any }[] = []
    recordProblem = (title: string, data?: any) => {
        this._problems.push({ title, data })
    }

    private _builder: ComfyWorkflowBuilder | null = null
    get builder(): ComfyWorkflowBuilder {
        if (this._builder) return this._builder
        this._builder = new ComfyWorkflowBuilder(this)
        return this._builder
    }

    onUpdate = (prev: Maybe<GraphT>, next: GraphT) => {
        const prevSize = this.size
        if (prev != null) {
            this.nodes = []
            this.nodesIndex.clear()
            this.currentExecutingNode = null
        }
        for (const [uid, node] of Object.entries(bang(next.comfyPromptJSON))) {
            new ComfyNode(this, uid, node)
        }
        // console.log(`[📈] GRAPH: manually updated ${prevSize} => ${this.size}`)
    }

    /** cytoscape instance to live update graph */
    cyto?: Cyto

    get summary1(): string[] {
        return this.nodes.map((n) => n.$schema.nameInCushy)
    }

    // drafts = new LiveCollection<DraftL>(this, 'graphID', 'drafts')
    // childSteps = new LiveCollection<StepL>(this, 'parentGraphID', 'steps')
    // parentSteps = new LiveCollection<StepL>(this, 'outputGraphID', 'steps')

    /** focus step and update selected Draft */
    // ⏸️ focusStepAndUpdateDraft = (step: StepL) => {
    // ⏸️     this.update({ focusedStepID: step.id })
    // ⏸️     if (this.focusedDraft.item == null) return
    // ⏸️     this.focusedDraft.item.update({
    // ⏸️         toolID: step.data.toolID,
    // ⏸️         // params: deepCopyNaive(step.data.params),
    // ⏸️     })
    // ⏸️ }

    /** @internal every node constructor must call this */
    registerNode = (node: ComfyNode<any>) => {
        if (this.data.comfyPromptJSON == null) throw new Error('graph not hydrated')
        this.data.comfyPromptJSON[node.uid] = node.json
        this.nodesIndex.set(node.uid, node)
        this.nodes.push(node)
        this.cyto?.trackNode(node)
        // this.graph.run.cyto.addNode(this)
    }

    /** proxy to this.db.schema */
    get schema() {
        return this.db.schema
    }

    /** nodes, in creation order */
    nodes: ComfyNode<any>[] = []
    get pendingNodes() {
        return this.nodes.filter((n) => n.status == null || n.status === 'waiting')
    }
    get nodesByUpdatedAt() {
        return this.nodes //
            .filter((n) => n.status != null && n.status !== 'waiting')
            .sort((a, b) => b.updatedAt - a.updatedAt)
        // return this.nodes.slice().sort((a, b) => b.updatedAt - a.updatedAt)
    }

    findNodeByType = <T extends ComfyNodeType>(nameInCushy: T): Maybe<Requirable[T]> => {
        return this.nodes.find((n) => n.$schema.nameInCushy === nameInCushy) as any
    }

    /** nodes, indexed by nodeID */
    nodesIndex = new Map<string, ComfyNode<any>>()

    /** convert to mermaid DSL expression for nice graph rendering */
    toMermaid = (): string => {
        const out = [
            // 'graph TD',
            'graph LR',
            this.nodes.map((n) => `${n.uid}[${n.$schema.nameInCushy}]`).join('\n'),
            this.nodes
                .map((n) =>
                    n
                        ._incomingEdges()
                        .map((i) => {
                            const from = this.nodesIndex.get(i.from)

                            return `${from?.uid ?? i.from}[${from?.$schema.nameInCushy ?? i.from}] --> |${i.inputName}|${n.uid}[${
                                n.$schema.nameInCushy
                            }]`
                        })
                        .join('\n'),
                )
                .join('\n'),
        ].join('\n')
        // console.log(out)
        return out
    }

    get json_cyto(): CytoJSON {
        const cytoJSON = runAutolayout(this)
        return cytoJSON
    }

    json_workflow = (): LiteGraphJSON => {
        const cytoJSON = this.json_cyto
        const liteGraphJSON = convertFlowToLiteGraphJSON(this, cytoJSON)
        return liteGraphJSON
        // this.st.writeTextFile(workflowJSONPath, JSON.stringify(liteGraphJSON, null, 4))
    }
    /** return the coresponding comfy prompt  */
    json_forPrompt = (ns: IDNaminScheemeInPromptSentToComfyUI): ComfyPromptJSON => {
        const json: ComfyPromptJSON = {}
        for (const node of this.nodes) {
            if (node.disabled) continue
            // console.log(`🦊 ${node.uid}`)
            if (ns === 'use_stringified_numbers_only') {
                json[node.uid] = node.json
            } else {
                json[node.uidPrefixed] = node.json
            }
        }
        return json
    }

    // 🔴 => move this elsewhere
    // convertToImageInput = (x: GeneratedImage): string => {
    //     return `../outputs/${x.data.filename}`
    //     // return this.LoadImage({ image: name })
    // }

    /** temporary proxy */
    // convertToImageInputOLD1 = async (x: PromptOutputImage): Promise<string> => {
    //     const name = await x.makeAvailableAsInput()
    //     console.log('[convertToImageInput]', { name })
    //     // @ts-ignore
    //     return name
    //     // return this.LoadImage({ image: name })
    // }

    /** @internal pointer to the currently executing node */
    currentExecutingNode: ComfyNode<any> | null = null

    get progressCurrentNode(): Maybe<ProgressReport> {
        const node = this.currentExecutingNode
        if (node == null) return null
        const percent = node.status === 'done' ? 100 : node.progressRatio * 100
        const isDone = node.status === 'done'
        return { percent, isDone, countDone: node.progressRatio * 100, countTotal: 100 }
    }
    get progressGlobal(): ProgressReport {
        const totalNode = this.nodes.length
        const doneNodes = this.nodes.filter((n) => n.status === 'done' || n.status === 'cached').length
        const bonus = this.currentExecutingNode?.progressRatio ?? 0
        const score = (doneNodes + bonus) / totalNode
        const percent = this.done ? 100 : score * 100
        const isDone = this.done
        return { percent, isDone, countDone: doneNodes + bonus, countTotal: totalNode }
    }
    /** @internal update the progress value of the currently focused onde */
    onProgress = (msg: WsMsgProgress) => {
        if (this.currentExecutingNode == null) return console.log('❌ no current executing node', msg)
        this.currentExecutingNode.progress = msg.data
        this.currentExecutingNode.progressRatio = (msg.data.value ?? 0) / (msg.data.max || 1)
    }

    getTargetWorkflowFilePath = () => {
        return asAbsolutePath(join(this.st.cacheFolderPath, 'workflow.json'))
    }
    getTargetPromptFilePath = () => {
        return asAbsolutePath(join(this.st.cacheFolderPath, 'prompt.json'))
    }

    get cacheFolder(): AbsolutePath {
        return this.st.cacheFolderPath
    }

    // private outputs: WsMsgExecuted[] = []
    // images: ImageL[] = []

    done = false

    /** @internal update pointer to the currently executing node */
    onExecuting = (msg: WsMsgExecuting) => {
        // 1. mark currentExecutingNode as done
        if (this.currentExecutingNode) {
            this.currentExecutingNode.status = 'done'
            // this.currentExecutingNode.updatedAt = Date.now() + 1000
        }
        // 2. then two cases:
        // 2.A. no node => the prompt is done
        if (msg.data.node == null) {
            this.currentExecutingNode = null
            this.done = true
            return
        }

        this.done = false
        // 2.B. a node => node evaluation is starting
        const node = this.getNodeOrCrash(msg.data.node)
        this.currentExecutingNode = node
        node.status = 'executing'
        node.updatedAt = Date.now()
    }

    onExecutionCached = (msg: WsMsgExecutionCached) => {
        for (const x of msg.data.nodes) {
            const node = this.getNodeOrCrash(x)
            node.status = 'cached'
        }
    }

    // onExecuted = (msg: WsMsgExecuted) => {
    //     const node = this.getNodeOrCrash(msg.data.node)
    //     const images = msg.data.output.images.map((i) => new PromptOutputImage(this, i))

    //     // console.log(`🟢 `, images.length, `CushyImages`)
    //     // accumulate in self
    //     this.outputs.push(msg)
    //     this.images.push(...images)
    //     // console.log(`🟢 `, this.uid, 'has', this.images.length, `CushyImages`)

    //     // accumulate in node
    //     node.artifacts.push(msg.data)
    //     node.images.push(...images)
    // }

    // @deprecated
    get flowSummaryMd(): MDContent {
        return asMDContent([`<pre class="mermaid">`, this.toMermaid(), `</pre>`].join('\n'))
    }

    // @deprecated
    get flowSummaryHTML(): HTMLContent {
        // https://mermaid.js.org/config/usage.html
        return asHTMLContent(marked.parse(this.flowSummaryMd))
    }

    _uidNumber = 0
    // private _nextUID = 1
    // getUID = () => (this._nextUID++).toString()
    getNodeOrCrash = (nodeID: ComfyNodeID): ComfyNode<any> => {
        const node = this.nodesIndex.get(nodeID)
        if (node == null) throw new Error('Node not found:' + nodeID)
        return node
    }

    /** visjs JSON format (network visualisation) */
    get JSON_forVisDataVisualisation(): { nodes: VisNodes[]; edges: VisEdges[] } {
        const json: ComfyPromptJSON = this.json_forPrompt('use_stringified_numbers_only')
        const schemas: SchemaL = this.db.schema
        const nodes: VisNodes[] = []
        const edges: VisEdges[] = []
        if (json == null) return { nodes: [], edges: [] }
        for (const [uid, node] of Object.entries(json)) {
            const schema: ComfyNodeSchema = schemas.nodesByNameInComfy[node.class_type]
            const color = comfyColors[schema.category]
            nodes.push({ id: uid, label: node.class_type, color, font: { color: 'white' }, shape: 'box' })
            for (const [name, val] of Object.entries(node.inputs)) {
                if (val instanceof Array) {
                    const [from, slotIx] = val
                    const edgeID = `${from}-${uid}-${slotIx}`
                    edges.push({ id: edgeID, from, to: uid, arrows: 'to', label: name, labelHighlightBold: false, length: 200 })
                }
            }
        }
        return { nodes, edges }
    }
}

/** all images generated by nodes in this graph */
// get allImages(): GeneratedImage[] {
//     return this.nodes.flatMap((a) => a.images)
// }

/** wether it should really send the prompt to the backend */
// get runningMode(): RunMode {
//     return this.run.opts?.mock ? 'fake' : 'real'
// }

// COMMIT --------------------------------------------

// JSON_forGitGraphVisualisation = (gitgraph: GitgraphUserApi<any>) => {
//     // extract graph
//     const ids: TNode[] = []
//     const edges: TEdge[] = []
//     for (const node of this.nodesArray) {
//         ids.push(node.uid)
//         for (const fromUID of node._incomingNodes()) edges.push([fromUID, node.uid])
//     }
//     // sort it
//     const sortedIds = toposort(ids, edges)
//     // renderit
//     const invisible = { renderDot: () => null, renderMessage: () => null }
//     const cache: { [key: string]: BranchUserApi<any> } = {}
//     const master = gitgraph.branch('master').commit(invisible)
//     for (const id of sortedIds) {
//         const node = this.nodes.get(id)!
//         const branch = master.branch(node.uid)
//         cache[id] = branch.commit({ body: node.$schema.name, renderDot: () => null, renderMessage: () => null })
//         for (const fromUID of node._incomingNodes())
//             cache[id] = branch.merge({ fastForward: true, branch: fromUID, commitOptions: invisible })
//         cache[id] = branch.commit({ body: node.$schema.name })
//     }
// }

export type ProgressReport = {
    percent: number
    isDone: boolean
    countDone: number
    countTotal: number
}
