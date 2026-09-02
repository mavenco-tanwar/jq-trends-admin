import { useState, useCallback, useEffect } from 'react';
import { BuilderDocument } from '../types/builder.types';

export function useBuilderHistory(initialDoc: BuilderDocument) {
  const [history, setHistory] = useState<BuilderDocument[]>([initialDoc]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = useCallback((newDoc: BuilderDocument) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, currentIndex + 1);
      const next = [...upToCurrent, JSON.parse(JSON.stringify(newDoc))];
      // Limit history to 50 entries
      if (next.length > 50) next.shift();
      return next;
    });
    setCurrentIndex((prev) => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback((): BuilderDocument | null => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1;
      setCurrentIndex(nextIdx);
      return history[nextIdx];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback((): BuilderDocument | null => {
    if (currentIndex < history.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      return history[nextIdx];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Keyboard shortcut listener: Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger inside inputs/textareas
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState: history[currentIndex] || initialDoc,
    historyLength: history.length,
    currentIndex,
  };
}
