import { DesignTokens } from '../types/style.types';
import { BuilderTheme } from '../types/builder.types';

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: '#0F172A',
    secondary: '#334155',
    accent: '#E11D48',
    background: '#0B0F19',
    surface: '#111827',
    text: '#F8FAFC',
    heading: '#FFFFFF',
    muted: '#94A3B8',
    border: '#1E293B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    navigationFont: 'Outfit, sans-serif',
    buttonFont: 'Outfit, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
};

export const POPULAR_FONTS = [
  { label: 'Plus Jakarta Sans (Modern Clean)', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Outfit (Fashion & Editorial)', value: 'Outfit, sans-serif' },
  { label: 'Inter (SaaS & Digital)', value: 'Inter, sans-serif' },
  { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display, serif' },
  { label: 'Cinzel (Atelier Haute Couture)', value: 'Cinzel, serif' },
  { label: 'Cormorant Garamond (Fine Editorial)', value: 'Cormorant Garamond, serif' },
  { label: 'Montserrat (Geometric Modern)', value: 'Montserrat, sans-serif' },
  { label: 'Roboto (Universal Neutral)', value: 'Roboto, sans-serif' },
];

export function resolveTokenValue(
  val: string | undefined,
  theme?: BuilderTheme,
  tokens: DesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  if (!val) return '';
  if (!val.startsWith('$')) return val;

  // Resolve tokens like $colors.primary or $theme.accentColor
  const key = val.replace(/^\$/, '');
  if (key.startsWith('theme.') && theme) {
    const themeKey = key.replace('theme.', '') as keyof BuilderTheme;
    return theme[themeKey] || val;
  }

  if (key.startsWith('colors.')) {
    const cKey = key.replace('colors.', '') as keyof DesignTokens['colors'];
    return theme ? (theme as any)[`${cKey}Color`] || tokens.colors[cKey] || val : tokens.colors[cKey] || val;
  }

  if (key.startsWith('spacing.')) {
    const sKey = key.replace('spacing.', '') as keyof DesignTokens['spacing'];
    return tokens.spacing[sKey] || val;
  }

  if (key.startsWith('radius.')) {
    const rKey = key.replace('radius.', '') as keyof DesignTokens['radius'];
    return tokens.radius[rKey] || val;
  }

  if (key.startsWith('typography.')) {
    const tKey = key.replace('typography.', '') as keyof DesignTokens['typography'];
    return tokens.typography[tKey] || val;
  }

  return val;
}
