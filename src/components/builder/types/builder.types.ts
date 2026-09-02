export type BuilderType = 'header' | 'footer' | 'homepage' | 'collection' | 'product' | 'landing-page';

export type BuilderStatus = 'draft' | 'published';

export type BuilderDevice = 'desktop' | 'tablet' | 'mobile';

export type BlockCategory = 'content' | 'commerce' | 'social' | 'contact' | 'layout' | 'navigation' | 'media';

export interface ResponsiveVisibility {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface ResponsiveStyle<T> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

export interface BlockVisibilitySettings {
  scheduleEnabled?: boolean;
  startDate?: string;
  endDate?: string;
  customerTags?: string[];
  targetAudience?: 'all' | 'logged_in' | 'guests' | 'vip';
}

export interface BuilderBlock<TContent = Record<string, any>, TStyles = Record<string, any>> {
  id: string;
  type: string;
  category?: BlockCategory;
  name?: string;
  enabled: boolean;
  locked?: boolean;
  order: number;
  columnSpan?: number; // 1 to 12
  content: TContent;
  styles?: TStyles;
  layout?: {
    width?: string;
    maxWidth?: string;
    height?: string;
    minHeight?: string;
    padding?: string;
    margin?: string;
    gap?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    verticalAlignment?: 'top' | 'middle' | 'bottom';
  };
  responsive?: {
    desktop?: { visible?: boolean; [key: string]: any };
    tablet?: { visible?: boolean; [key: string]: any };
    mobile?: { visible?: boolean; [key: string]: any };
  };
  visibility?: BlockVisibilitySettings;
  customCss?: string;
  customClass?: string;
  anchorId?: string;
}

export interface BuilderSection {
  id: string;
  name: string;
  type?: string;
  enabled: boolean;
  locked?: boolean;
  order: number;
  layout: {
    containerWidth?: 'full' | 'contained' | 'narrow' | 'custom';
    maxWidth?: number;
    columns?: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    gap?: string;
    paddingY?: string;
    paddingX?: string;
    marginY?: string;
  };
  styles: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    backgroundOverlay?: string;
    textColor?: string;
    headingColor?: string;
    accentColor?: string;
    borderColor?: string;
    borderTopWidth?: string;
    borderBottomWidth?: string;
    shadow?: string;
  };
  responsive?: {
    desktop?: { visible?: boolean };
    tablet?: { visible?: boolean };
    mobile?: { visible?: boolean; accordion?: boolean; defaultExpanded?: boolean };
  };
  visibility?: BlockVisibilitySettings;
  blocks: BuilderBlock[];
}

export interface BuilderTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  headingColor: string;
  mutedTextColor: string;
  borderColor: string;
  fontFamily: string;
  headingFontFamily: string;
  fontSize: string;
  letterSpacing: string;
}

export interface BuilderDocument<TMeta = Record<string, any>> {
  id: string;
  tenantId: string;
  tenantSlug: string;
  type: BuilderType;
  preset?: string;
  name?: string;
  status: BuilderStatus;
  version: number;
  sections: BuilderSection[];
  theme: BuilderTheme;
  metadata?: TMeta;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface BuilderPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  previewImage?: string;
  document: Partial<BuilderDocument>;
}

export interface BuilderVersion {
  versionId: string;
  version: number;
  tenantId: string;
  builderType: BuilderType;
  status: BuilderStatus;
  snapshot: BuilderDocument;
  createdBy?: string;
  createdAt: string;
  publishedAt?: string;
  changeSummary?: string;
}
