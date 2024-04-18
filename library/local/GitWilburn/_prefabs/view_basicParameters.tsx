export const view_basicDraftParameters = view<{
    positivePrompt?: string
    negativePrompt?: string
    seed?: number
    ksampler?: string
    scheduler?: string
    denoise?: number
    uiState?: string
}>({
    preview: (p) => <div>{'Detail'}</div>,
    render: (p) => (
        <div>
            <div>
                Positive:
                <pre>
                    <code>{`${JSON.stringify(JSON.parse(p.positivePrompt || '{}'), null, 2)}`}</code>
                </pre>
            </div>
            <div>
                Negative:
                <pre>
                    <code>{`${JSON.stringify(JSON.parse(p.negativePrompt || '{}'), null, 2)}`}</code>
                </pre>
            </div>
            <div>Seed:{p.seed}</div>
            <div>Sampler:{p.ksampler}</div>
            <div>Scheduler:{p.scheduler}</div>
            <div>Noise:{p.denoise}</div>
            <div>UI State:{p.uiState}</div>
        </div>
    ),
})
