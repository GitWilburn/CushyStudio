import type { EditorState } from 'lexical'
import type { PossibleSerializedNodes } from './PossibleSerializedNodes'

export const getFinalJSON = (
    editorState: EditorState,
): {
    items: PossibleSerializedNodes[]
    debug: string
} => {
    const json = editorState.toJSON()
    const items: PossibleSerializedNodes[] = []

    // console.log(json)
    const p0 = json.root.children[0]
    if (p0 == null || 'paragraph' !== p0.type) {
        console.log('❌ root.children[0] is not a paragraph')
        return { debug: '', items }
    }
    let debug = '{\n'
    for (const x of (p0 as any as { children: PossibleSerializedNodes[] }).children) {
        items.push(x)
        // const itemJSON = convertToSimpleJSON(x)
        // debug += '   ' + JSON.stringify(itemJSON) + ',\n'
    }
    debug += '}\n'
    return { items, debug }
}

// const convertToSimpleJSON = (node: PossibleSerializedNodes): { type: string; value: string } => {
//     if (node.type === 'booru') return { type: 'booru', value: node.tag.text }
//     if (node.type === 'lora') return { type: 'lora', value: JSON.stringify(node.loraDef) }
//     if (node.type === 'wildcard') return { type: 'wildcard', value: node.payload }
//     if (node.type === 'embedding') return { type: 'embedding', value: node.embeddingName }
//     if (node.type === 'user') return { type: 'user', value: node.tag.value }
//     if (node.type === 'action') return { type: 'user', value: node.tag.key }
//     if (node.type === 'text') return { type: 'text', value: node.text }
//     if (node.type === 'linebreak') return { type: 'linebreak', value: '' }
//     if (node.type === 'break') return { type: 'linebreak', value: node.breakType }
//     // if (node.type === 'paragraph') return { type: 'paragraph', value: node.children.map(convertToSimpleJSON) }
//     return { type: 'unknown', value: node }
// }
