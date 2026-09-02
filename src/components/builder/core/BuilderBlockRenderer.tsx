'use client';

import React from 'react';
import { BuilderBlock, BuilderDevice } from '../types/builder.types';
import { BlockRegistry } from '../registry/BlockRegistry';

interface BuilderBlockRendererProps {
  block: BuilderBlock;
  device?: BuilderDevice;
  isEditor?: boolean;
  tenantSlug?: string;
  onUpdate?: (content: Partial<any>, styles?: Partial<any>) => void;
}

export function BuilderBlockRenderer({
  block,
  device = 'desktop',
  isEditor = false,
  tenantSlug,
  onUpdate,
}: BuilderBlockRendererProps) {
  // Check if hidden on current device
  if (block.enabled === false) {
    if (!isEditor) return null;
  }

  const deviceVis = block.responsive?.[device]?.visible;
  if (deviceVis === false && !isEditor) {
    return null;
  }

  const definition = BlockRegistry.get(block.type);

  if (!definition) {
    return (
      <div className="p-3 rounded-lg border border-dashed border-amber-500/40 bg-amber-950/20 text-amber-300 text-xs font-mono">
        Unregistered block: {block.type}
      </div>
    );
  }

  const Component = definition.render;

  return (
    <div
      id={block.anchorId || undefined}
      className={`relative w-full ${block.customClass || ''}`}
      style={{
        opacity: block.styles?.opacity !== undefined ? block.styles.opacity : 1,
      }}
    >
      <Component
        block={block}
        device={device}
        isEditor={isEditor}
        tenantSlug={tenantSlug}
        onUpdate={onUpdate}
      />
    </div>
  );
}
