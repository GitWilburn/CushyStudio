import { observer } from 'mobx-react-lite'
import { Package } from './Deck'

export const ActionPackStarsUI = observer(function ActionPackStarsUI_(p: { className?: string; pack: Package }) {
    const pack = p.pack
    if (pack.isBuiltIn) return null
    return (
        <span
            className={p.className}
            tw='p-0 m-0 text-sm text-yellow-500 flex items-center'
            onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                window.require('electron').shell.openExternal(pack.githubURL)
            }}
        >
            <div>{pack.githubRepository.data?.json?.stargazers_count ?? '?'}</div>
            <span style={{ fontSize: '1.2em' }} className='material-symbols-outlined'>
                star_rate
            </span>
        </span>
    )
})
