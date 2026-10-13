/**
 * Centralized Scroll Lock Manager
 *
 * Provides bulletproof Background Scroll Lock across Desktop, iOS Safari, and Android:
 * 1. Reference counted: handles arbitrary nested modals (Modal within Modal).
 * 2. Saves and restores exact page scroll position without visual jumps.
 * 3. Compensates for scrollbar width on desktop to prevent layout shifts.
 * 4. Isolates touch events and overscroll on mobile to prevent rubber-banding/scroll chaining.
 */

interface SavedBodyStyles {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  paddingRight: string;
}

let lockCount = 0;
let savedScrollY = 0;
let savedStyles: SavedBodyStyles | null = null;

export function acquireScrollLock(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Increment reference counter
  lockCount += 1;

  // If already locked by another modal, keep existing lock intact
  if (lockCount > 1) {
    return;
  }

  // Record current scroll position
  savedScrollY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  // Calculate desktop scrollbar width to prevent horizontal layout shift
  const scrollbarWidth = Math.max(
    0,
    window.innerWidth - document.documentElement.clientWidth
  );

  const body = document.body;
  const docEl = document.documentElement;

  // Preserve previous inline styles
  savedStyles = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  };

  // Add scrollbar compensation if needed
  if (scrollbarWidth > 0) {
    const existingPaddingRight = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${existingPaddingRight + scrollbarWidth}px`;
  }

  // Lock body securely
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';

  // Mark classes on html and body for CSS overscroll prevention
  docEl.classList.add('modal-scroll-locked');
  body.classList.add('modal-scroll-locked');
}

export function releaseScrollLock(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (lockCount <= 0) {
    lockCount = 0;
    return;
  }

  lockCount -= 1;

  // If other modals are still active, remain locked
  if (lockCount > 0) {
    return;
  }

  const body = document.body;
  const docEl = document.documentElement;

  // Restore previous styles
  if (savedStyles) {
    body.style.overflow = savedStyles.overflow;
    body.style.position = savedStyles.position;
    body.style.top = savedStyles.top;
    body.style.left = savedStyles.left;
    body.style.right = savedStyles.right;
    body.style.width = savedStyles.width;
    body.style.paddingRight = savedStyles.paddingRight;
    savedStyles = null;
  } else {
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.style.paddingRight = '';
  }

  docEl.classList.remove('modal-scroll-locked');
  body.classList.remove('modal-scroll-locked');

  // Restore exact scroll position without smooth jump animation
  window.scrollTo({
    top: savedScrollY,
    left: 0,
    behavior: 'instant' as ScrollBehavior,
  });
}

/**
 * Returns whether scroll lock is currently active.
 */
export function isScrollLocked(): boolean {
  return lockCount > 0;
}
