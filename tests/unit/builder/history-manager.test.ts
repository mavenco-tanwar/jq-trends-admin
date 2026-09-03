import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderHistory } from '@/components/builder/history/HistoryManager';
import { mockBuilderDocumentFixture } from '../../fixtures/builder.fixture';

describe('Builder History Manager Hook Unit Tests', () => {
  it('should initialize with initial document state', () => {
    const { result } = renderHook(() => useBuilderHistory(mockBuilderDocumentFixture));

    expect(result.current.historyLength).toBe(1);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.currentState.name).toBe('Homepage V2');
  });

  it('should push new document states and enable undo', () => {
    const { result } = renderHook(() => useBuilderHistory(mockBuilderDocumentFixture));

    const updatedDoc = {
      ...mockBuilderDocumentFixture,
      name: 'Homepage V2 - Modified',
    };

    act(() => {
      result.current.pushState(updatedDoc);
    });

    expect(result.current.historyLength).toBe(2);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.currentState.name).toBe('Homepage V2 - Modified');
  });

  it('should undo and redo state changes accurately', () => {
    const { result } = renderHook(() => useBuilderHistory(mockBuilderDocumentFixture));

    const doc2 = { ...mockBuilderDocumentFixture, name: 'State 2' };
    const doc3 = { ...mockBuilderDocumentFixture, name: 'State 3' };

    act(() => {
      result.current.pushState(doc2);
    });
    act(() => {
      result.current.pushState(doc3);
    });

    expect(result.current.currentState.name).toBe('State 3');
    expect(result.current.canUndo).toBe(true);

    // Undo to State 2
    act(() => {
      result.current.undo();
    });
    expect(result.current.currentState.name).toBe('State 2');
    expect(result.current.canRedo).toBe(true);

    // Undo to initial
    act(() => {
      result.current.undo();
    });
    expect(result.current.currentState.name).toBe('Homepage V2');
    expect(result.current.canUndo).toBe(false);

    // Redo back to State 2
    act(() => {
      result.current.redo();
    });
    expect(result.current.currentState.name).toBe('State 2');
  });

  it('should cap history to a maximum of 50 states', () => {
    const { result } = renderHook(() => useBuilderHistory(mockBuilderDocumentFixture));

    act(() => {
      for (let i = 1; i <= 60; i++) {
        result.current.pushState({
          ...mockBuilderDocumentFixture,
          name: `State ${i}`,
        });
      }
    });

    expect(result.current.historyLength).toBeLessThanOrEqual(50);
  });
});
