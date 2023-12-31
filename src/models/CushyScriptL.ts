import { basename } from 'pathe'
import { replaceImportsWithSyncImport } from 'src/back/ImportStructure'
import { App, AppRef, WidgetDict } from 'src/cards/App'
import type { LiveInstance } from '../db/LiveInstance'

import { LibraryFile } from 'src/cards/LibraryFile'
import { LiveCollection } from 'src/db/LiveCollection'
import { CushyScriptT, asCushyAppID } from 'src/db/TYPES.gen'
import { asRelativePath } from 'src/utils/fs/pathUtils'
import { CUSHY_IMPORT } from '../compiler/CUSHY_IMPORT'
import { CushyAppL } from './CushyApp'
import { Executable } from './Executable'
import { runInAction } from 'mobx'
import { toastInfo } from 'src/utils/misc/toasts'
import { getCurrentForm, getCurrentRun } from './_ctx2'
// import { LazyValue } from 'src/db/LazyValue'

export interface CushyScriptL extends LiveInstance<CushyScriptT, CushyScriptL> {}
export class CushyScriptL {
    // get firstApp(): Maybe<CushyAppL> {
    //     return this.apps[0]
    // }

    /** relative path from CushyStudio root to the file that produced this script */
    get relPath(): RelativePath {
        return asRelativePath(this.data.path)
    }

    /** collection of all apps related to this script in the db */
    apps_viaDB = new LiveCollection<CushyAppL>({
        table: () => this.db.cushy_scripts,
        where: () => ({ scriptID: this.id }),
    })

    /** collection of all apps related to this script currently in the script (no past values) */
    _apps_viaScript: Maybe<CushyAppL[]> = null
    get apps_viaScript(): CushyAppL[] {
        if (this._apps_viaScript == null) this.extractApps()
        return this._apps_viaScript!
    }

    onHydrate = () => {
        if (this.data.lastEvaluatedAt == null) this.extractApps()
    }

    get file(): LibraryFile {
        return this.st.library.getFile(this.relPath)
    }

    errors: { title: string; details: any }[] = []
    addError = (title: string, details: any = null): LoadStatus => {
        this.errors.push({ title, details })
        return LoadStatus.FAILURE
    }

    // --------------------------------------------------------------------------------------
    /** cache of extracted apps */
    private _EXECUTABLES: Maybe<Executable[]> = null
    get EXECUTABLES(): Executable[] {
        if (this._EXECUTABLES == null) return this.extractApps()
        return this._EXECUTABLES
    }

    getExecutable_orNull(appID: CushyAppID): Maybe<Executable> {
        return this._EXECUTABLES?.find((executable) => appID === executable.appID)
    }

    /** more costly variation of getExecutable_orNull */
    getExecutable_orExtract(appID: CushyAppID): Maybe<Executable> {
        return this.EXECUTABLES.find((executable) => appID === executable.appID)
    }

    // --------------------------------------------------------------------------------------
    /**
     * this function
     *  - 1. evaluate scripts
     *  - 2. upsert apps in db
     *  - 3. bumpt lastEvaluatedAt (and lastSuccessfulEvaluation)
     */
    extractApps = () => {
        this._EXECUTABLES = this._EVALUATE_SCRIPT()
        runInAction(() => {
            this._apps_viaScript = this._EXECUTABLES!.map((executable): CushyAppL => {
                const app = this.db.cushy_apps.upsert({
                    id: executable.appID,
                    scriptID: this.id,
                    description: executable.description,
                    illustration: executable.illustration,
                    name: executable.name,
                    tags: executable.tags.join(','),
                })
                return app
            })

            // bumpt timestamps
            const now = Date.now()
            if (this._apps_viaScript.length === 0) this.update({ lastEvaluatedAt: now })
            else this.update({ lastEvaluatedAt: now, lastSuccessfulEvaluationAt: now })
        })
        return this._EXECUTABLES
    }

    /**
     * this function takes some bundled app JSCode,
     * and returns the apps defined in it
     * returns [] on script execution failure
     * */
    private _EVALUATE_SCRIPT = (): Executable[] => {
        toastInfo(`evaluating script: ${this.relPath}`)
        const codeJS = this.data.code
        const APPS: App<WidgetDict>[] = []

        let appIndex = 0
        // 1. setup DI registering mechanism
        const registerAppFn = (a1: string, a2: App<any>): AppRef<any> => {
            const app: App<WidgetDict> = typeof a1 !== 'string' ? a1 : a2
            const name = app.metadata?.name ?? basename(this.relPath)
            console.info(`[💙] found action: "${name}"`, { path: this.relPath })
            APPS.push(app)
            const appID = asCushyAppID(this.relPath + ':' + appIndex++) // 🔴 SUPER UNSAFE
            // console.log(`[👙] >> appID==`, appID)
            return { $Output: 0 as any, id: appID }
        }

        // 2. eval file to extract actions

        let codJSWithoutWithImportsReplaced
        try {
            codJSWithoutWithImportsReplaced = replaceImportsWithSyncImport(codeJS) // REWRITE_IMPORTS(codeJS)
        } catch {
            console.error(`❌ impossible to replace imports`)
            return []
        }
        try {
            // 2.1. replace imports
            const ProjectScriptFn = new Function(
                //
                'action',
                'card',
                'app',
                'CUSHY_IMPORT',
                'getCurrentForm',
                'getCurrentRun',
                //
                codJSWithoutWithImportsReplaced,
            )

            // 2.2. extract apps by evaluating script
            ProjectScriptFn(
                //
                registerAppFn,
                registerAppFn,
                registerAppFn,
                //
                CUSHY_IMPORT,
                getCurrentForm,
                getCurrentRun,
            )

            // 2.3. return all apps
            return APPS.map((app, ix) => new Executable(this, ix, app))
        } catch (e) {
            console.error(`[📜] CushyScript execution failed:`, e)
            console.groupCollapsed(`[📜] <script that failed>`)
            console.log(codJSWithoutWithImportsReplaced)
            console.groupEnd()
            // this.addError('❌5. cannot convert prompt to code', e)
            return []
        }
    }
}

enum LoadStatus {
    SUCCESS = 1,
    FAILURE = 0,
}
