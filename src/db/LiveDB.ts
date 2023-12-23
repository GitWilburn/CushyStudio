import type {
    AuthT,
    ComfyPromptT,
    ComfySchemaT,
    CushyAppT,
    CushyScriptT,
    CustomDataT,
    DraftT,
    GraphT,
    HostT,
    Media3dDisplacementT,
    MediaImageT,
    MediaSplatT,
    MediaTextT,
    MediaVideoT,
    ProjectT,
    RuntimeErrorT,
    StepT,
    TreeEntryT,
} from 'src/db/TYPES.gen'
import type { TableInfo } from 'src/db/TYPES_json'
import type { STATE } from '../state/state'

import { default as BetterSqlite3, default as SQL } from 'better-sqlite3'
import { rmSync } from 'fs'
import { makeAutoObservable } from 'mobx'
import { LiveTable } from './LiveTable'
// models
import { readFileSync } from 'fs'
import { _applyAllMigrations } from 'src/db/_applyAllMigrations'
import { _codegenORM } from 'src/db/_codegenORM'
import { _setupMigrationEngine } from 'src/db/_setupMigrationEngine'
import { _checkAllMigrationsHaveDifferentIds } from 'src/db/migrations'
import { AuthL } from 'src/models/Auth'
import { CushyAppL } from 'src/models/CushyApp'
import { CushyScriptL } from 'src/models/CushyScriptL'
import { CustomDataL } from 'src/models/CustomData'
import { Media3dDisplacementL } from 'src/models/Media3dDisplacement'
import { MediaSplatL } from 'src/models/MediaSplat'
import { MediaTextL } from 'src/models/MediaText'
import { MediaVideoL } from 'src/models/MediaVideo'
import { RuntimeErrorL } from 'src/models/RuntimeError'
import { TreeEntryL } from 'src/models/TreeEntry'
import { ComfyPromptL } from '../models/ComfyPrompt'
import { DraftL } from '../models/Draft'
import { ComfyWorkflowL } from '../models/ComfyWorkflow'
import { MediaImageL } from '../models/MediaImage'
import { ProjectL } from '../models/Project'
import { ComfySchemaL } from '../models/Schema'
import { StepL } from '../models/Step'
import { asRelativePath } from '../utils/fs/pathUtils'
import { DB_RELATIVE_PATH } from './DB_CONFIG'
import { HostL } from 'src/models/Host'

export type Indexed<T> = { [id: string]: T }

let ix = 0

export class LiveDB {
    _tables: LiveTable<any, any>[] = []

    // tables ---------------------------------------------------------
    projects: LiveTable<ProjectT, ProjectL>
    custom_datas: LiveTable<CustomDataT, CustomDataL>
    comfy_schemas: LiveTable<ComfySchemaT, ComfySchemaL>
    hosts: LiveTable<HostT, HostL>
    comfy_prompts: LiveTable<ComfyPromptT, ComfyPromptL>
    cushy_scripts: LiveTable<CushyScriptT, CushyScriptL>
    cushy_apps: LiveTable<CushyAppT, CushyAppL>
    media_texts: LiveTable<MediaTextT, MediaTextL>
    media_images: LiveTable<MediaImageT, MediaImageL>
    media_videos: LiveTable<MediaVideoT, MediaVideoL>
    media_splats: LiveTable<MediaSplatT, MediaSplatL>
    media_3d_displacement: LiveTable<Media3dDisplacementT, Media3dDisplacementL>
    tree_entries: LiveTable<TreeEntryT, TreeEntryL>
    runtimeErrors: LiveTable<RuntimeErrorT, RuntimeErrorL>
    drafts: LiveTable<DraftT, DraftL>
    graphs: LiveTable<GraphT, ComfyWorkflowL>
    steps: LiveTable<StepT, StepL>
    auths: LiveTable<AuthT, AuthL>

    /** run all pending migrations */
    migrate = () => {
        _checkAllMigrationsHaveDifferentIds()
        _applyAllMigrations(this)
    }

    /** You should not call that unless you know what you're doing */
    runCodegen = () => {
        _codegenORM(this)
    }

    // prettier-ignore
    constructor(public st: STATE) {
            // init SQLITE ---------------------------------------------------------
            const db = SQL(DB_RELATIVE_PATH, { nativeBinding: 'node_modules/better-sqlite3/build/Release/better_sqlite3.node' })
            db.pragma('journal_mode = WAL')
            this.db = db
            _setupMigrationEngine(this)
            this.migrate()
            // _listAllTables(this)

            // ---------------------------------------------------------
            makeAutoObservable(this)

            // 3. create tables (after the store has benn made already observable)
            this.projects =              new LiveTable(this, 'project'              , '🤠', ProjectL, { singleton: true })
            this.custom_datas =          new LiveTable(this, 'custom_data'          , '🎁', CustomDataL)
            this.comfy_schemas =         new LiveTable(this, 'comfy_schema'         , '📑', ComfySchemaL)
            this.hosts =                 new LiveTable(this, 'host'                 , '📑', HostL)
            this.comfy_prompts =         new LiveTable(this, 'comfy_prompt'         , '❓', ComfyPromptL)
            this.cushy_scripts =         new LiveTable(this, 'cushy_script'         , '⭐️', CushyScriptL)
            this.cushy_apps =            new LiveTable(this, 'cushy_app'            , '🌟', CushyAppL)
            this.media_texts =           new LiveTable(this, 'media_text'           , '💬', MediaTextL)
            this.media_images =          new LiveTable(this, 'media_image'          , '🖼️', MediaImageL)
            this.media_videos =          new LiveTable(this, 'media_video'          , '🖼️', MediaVideoL)
            this.media_splats =          new LiveTable(this, 'media_splat'          , '🖼️', MediaSplatL)
            this.media_3d_displacement = new LiveTable(this, 'media_3d_displacement', '🖼️', Media3dDisplacementL)
            this.tree_entries =          new LiveTable(this, 'tree_entry'           , '🖼️', TreeEntryL)
            this.runtimeErrors =         new LiveTable(this, 'runtime_error'        , '❌', RuntimeErrorL)
            this.drafts =                new LiveTable(this, 'draft'                , '📝', DraftL)
            this.graphs =                new LiveTable(this, 'graph'                , '📊', ComfyWorkflowL)
            this.steps =                 new LiveTable(this, 'step'                 , '🚶‍♂️', StepL)
            this.auths =                 new LiveTable(this, 'auth'                 , '🚶‍♂️', AuthL)

            // console.log('🟢 TABLE INITIALIZED')
        }

    _getCount = (tabeName: string): number => {
        const stmt = this.db.prepare(`select count(id) as count from ${tabeName}`)
        return (stmt.get() as { count: number }).count
    }

    prepareGet = <T, R>(info: TableInfo<R>, sql: string) => {
        try {
            const stmt = this.db.prepare(sql)
            return (args: T): Maybe<R> => {
                const val = stmt.get(args) as Maybe<R>
                if (val == null) return null
                info.hydrateJSONFields(val)
                return val
            }
        } catch (e) {
            console.log(sql)
            throw e
        }
    }
    prepareGet0 = <R>(info: TableInfo<R>, sql: string) => {
        try {
            const stmt = this.db.prepare(sql)
            return (): Maybe<R> => {
                const val = stmt.get() as Maybe<R>
                if (val == null) return null
                info.hydrateJSONFields(val)
                return val
            }
        } catch (e) {
            console.log(sql)
            throw e
        }
    }
    prepareAll = <T, R>(info: TableInfo<R>, sql: string) => {
        try {
            const stmt = this.db.prepare(sql)
            return (args: T) => stmt.all(args).map((t) => info.hydrateJSONFields(t)) as R[]
        } catch (e) {
            console.log(sql)
            throw e
        }
    }

    prepareDelete = <T, R>(sql: string) => {
        const stmt = this.db.prepare(sql)
        return (args: T) => stmt.run(args) as R
    }

    log = (...res: any[]) => console.log(`{${ix++}}`, ...res)
    db: BetterSqlite3.Database

    /* erase the DB file on disk */
    reset = () => this.erase()

    /* erase the DB file on disk */
    erase = () => {
        this.db.close()
        rmSync(DB_RELATIVE_PATH)
    }
}
