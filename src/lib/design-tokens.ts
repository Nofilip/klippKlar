/**
 * Design tokens for consistent spacing, sizing, and styling
 * Use these constants throughout the app for consistency
 */

// Spacing scale (matches Tailwind's default)
export const spacing = {
  /** Page section gap: space-y-6 */
  section: 'space-y-6',
  /** Card list gap: space-y-3 */
  cardList: 'space-y-3',
  /** Form field gap: space-y-5 */
  formFields: 'space-y-5',
  /** Inline items gap: gap-2 */
  inlineGap: 'gap-2',
  /** Content padding in cards */
  cardPadding: 'p-4',
  /** Page top margin after header */
  pageTopMargin: 'mt-6',
} as const;

// Typography hierarchy
export const typography = {
  /** Page title: 2xl on mobile, 3xl on desktop */
  pageTitle: 'text-2xl sm:text-3xl font-display font-bold text-foreground',
  /** Card/section title */
  sectionTitle: 'text-lg font-display font-semibold text-foreground',
  /** List item title */
  itemTitle: 'font-medium text-foreground',
  /** Subtitle/description */
  description: 'text-sm text-muted-foreground',
  /** Small helper text */
  helper: 'text-xs text-muted-foreground',
} as const;

// Form field styling
export const formStyles = {
  /** Standard form group spacing */
  fieldGroup: 'space-y-2',
  /** Label with icon */
  labelWithIcon: 'flex items-center gap-2 text-sm font-medium',
  /** Input with touch target */
  input: 'touch-target',
  /** Switch row layout */
  switchRow: 'flex items-center justify-between p-3 bg-muted/50 rounded-lg',
} as const;

// Component sizing
export const sizes = {
  /** Avatar/icon container - small */
  avatarSm: 'w-10 h-10',
  /** Avatar/icon container - medium */
  avatarMd: 'w-12 h-12',
  /** Icon inside avatar - small */
  avatarIconSm: 'w-5 h-5',
  /** Icon inside avatar - medium */
  avatarIconMd: 'w-6 h-6',
  /** Minimum touch target */
  touchTarget: 'min-h-[44px] min-w-[44px]',
} as const;

// Animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
} as const;
