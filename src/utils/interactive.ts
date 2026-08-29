import type { KeyboardEvent } from 'react'

/**
 * Single source of truth for "this is clickable" affordances.
 * Only colour, transform and opacity are animated (see animation_rules.md).
 */

/** List/table rows. Inset ring so the outline is not clipped by scroll containers. */
export const interactiveRow =
  'cursor-pointer transition-colors duration-fast hover:bg-muted/60 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'

/** Cards that navigate or open a dialog. */
export const interactiveCard =
  'cursor-pointer transition-[transform,box-shadow,border-color] duration-fast hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

/** KPI tiles: card lift plus a primary-tinted border hint. */
export const interactiveTile = `${interactiveCard} hover:border-primary/40`

/** Bare icon buttons that are not <Button>. */
export const interactiveIcon =
  'cursor-pointer rounded-md transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Same as interactiveIcon but for dark surfaces (sidebar, secondary bg). */
export const interactiveIconOnDark =
  'cursor-pointer rounded-md transition-colors duration-fast hover:bg-white/10 hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'

/** Inline text links and link-styled buttons. */
export const interactiveTextLink =
  'cursor-pointer underline-offset-4 transition-colors duration-fast hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

/** Toggleable chips / segmented controls. */
export const interactiveChip =
  'cursor-pointer transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'

/**
 * Makes a non-button element (row, card, tile) respond to Enter and Space.
 * Pair with role="button" (or role="link") and tabIndex={0}.
 */
export function activateOnKey(action: () => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    action()
  }
}
