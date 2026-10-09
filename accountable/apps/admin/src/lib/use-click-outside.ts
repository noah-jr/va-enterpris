import * as React from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: () => void,
  enabled = true,
): void {
  React.useEffect(() => {
    if (!enabled) return;
    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target;
      if (ref.current && target instanceof Node && !ref.current.contains(target)) {
        onOutside();
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onOutside();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, onOutside, enabled]);
}
