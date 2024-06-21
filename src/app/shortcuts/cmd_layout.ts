import { ctx_global } from '../../csuite/command-topic/ctx_global'
import { command, type Command } from '../../csuite/commands/Command'
import { KEYS } from './shorcutKeys'
import { globalValidInInput } from './simpleValidInInput'

// should every layout command start with `mod+k` for some consistency ?

export const allLayoutCommands: Command<null>[] = [
    // maximize active panel
    command({
        id: 'cmd_maximize_active_panel',
        label: 'maximize active panel',
        ctx: ctx_global,
        combos: 'ctrl+shift+space',
        action: () => cushy.layout.maximizeActiveTabset(),
        validInInput: true,
    }),

    // maximize hovered panel
    command({
        id: 'cmd_maximize_hovered_panel',
        label: 'maximize hovered panel',
        ctx: ctx_global,
        combos: ['alt+space', 'ctrl+u'],
        action: () => cushy.layout.maximizHoveredTabset(),
        validInInput: true,
    }),

    // move active tab to the right
    globalValidInInput(
        //
        'mod+k mod+ArrowRight',
        'move tab to the right',
        () => cushy.layout.moveActiveTabToRight(),
    ),

    // move active tab to the left
    globalValidInInput(
        //
        'mod+k mod+ArrowLeft',
        'move tab to the right',
        () => cushy.layout.moveActiveTabToLeft(),
    ),

    globalValidInInput(
        //
        'mod+k mod+ArrowDown',
        'move tab to the right',
        () => cushy.layout.getTabsetSurroundings(),
    ),

    command({
        id: 'closeCurrentTab',
        combos: KEYS.closeCurrentTab,
        validInInput: true,
        ctx: ctx_global,
        action: () => cushy.layout.closeCurrentTab(),
        label: 'Close current tab',
    }),

    command({
        id: 'closeAllTabs',
        label: 'Close all tabs',
        combos: 'mod+k mod+shift+x',
        validInInput: true,
        ctx: ctx_global,
        action: () => cushy.layout.closeAllTabs(),
    }),

    command({
        id: 'closeCurrentTabset',
        label: 'Close current tabset',
        combos: 'mod+k mod+x',
        validInInput: true,
        ctx: ctx_global,
        action: () => cushy.layout.closeCurrentTabset(),
    }),
]
