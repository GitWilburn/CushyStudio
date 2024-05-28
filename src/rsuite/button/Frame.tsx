// HIGH LEVEL THEME-DEFINED BOX STYLES
// everything is boxes,
// but lot of boxes have similar styles
// and lot of behaviours (beeing pressed, beeing active)
// need to slightly ajust those styles
// frame offer a semantic vocabulary to define look and feel of
// any surface at a higher level than the Box API.
// you can always specify BOX api directly if you need more control
// the frame will merge the low level api on top of the compiled style from
// the high level api

import type { IconName } from '../../icons/icons'
import type { RelativeStyle } from '../../theme/colorEngine/AbsoluteStyle'

import { IkonOf } from '../../icons/iconHelpers'
import { Box, type BoxUIProps } from '../../theme/colorEngine/Box'
import { normalizeBase, normalizeBorder } from '../../theme/colorEngine/useColor'
import { exhaust } from '../../utils/misc/exhaust'
import { FrameAppearance, type FrameAppearanceFlags, getAppearance } from './FrameAppearance'
import { getBorderContrast } from './FrameBorderContrast'
import { getChroma } from './FrameChroma'
import { type FrameSize, getClassNameForSize } from './FrameSize'
import { usePressLogic } from './usePressLogic'

export type FrameProps = {
    // logic --------------------------------------------------
    /** TODO: */
    triggerOnPress?: boolean

    // STATES MODIFIERS ------------------------------------------------
    active?: Maybe<boolean>
    loading?: boolean
    disabled?: boolean

    // FITT size ----------------------------------------------------
    // /** when true flex=1 */
    expand?: boolean

    // ICON --------------------------------------------------
    icon?: Maybe<IconName>
    suffixIcon?: Maybe<IconName>
} & BoxUIProps &
    /** HIGH LEVEL THEME-DEFINED BOX STYLES */
    FrameAppearanceFlags &
    /** Sizing and aspect ratio vocabulary */
    FrameSize

// -------------------------------------------------
export const Frame = (p: FrameProps) => {
    const {
        icon,
        active,
        size,
        loading,
        disabled,
        primary,
        appearance: appearance_,
        //
        onMouseDown,
        onMouseEnter,
        onClick,
        //
        className,
        ...rest
    } = p

    const appearance = getAppearance(p)
    const isDisabled = p.loading || p.disabled || false
    const chroma = getChroma({ active, appearance, isDisabled, primary })

    const mouseEvents = p.triggerOnPress
        ? usePressLogic({ onMouseDown, onMouseEnter, onClick })
        : { onMouseDown, onMouseEnter, onClick }
    // -----------------------------------------------------------------
    const mergeStyles = (a: RelativeStyle | null, b: RelativeStyle | null): RelativeStyle | undefined => {
        if (a == null && b == null) return
        if (a == null) return b!
        if (b == null) return a
        return { ...a, ...b }
    }

    // BACKGROUND ------------------------------------------------------
    const normalizedBase = p.base ? normalizeBase(p.base) : null
    const themeBase: RelativeStyle = {
        contrast: getBackgroundContrast(active, isDisabled, appearance),
        chroma,
    }
    const base = mergeStyles(themeBase, normalizedBase)

    // BORDER -----------------------------------------------------------
    const normalziedBorder: RelativeStyle | null = p.border ? normalizeBorder(p.border) : null
    const themeBorderContrast = getBorderContrast(appearance)
    const themeBorder: RelativeStyle | null = themeBorderContrast ? { contrast: themeBorderContrast } : null
    const border = mergeStyles(themeBorder, normalziedBorder)

    return (
        <Box
            base={base}
            border={border}
            hover={appearance !== 'headless'} // TODO
            text={{ contrast: isDisabled ? 0.1 : 0.9 }}
            tabIndex={p.tabIndex ?? -1}
            className={className}
            /* do not contain the 3 mouse events handled above */
            {...rest}
            {...mouseEvents}
            tw={[
                '_Frame',
                getClassNameForSize(p),
                p.expand && 'flex-1',
                p.appearance === 'headless' ? undefined : 'rounded-sm flex gap-2 items-center',
            ]}
        >
            {p.icon && <IkonOf name={p.icon} />}
            {p.children}
            {p.suffixIcon && <IkonOf name={p.suffixIcon} />}
        </Box>
    )
}

function getBackgroundContrast(
    //
    active: Maybe<boolean>,
    isDisabled: boolean,
    appearance: FrameAppearance,
) {
    const disabledMult = isDisabled ? 0.2 : 1

    if (active) return 0.5 * disabledMult
    // if (isDisabled) return 0.05 * disabledMult

    if (appearance === 'headless') return 0 * disabledMult
    if (appearance === 'primary') return 0.9 * disabledMult
    if (appearance === 'secondary') return 0.9 * disabledMult
    if (appearance === 'ghost') return 0 * disabledMult
    if (appearance === 'default') return 0.1 * disabledMult
    if (appearance === 'subtle') return 0 * disabledMult
    if (appearance == null) return 0.1 * disabledMult
    exhaust(appearance)
    return 0.1 * disabledMult
}
