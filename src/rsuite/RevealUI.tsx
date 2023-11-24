import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

class TooltipState {
    get visible() {
        if (this._lock) return true
        return this.inAnchor || this.inTooltip
    }

    inAnchor = false
    inTooltip = false
    leaveAnchorTimeoutId: NodeJS.Timeout | null = null
    leaveTooltipTimeoutId: NodeJS.Timeout | null = null
    enterAnchorTimeoutId: NodeJS.Timeout | null = null
    enterTooltipTimeoutId: NodeJS.Timeout | null = null

    constructor(
        //
        public showDelay = 200,
        public hideDelay = 200,
        public disableHover = false,
    ) {
        makeAutoObservable(this)
    }

    _lock = false
    toggleLock = () => {
        this._lock = !this._lock
    }

    leaveAnchorNow = () => {
        // cancer enter
        if (this.enterAnchorTimeoutId) {
            clearTimeout(this.enterAnchorTimeoutId)
            this.enterAnchorTimeoutId = null
        }
        this.inAnchor = false
    }

    enterAnchorNow = () => {
        // cancel leave
        if (this.leaveTooltipTimeoutId) {
            clearTimeout(this.leaveTooltipTimeoutId)
            this.leaveTooltipTimeoutId = null
        }
        this.inAnchor = true
    }

    // anchor --------------------------------------------
    enterAnchor = () => {
        if (this.disableHover) return
        // cancel leaave
        if (this.leaveAnchorTimeoutId) {
            clearTimeout(this.leaveAnchorTimeoutId)
            this.leaveAnchorTimeoutId = null
        }
        // start enter
        if (this.enterAnchorTimeoutId) clearTimeout(this.enterAnchorTimeoutId)
        this.enterAnchorTimeoutId = setTimeout(() => (this.inAnchor = true), this.showDelay)
    }
    leaveAnchor = () => {
        // cancer enter
        if (this.enterAnchorTimeoutId) {
            clearTimeout(this.enterAnchorTimeoutId)
            this.enterAnchorTimeoutId = null
        }
        // start leave
        if (this.leaveAnchorTimeoutId) clearTimeout(this.leaveAnchorTimeoutId)
        this.leaveAnchorTimeoutId = setTimeout(() => (this.inAnchor = false), this.hideDelay)
    }

    get defaultCursor() {
        if (this.disableHover) return 'cursor-pointer'
        return 'cursor-help'
    }
    // tooltip --------------------------------------------
    enterTooltip = () => {
        if (this.disableHover) return
        // cancel leave
        if (this.leaveTooltipTimeoutId) {
            clearTimeout(this.leaveTooltipTimeoutId)
            this.leaveTooltipTimeoutId = null
        }
        // start enter
        if (this.enterTooltipTimeoutId) clearTimeout(this.enterTooltipTimeoutId)
        this.enterTooltipTimeoutId = setTimeout(() => (this.inTooltip = true), this.showDelay)
    }
    leaveTooltip = () => {
        // cancer enter
        if (this.enterTooltipTimeoutId) {
            clearTimeout(this.enterTooltipTimeoutId)
            this.enterTooltipTimeoutId = null
        }
        // start leave
        if (this.leaveTooltipTimeoutId) clearTimeout(this.leaveTooltipTimeoutId)
        this.leaveTooltipTimeoutId = setTimeout(() => (this.inTooltip = false), this.hideDelay)
    }

    // position --------------------------------------------
    tooltipPosition = { top: 0, left: 0 }
    setPosition = (rect: DOMRect) => {
        this.tooltipPosition = {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        }
    }
}

export const RevealUI = observer(function Tooltip_(p: {
    //
    children: [React.ReactNode, React.ReactNode]
    tooltipWrapperClassName?: string[]
    disableHover?: boolean
    className?: string
    showDelay?: number
    hideDelay?: number
    enableRightClick?: boolean
    cursor?: string
}) {
    const showDelay = p.showDelay ?? 300
    const hideDelay = p.hideDelay ?? 300
    const disableHover = p.disableHover ?? false
    const uist = useMemo(() => new TooltipState(showDelay, hideDelay, disableHover), [showDelay, hideDelay, disableHover])
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (uist.visible && ref.current) {
            const rect = ref.current.getBoundingClientRect()
            uist.setPosition(rect)
        }
    }, [uist.visible])

    const tooltip = uist.visible
        ? createPortal(
              <div
                  tw={['card card-bordered bg-base-100 shadow-xl pointer-events-auto', ...(p.tooltipWrapperClassName ?? [])]}
                  onMouseEnter={uist.enterTooltip}
                  onMouseLeave={uist.leaveTooltip}
                  onContextMenu={uist.enterAnchorNow}
                  style={{
                      position: 'absolute',
                      zIndex: 99999999,
                      top: `${uist.tooltipPosition.top}px`,
                      left: `${uist.tooltipPosition.left}px`,
                      // Adjust positioning as needed
                  }}
              >
                  {p.children[1]}
              </div>,
              document.getElementById('tooltip-root')!,
          )
        : null

    return (
        <span //
            tw={[p.cursor ?? uist.defaultCursor]}
            className={p.className}
            ref={ref}
            onContextMenu={uist.toggleLock}
            onMouseEnter={uist.enterAnchor}
            onMouseLeave={uist.leaveAnchor}
            onClick={(ev) => {
                ev.stopPropagation()
                ev.preventDefault()
                if (uist.visible) uist.leaveAnchorNow()
                else uist.enterAnchorNow()
            }}
        >
            {p.children[0]}
            {tooltip}
        </span>
    )
})
