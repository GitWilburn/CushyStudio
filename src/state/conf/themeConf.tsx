import { CushyFormManager } from '../../controls/FormBuilder'
import { ui_Box } from '../../rsuite/box/prefab_Box'
import { ui_Kolor } from '../../rsuite/kolor/prefab_Kolor'
import { readJSON, writeJSON } from '../jsonUtils'

export const themeConf = CushyFormManager.form(
    (ui) =>
        ui.fields(
            {
                // CORE -----------
                base: ui.colorV2({
                    default: '#1E212B' /* `oklch(0.01 0.1 220)` */,
                    presets: [
                        {
                            icon: 'mdiLightSwitch',
                            apply: (w) => (w.value = '#1E212B'),
                            label: 'Dark',
                        },
                        {
                            icon: 'mdiLightSwitch',
                            apply: (w) => (w.value = '#F1F5F9'),
                            label: 'Light',
                        },
                    ],
                }),
                appbar: ui.colorV2().optional(),
                favbar: ui.colorV2().optional(),
                // ---------------------------------------------------------------------------
                border: ui.percent({ default: 20 }).optional(),
                text: ui_Kolor(ui, { contrast: 0.9 }), // ui.number({ min: 0.1, max: 1, default: 0.6 }),
                textLabel: ui_Kolor(ui, { contrast: 0.5, hue: 0.8 }).optional(true),
                primary: ui_Box(ui, { icon: 'mdiPodiumGold' }),

                // ---------------------------------------------------------------------------
                useDefaultCursorEverywhere: ui.boolean({ default: false }),
                showWidgetUndo: ui.boolean({ tooltip: 'show undo button near every field', default: true }),
                showWidgetMenu: ui.boolean({ tooltip: 'show action buttons at the bottom of the form', default: true }),
                showWidgetDiff: ui.boolean({ tooltip: 'show diff button near every field', default: true }),
                showToggleButtonBox: ui.boolean({ default: true }),
            },
            { label: 'Theme' },
        ),
    {
        name: 'theme config',
        initialSerial: () => readJSON('settings/theme.json'),
        onSerialChange: (form) => writeJSON('settings/theme.json', form.serial),
    },
)
