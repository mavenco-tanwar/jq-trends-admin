import { ThemeDocument } from '../types/theme.types';

export function generateThemeCssVariables(theme: ThemeDocument): string {
  const c = theme.colors;
  const t = theme.typography;
  const b = theme.buttons;
  const f = theme.forms;
  const cd = theme.cards;
  const r = theme.radius;
  const s = theme.spacing;
  const sh = theme.shadows;
  const l = theme.layout;

  return `
  :root {
    /* Semantic Colors */
    --theme-color-primary: ${c.primary};
    --theme-color-primary-hover: ${c.primaryHover};
    --theme-color-secondary: ${c.secondary};
    --theme-color-secondary-hover: ${c.secondaryHover};
    --theme-color-accent: ${c.accent};
    --theme-color-accent-hover: ${c.accentHover};
    --theme-color-background: ${c.background};
    --theme-color-surface: ${c.surface};
    --theme-color-surface-secondary: ${c.surfaceSecondary};
    --theme-color-text: ${c.text};
    --theme-color-text-secondary: ${c.textSecondary};
    --theme-color-text-muted: ${c.textMuted};
    --theme-color-heading: ${c.heading};
    --theme-color-border: ${c.border};
    --theme-color-border-light: ${c.borderLight};
    --theme-color-success: ${c.success};
    --theme-color-warning: ${c.warning};
    --theme-color-error: ${c.error};
    --theme-color-info: ${c.info};
    --theme-color-overlay: ${c.overlay};

    /* Typography Fonts */
    --theme-font-heading: ${t.headingFont};
    --theme-font-body: ${t.bodyFont};
    --theme-font-navigation: ${t.navigationFont};
    --theme-font-button: ${t.buttonFont};

    /* Headings Scale */
    --theme-h1-size: ${t.h1.fontSize};
    --theme-h1-weight: ${t.h1.fontWeight};
    --theme-h1-line-height: ${t.h1.lineHeight};
    --theme-h1-letter-spacing: ${t.h1.letterSpacing};

    --theme-h2-size: ${t.h2.fontSize};
    --theme-h2-weight: ${t.h2.fontWeight};
    --theme-h2-line-height: ${t.h2.lineHeight};

    --theme-h3-size: ${t.h3.fontSize};
    --theme-h3-weight: ${t.h3.fontWeight};
    --theme-h3-line-height: ${t.h3.lineHeight};

    --theme-body-size: ${t.body.fontSize};
    --theme-body-line-height: ${t.body.lineHeight};

    /* Button Defaults */
    --theme-btn-radius: ${b.borderRadius};
    --theme-btn-primary-bg: ${b.variants.primary.background};
    --theme-btn-primary-text: ${b.variants.primary.textColor};
    --theme-btn-primary-hover-bg: ${b.variants.primary.hoverBackground};
    --theme-btn-primary-hover-text: ${b.variants.primary.hoverTextColor};

    /* Form Defaults */
    --theme-form-bg: ${f.background};
    --theme-form-text: ${f.text};
    --theme-form-border: ${f.border};
    --theme-form-focus-border: ${f.focusBorder};
    --theme-form-focus-shadow: ${f.focusShadow};
    --theme-form-radius: ${f.borderRadius};
    --theme-form-height: ${f.height};

    /* Card Defaults */
    --theme-card-bg: ${cd.background};
    --theme-card-border: ${cd.border};
    --theme-card-radius: ${cd.borderRadius};
    --theme-card-shadow: ${cd.shadow};
    --theme-card-hover-shadow: ${cd.hoverShadow};

    /* Radius Tokens */
    --theme-radius-none: ${r.none};
    --theme-radius-xs: ${r.xs};
    --theme-radius-sm: ${r.sm};
    --theme-radius-md: ${r.md};
    --theme-radius-lg: ${r.lg};
    --theme-radius-xl: ${r.xl};
    --theme-radius-2xl: ${r['2xl']};
    --theme-radius-full: ${r.full};

    /* Spacing Tokens */
    --theme-space-xs: ${s.xs};
    --theme-space-sm: ${s.sm};
    --theme-space-md: ${s.md};
    --theme-space-lg: ${s.lg};
    --theme-space-xl: ${s.xl};
    --theme-space-2xl: ${s['2xl']};
    --theme-space-3xl: ${s['3xl']};
    --theme-space-4xl: ${s['4xl']};

    /* Shadow Tokens */
    --theme-shadow-sm: ${sh.sm};
    --theme-shadow-md: ${sh.md};
    --theme-shadow-lg: ${sh.lg};
    --theme-shadow-xl: ${sh.xl};
    --theme-shadow-2xl: ${sh['2xl']};

    /* Layout Tokens */
    --theme-container-small: ${l.container.small};
    --theme-container-medium: ${l.container.medium};
    --theme-container-large: ${l.container.large};
    --theme-container-full: ${l.container.full};
  }

  ${theme.customCss || ''}
  `.trim();
}

/**
 * Resolves a visual style value according to the cascade:
 * Component Override -> Section Override -> Page Override -> Global Theme -> Platform Default
 */
export function resolveThemeStyle(
  componentVal: string | undefined,
  sectionVal: string | undefined,
  themeVal: string | undefined,
  platformDefault: string
): string {
  if (componentVal && componentVal.trim() !== '' && componentVal !== 'inherit') return componentVal;
  if (sectionVal && sectionVal.trim() !== '' && sectionVal !== 'inherit') return sectionVal;
  if (themeVal && themeVal.trim() !== '') return themeVal;
  return platformDefault;
}
