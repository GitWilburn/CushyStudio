import { CushyFormManager } from '../../controls/FormBuilder'
import { readJSON, writeJSON } from '../../state/jsonUtils'

export const PanelOutputConf = CushyFormManager.form(
    (ui) =>
        ui.fields(
            {
                //
                outputPreviewSize: ui.number({ default: 256, min: 64, max: 1024, step: 64 }),
                latentSize: ui.number({ default: 10, min: 3, max: 100, step: 1 }),
            },
            { label: 'Panel output Conf' },
        ),
    {
        name: 'panel-output',
        initialSerial: () => readJSON('settings/panel-output-config.json'),
        onSerialChange: (form) => writeJSON('settings/panel-output-config.json', form.serial),
    },
)
