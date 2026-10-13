import { useEffect } from 'react';
import { acquireScrollLock, releaseScrollLock } from '../utils/scrollLock';

/**
 * Custom React hook to reliably lock background scrolling when a modal or dialog is open.
 *
 * Supports nested modals (reference counted). Automatically handles cleanup when
 * components unmount or boolean state changes.
 *
 * @param isLocked Whether the current modal/dialog is visible and active.
 */
export function useScrollLock(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked) return;

    acquireScrollLock();

    return () => {
      releaseScrollLock();
    };
  }, [isLocked]);
}
