export const ui_vhsExport = () => {
    const form = getCurrentForm()
    return form.fields({
        filename_prefix: form.string({ default: 'EpicAnimateDiff' }),
        format: form.enum.Enum_VHS$_VideoCombine_format({ default: 'image/webp' }),
        frame_rate: form.float({ default: 24, min: 1, softMax: 60, max: 2048, step: 1 }),
        advancedSettings: form.fields(
            {
                loop_count: form.int({ default: 0, min: 0, max: 100, step: 1 }),
                pingpong: form.boolean({ default: false }),
                save_output: form.boolean({ default: true }),

                RIFEckpt_name: form.enum.Enum_RIFE_VFI_ckpt_name({ default: 'rife47.pth' }),
                RIFEclear_cache_after_n_frames: form.int({ default: 10, min: 1, max: 1000 }),
                RIFEmultiplier: form.int({ default: 2, min: 1 }),
                RIFEfast_mode: form.boolean({ default: true }),
                RIFEensemble: form.boolean({ default: true }),
                RIFEscale_factor: form.enum.Enum_IFRNet_VFI_scale_factor({ default: 1 }),
            },
            { startCollapsed: true },
        ),
    })
}
