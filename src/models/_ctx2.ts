/**
 * 🔶 THIS MODULE MUST NOT IMPORT ANYTHING (only types allowed).
 * 🔶 IT WILL BE INCLUDED IN MOST PREFABS.
 */
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { Runtime } from 'src/runtime/Runtime'
import type { GlobalCtx } from './_ctx3'
import type { AsyncRuntimeStorage } from './asyncRuntimeStorage'

const getGlobalCtx = () => {
    const _ = (globalThis as any).globalCtx as GlobalCtx
    if (_ == null) {
        debugger
        throw new Error(`No globalCtx`)
    }
    return _
}
/** every function that may potentially call prefab form needs to be wrapped with that */
export const runWithGlobalForm = <T>(form: FormBuilder, f: () => T): T => {
    const globalCtx = getGlobalCtx()
    const prev = globalCtx.currentForm
    globalCtx.currentForm = form
    const res = f()
    globalCtx.currentForm = prev
    return res
}

export const getCurrentForm = (): FormBuilder => {
    const globalCtx = getGlobalCtx()
    if (globalCtx.currentForm == null) {
        console.log(`[👙] `, globalCtx)
        debugger
        throw new Error(`No form in context !`)
    }
    return globalCtx.currentForm
}

// -------------------------------------------------------
export const getGlobalRuntimeCtx = () => {
    const _ = (globalThis as any).globalAsyncStorage as AsyncRuntimeStorage
    if (_ == null) {
        debugger
        throw new Error(`No AsyncRuntimeStorage`)
    }
    return _
}

export const getCurrentRun = (): Runtime => {
    const globalCtx = getGlobalRuntimeCtx()
    const ctx = globalCtx.getStore()
    if (ctx == null) throw new Error(`No run in context`)
    return ctx.runtime
}
