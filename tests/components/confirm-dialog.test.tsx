import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog Component Unit Tests', () => {
  it('should not render content when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product?"
      />
    );

    expect(screen.queryByText('Delete Product')).not.toBeInTheDocument();
  });

  it('should render title and warning message when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product?"
        confirmLabel="Yes, Delete"
      />
    );

    expect(screen.getByText('Delete Product')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to permanently delete this product?')
    ).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should trigger onClose when Cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
        title="Cancel Test"
        message="Testing cancel button"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger onConfirm and onClose when Confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Confirm Test"
        message="Testing confirm action"
        confirmLabel="Proceed"
      />
    );

    fireEvent.click(screen.getByText('Proceed'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
