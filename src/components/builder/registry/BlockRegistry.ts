import React from 'react';
import { BuilderBlock, BlockCategory } from '../types/builder.types';

export interface BlockDefinition<TContent = any, TStyles = any> {
  type: string;
  name: string;
  category: BlockCategory;
  description: string;
  icon: string | React.ComponentType<{ className?: string }>;
  defaultContent: TContent;
  defaultStyles?: TStyles;
  defaultLayout?: Record<string, any>;
  defaultColumnSpan?: number;
  render: React.ComponentType<{
    block: BuilderBlock<TContent, TStyles>;
    device?: 'desktop' | 'tablet' | 'mobile';
    isEditor?: boolean;
    tenantSlug?: string;
    onUpdate?: (content: Partial<TContent>, styles?: Partial<TStyles>) => void;
  }>;
  inspectorFields?: {
    content?: Array<{
      name: string;
      label: string;
      type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'menu_select' | 'array' | 'json';
      options?: Array<{ label: string; value: any }>;
      placeholder?: string;
      defaultValue?: any;
      description?: string;
    }>;
  };
}

class BlockRegistryService {
  private definitions: Map<string, BlockDefinition> = new Map();

  public register(def: BlockDefinition) {
    this.definitions.set(def.type, def);
  }

  public registerMany(defs: BlockDefinition[]) {
    defs.forEach((d) => this.register(d));
  }

  public get(type: string): BlockDefinition | undefined {
    return this.definitions.get(type);
  }

  public getAll(): BlockDefinition[] {
    return Array.from(this.definitions.values());
  }

  public getByCategory(category: BlockCategory): BlockDefinition[] {
    return this.getAll().filter((d) => d.category === category);
  }

  public createBlockInstance(type: string, overrides: Partial<BuilderBlock> = {}): BuilderBlock {
    const def = this.get(type);
    const id = `blk_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    return {
      id,
      type,
      category: def?.category || 'content',
      name: def?.name || type,
      enabled: true,
      order: 1,
      columnSpan: def?.defaultColumnSpan || 1,
      content: { ...(def?.defaultContent || {}), ...(overrides.content || {}) },
      styles: { ...(def?.defaultStyles || {}), ...(overrides.styles || {}) },
      layout: { ...(def?.defaultLayout || {}), ...(overrides.layout || {}) },
      responsive: {
        desktop: { visible: true },
        tablet: { visible: true },
        mobile: { visible: true },
      },
      ...overrides,
    };
  }
}

export const BlockRegistry = new BlockRegistryService();
