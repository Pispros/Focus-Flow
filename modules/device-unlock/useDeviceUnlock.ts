import { useEffect, useRef } from 'react';
import { addLockListener, addUnlockListener, EventSubscription } from './index';

interface UseDeviceUnlockOptions {
  onUnlock?: (timestamp: number) => void;
  onLock?: (timestamp: number) => void;
}

/**
 * React hook for listening to device lock/unlock events
 *
 * @example
 * ```tsx
 * useDeviceUnlock({
 *   onUnlock: (timestamp) => {
 *     console.log('Device unlocked at:', timestamp);
 *     resetTimer();
 *   },
 *   onLock: (timestamp) => {
 *     console.log('Device locked at:', timestamp);
 *   }
 * });
 * ```
 */
export function useDeviceUnlock(options: UseDeviceUnlockOptions = {}) {
  const { onUnlock, onLock } = options;

  // Use refs to avoid re-subscribing when callbacks change
  const onUnlockRef = useRef(onUnlock);
  const onLockRef = useRef(onLock);

  useEffect(() => {
    onUnlockRef.current = onUnlock;
    onLockRef.current = onLock;
  }, [onUnlock, onLock]);

  useEffect(() => {
    console.log('[useDeviceUnlock] Setting up listeners...');
    const subscriptions: EventSubscription[] = [];

    // Subscribe to unlock events
    const unlockSub = addUnlockListener(event => {
      console.log(
        '[useDeviceUnlock] Unlock event received, calling callback with timestamp:',
        event.timestamp,
      );
      onUnlockRef.current?.(event.timestamp);
    });
    subscriptions.push(unlockSub);

    // Subscribe to lock events
    const lockSub = addLockListener(event => {
      console.log(
        '[useDeviceUnlock] Lock event received, calling callback with timestamp:',
        event.timestamp,
      );
      onLockRef.current?.(event.timestamp);
    });
    subscriptions.push(lockSub);

    console.log('[useDeviceUnlock] Listeners set up successfully');

    // Cleanup on unmount
    return () => {
      console.log('[useDeviceUnlock] Cleaning up listeners');
      subscriptions.forEach(sub => sub.remove());
    };
  }, []);
}
