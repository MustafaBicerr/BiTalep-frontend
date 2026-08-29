import * as React from 'react'
import { cn } from '@/utils/cn'

export interface ScrollPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible height of the scroll area in px. Omit when using `fillParent`. */
  maxHeight?: number
  /** Take all remaining space of a flex parent instead of a fixed height. */
  fillParent?: boolean
  /** Wrapper classes (border, rounding); the scroll element gets `className`. */
  wrapperClassName?: string
  /** Accessible name for the scrollable region. */
  label?: string
}

/**
 * Fixed-height scroll container that visibly owns its scroll: gradient fades at
 * the overflowing edges, a hover ring, and `overscroll-contain` so reaching the
 * end never scrolls the page behind it.
 */
export const ScrollPane = React.forwardRef<HTMLDivElement, ScrollPaneProps>(
  ({ maxHeight, fillParent, className, wrapperClassName, label, children, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement | null>(null)
    const [edges, setEdges] = React.useState({ top: false, bottom: false })

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const syncEdges = React.useCallback(() => {
      const el = innerRef.current
      if (!el) return
      const overflow = el.scrollHeight - el.clientHeight
      setEdges({
        top: el.scrollTop > 4,
        bottom: overflow > 4 && el.scrollTop < overflow - 4,
      })
    }, [])

    React.useEffect(() => {
      const el = innerRef.current
      if (!el) return
      syncEdges()
      const observer = new ResizeObserver(syncEdges)
      observer.observe(el)
      for (const child of Array.from(el.children)) observer.observe(child)
      return () => observer.disconnect()
    }, [syncEdges, children])

    return (
      <div
        className={cn('group/pane relative overflow-hidden', fillParent && 'min-h-0 flex-1', wrapperClassName)}
      >
        <div
          ref={setRefs}
          role="region"
          aria-label={label}
          tabIndex={0}
          onScroll={syncEdges}
          style={maxHeight != null ? { maxHeight, contain: 'layout' } : { contain: 'layout' }}
          className={cn(
            'overflow-x-hidden overflow-y-auto overscroll-contain rounded-md ring-1 ring-transparent transition-[box-shadow] duration-fast',
            'group-hover/pane:ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            fillParent && 'h-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-6 rounded-t-md bg-gradient-to-b from-card to-transparent transition-opacity duration-fast',
            edges.top ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-md bg-gradient-to-t from-card to-transparent transition-opacity duration-fast',
            edges.bottom ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
    )
  },
)
ScrollPane.displayName = 'ScrollPane'
