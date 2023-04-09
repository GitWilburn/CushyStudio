import * as vscode from 'vscode'
import type { Workspace } from '../core/Workspace'
import { loggerExt } from '../logger/LoggerExtension'

export const cmd_runcurrentscript = async (
    //
    _context: vscode.ExtensionContext,
    workspace: Workspace,
) => {
    loggerExt.info('🌠', '🟢 running current script1')
    loggerExt.info('🌠', '🟢 running current script2')
    await workspace.RUN_CURRENT_FILE()
    loggerExt.info('🌠', '🟢 done')
}
