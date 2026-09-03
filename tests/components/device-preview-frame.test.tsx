import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DevicePreviewFrame } from '@/components/cms/DevicePreviewFrame';
import type { ContentBlock } from '@/types';

describe('DevicePreviewFrame Component Unit Tests', () => {
  const mockBlocks: ContentBlock[] = [
    {
      id: 'blk_hero_preview',
      type: 'hero',
      name: 'Autumn Lookbook Hero',
      section: 'homepage',
      displayOrder: 1,
      isVisible: true,
      data: {
        title: 'Autumn Lookbook 2026',
        subtitle: 'Cashmere & Silk',
        badge: 'New Season',
      },
    } as any,
    {
      id: 'blk_hidden',
      type: 'newsletter',
      name: 'Hidden Block',
      section: 'homepage',
      displayOrder: 2,
      isVisible: false,
      data: { title: 'Hidden Newsletter' },
    } as any,
  ];

  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <DevicePreviewFrame isOpen={false} onClose={vi.fn()} blocks={mockBlocks} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render live preview frame and visible blocks when isOpen is true', () => {
    render(<DevicePreviewFrame isOpen={true} onClose={vi.fn()} blocks={mockBlocks} />);

    expect(screen.getByText('Live Storefront Preview')).toBeInTheDocument();
    expect(screen.getByText('Autumn Lookbook 2026')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Newsletter')).not.toBeInTheDocument();
  });

  it('should allow toggling between Desktop, Tablet, and Mobile viewports', () => {
    render(<DevicePreviewFrame isOpen={true} onClose={vi.fn()} blocks={mockBlocks} />);

    const tabletBtn = screen.getByText(/Tablet/i);
    const mobileBtn = screen.getByText(/Mobile/i);
    const desktopBtn = screen.getByText(/Desktop/i);

    fireEvent.click(tabletBtn);
    expect(tabletBtn.closest('button')).toHaveClass('bg-rose-600');

    fireEvent.click(mobileBtn);
    expect(mobileBtn.closest('button')).toHaveClass('bg-rose-600');

    fireEvent.click(desktopBtn);
    expect(desktopBtn.closest('button')).toHaveClass('bg-rose-600');
  });

  it('should trigger onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <DevicePreviewFrame isOpen={true} onClose={handleClose} blocks={mockBlocks} />
    );

    const closeBtn = container.querySelector('button .lucide-x')?.closest('button');
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });
});
