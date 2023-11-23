import { observer } from 'mobx-react-lite'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from 'src/rsuite/shims'
import { useSt } from 'src/state/stateContext'
import { GithubUserUI } from 'src/cards/GithubAvatarUI'
import { ErrorBoundaryFallback } from 'src/widgets/misc/ErrorBoundary'
import { Package } from '../cards/Deck'
import { ActionPackStatusUI } from '../cards/DeckStatusUI'
// import { ActionPackStarsUI } from '../cards/DeckStarsUI'

export const Panel_Marketplace = observer(function Panel_Marketplace_(p: {}) {
    const st = useSt()
    return (
        <div>
            <div tw='p-2'>
                <Button onClick={() => {}} appearance='ghost' color='green' tw='w-full self-start'>
                    Create action
                </Button>
            </div>
            {st.library.decks.map((actionPack) => (
                <ErrorBoundary key={actionPack.github} FallbackComponent={ErrorBoundaryFallback}>
                    <ActionPackUI key={actionPack.github} actionPack={actionPack} />
                </ErrorBoundary>
            ))}
        </div>
    )
})

export const ActionPackUI = observer(function ActionPackUI_(p: { actionPack: Package }) {
    const pack = p.actionPack
    return (
        <div tw='cursor-pointer hover:bg-gray-700 p-2' key={pack.name} style={{ borderBottom: '1px solid #515151' }}>
            <div tw='flex  gap-2'>
                <div tw='flex-grow'>
                    <div tw='text-lg font-bold'>{pack.name}</div>
                    <GithubUserUI size='1.5rem' username={pack.githubUserName} showName />
                    <div tw='text-neutral-content'>{pack.description}</div>
                </div>
                {/* {pack.isBuiltIn ? null : <ActionPackStarsUI pack={pack} />} */}
            </div>
            <ActionPackStatusUI pack={pack} />
            {pack.installK.logs.length > 0 && (
                <div>
                    <pre>{JSON.stringify(pack.installK.logs)}</pre>
                </div>
            )}
        </div>
    )
})
