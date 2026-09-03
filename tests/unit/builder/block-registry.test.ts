import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { BlockRegistry, BlockDefinition } from '@/components/builder/registry/BlockRegistry';

describe('BlockRegistry Unit Tests', () => {
  const dummyBlockDef: BlockDefinition = {
    type: 'test_announcement',
    name: 'Announcement Bar',
    category: 'layout',
    description: 'Displays top banner message',
    icon: 'megaphone',
    defaultContent: {
      text: 'Complimentary shipping over ₹5000',
    },
    defaultStyles: {
      backgroundColor: '#000000',
      color: '#ffffff',
    },
    render: () => React.createElement('div', null, 'Banner'),
  };

  beforeEach(() => {
    BlockRegistry.register(dummyBlockDef);
  });

  describe('Registration & Retrieval', () => {
    it('should register and retrieve a block definition by type', () => {
      const def = BlockRegistry.get('test_announcement');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Announcement Bar');
      expect(def?.category).toBe('layout');
      expect(def?.defaultContent.text).toBe('Complimentary shipping over ₹5000');
    });

    it('should retrieve blocks filtered by category', () => {
      const layoutBlocks = BlockRegistry.getByCategory('layout');
      expect(layoutBlocks.length).toBeGreaterThan(0);
      expect(layoutBlocks.some((b) => b.type === 'test_announcement')).toBe(true);
    });

    it('should retrieve all registered blocks', () => {
      const all = BlockRegistry.getAll();
      expect(all.length).toBeGreaterThan(0);
    });
  });

  describe('createBlockInstance', () => {
    it('should instantiate a builder block with unique ID and default values', () => {
      const instance = BlockRegistry.createBlockInstance('test_announcement');

      expect(instance.id).toMatch(/^blk_test_announcement_/);
      expect(instance.type).toBe('test_announcement');
      expect(instance.category).toBe('layout');
      expect(instance.enabled).toBe(true);
      expect(instance.content.text).toBe('Complimentary shipping over ₹5000');
      expect(instance.responsive?.desktop?.visible).toBe(true);
      expect(instance.responsive?.mobile?.visible).toBe(true);
    });

    it('should merge custom overrides when creating a block instance', () => {
      const instance = BlockRegistry.createBlockInstance('test_announcement', {
        content: { text: 'Custom Flash Sale!' },
        enabled: false,
      });

      expect(instance.content.text).toBe('Custom Flash Sale!');
      expect(instance.enabled).toBe(false);
    });
  });
});
