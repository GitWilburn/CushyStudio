import { getKnownCheckpoints } from 'src/wiki/modelList'
import type { OutputFor } from './_prefabs'

// UI -----------------------------------------------------------
export const ui_model = () => {
    const form = getCurrentForm()
    const ckpts = form.schema.st.getKnownCheckpoints()
    return form.group({
        label: 'AI Model',
        items: () => ({
            ckpt_name: form.enum({
                enumName: 'Enum_CheckpointLoaderSimple_ckpt_name',
                default: 'revAnimated_v122.safetensors',
                group: 'Model',
                label: 'Checkpoint',
                recommandedModels: { knownModel: ckpts.map((x) => x.name) },
            }),
            civtai_ckpt_air: form.stringOpt({
                tooltip: 'Civitai checkpoint Air, as found on the civitai Website. It should look like this: 43331@176425',
                label: 'Civitai Ref',
                group: 'Model',
                placeHolder: 'e.g. 43331@176425',
            }),
            vae: form.enumOpt({ enumName: 'Enum_VAELoader_vae_name', group: 'Model' }),
            clipSkip: form.int({ label: 'Clip Skip', default: 0, min: 0, max: 5, group: 'model' }),
            freeU: form.bool({ default: false }),
        }),
    })
}

// RUN -----------------------------------------------------------
export const run_model = (p: OutputFor<typeof ui_model>) => {
    const run = getCurrentRun()
    const graph = run.nodes

    // 1. MODEL
    const ckptSimple = p.civtai_ckpt_air
        ? graph.CivitAI$_Checkpoint$_Loader({
              ckpt_name: p.ckpt_name,
              ckpt_air: p.civtai_ckpt_air,
              download_path: 'models\\checkpoints',
          })
        : graph.CheckpointLoaderSimple({ ckpt_name: p.ckpt_name })
    let ckpt: HasSingle_MODEL = ckptSimple
    let clip: HasSingle_CLIP = ckptSimple

    // 2. OPTIONAL CUSTOM VAE
    let vae: _VAE = ckptSimple._VAE
    if (p.vae) vae = graph.VAELoader({ vae_name: p.vae })

    // 3. OPTIONAL CLIP SKIP
    if (p.clipSkip) clip = graph.CLIPSetLastLayer({ clip, stop_at_clip_layer: -Math.abs(p.clipSkip) })

    // 4. Optional FreeU
    if (p.freeU) ckpt = graph.FreeU({ model: ckpt })

    return { ckpt, vae, clip }
}
