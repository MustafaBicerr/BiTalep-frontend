import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'var(--color-primary-hover)',
          subtle: 'var(--color-primary-subtle)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        status: {
          new: 'var(--color-status-new)',
          review: 'var(--color-status-review)',
          approved: 'var(--color-status-approved)',
          rejected: 'var(--color-status-rejected)',
          cancelled: 'var(--color-status-cancelled)',
        },
      },
      /* Only allowed spacing scale: 4/8/12/16/24/32/48/64 */
      spacing: {
        '0': '0px',
        '1': 'var(--spacing-xs)',
        '2': 'var(--spacing-sm)',
        '3': 'var(--spacing-md)',
        '4': 'var(--spacing-base)',
        '6': 'var(--spacing-lg)',
        '8': 'var(--spacing-xl)',
        '12': 'var(--spacing-2xl)',
        '16': 'var(--spacing-3xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['var(--font-family)'],
      },
      fontSize: {
        h1: [
          'var(--font-size-h1)',
          { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.02em' },
        ],
        h2: [
          'var(--font-size-h2)',
          { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' },
        ],
        h3: ['var(--font-size-h3)', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['var(--font-size-body)', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['var(--font-size-body-sm)', { lineHeight: '1.5', fontWeight: '400' }],
        caption: [
          'var(--font-size-caption)',
          { lineHeight: '1.4', fontWeight: '400', letterSpacing: '0.01em' },
        ],
        label: ['var(--font-size-label)', { lineHeight: '1.4', fontWeight: '500' }],
        button: ['var(--font-size-button)', { lineHeight: '1', fontWeight: '500' }],
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--easing-default)',
        default: 'var(--easing-default)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-to-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-to-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'expand-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.2s var(--easing-default)',
        'slide-out-to-right': 'slide-out-to-right 0.2s var(--easing-default)',
        'slide-in-from-left': 'slide-in-from-left 0.2s var(--easing-default)',
        'slide-out-to-left': 'slide-out-to-left 0.2s var(--easing-default)',
        'fade-in': 'fade-in 0.2s var(--easing-default)',
        'fade-out': 'fade-out 0.15s var(--easing-default)',
        'expand-in': 'expand-in 0.2s var(--easing-default)',
      },
    },
  },
  plugins: [],
}

export default config
