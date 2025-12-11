import { NativeEventEmitter, NativeModules } from 'react-native';

// Define event payload types
export interface DeviceUnlockEvent {
  timestamp: number;
}

export interface DeviceLockEvent {
  timestamp: number;
}

export interface EventSubscription {
  remove: () => void;
}

// Get the native module using React Native's API
const { DeviceUnlock } = NativeModules;

console.log('[DeviceUnlock] NativeModules.DeviceUnlock:', DeviceUnlock);
console.log(
  '[DeviceUnlock] Available native modules:',
  Object.keys(NativeModules),
);

if (!DeviceUnlock) {
  console.error('[DeviceUnlock] Module not found in NativeModules!');
  throw new Error(
    'DeviceUnlock native module is not linked. Please follow the installation instructions.',
  );
}

console.log('[DeviceUnlock] Module loaded successfully');

// Create event emitter
const eventEmitter = new NativeEventEmitter(DeviceUnlock);
console.log('[DeviceUnlock] Event emitter created');

/**
 * Check if the device is currently locked
 */
export async function isDeviceLocked(): Promise<boolean> {
  return await DeviceUnlock.isDeviceLocked();
}

/**
 * Subscribe to device unlock events
 * @param listener Callback function that receives unlock events
 * @returns Subscription object with remove() method
 */
export function addUnlockListener(
  listener: (event: DeviceUnlockEvent) => void,
): EventSubscription {
  console.log('[DeviceUnlock] Adding unlock listener');
  const subscription = eventEmitter.addListener('onDeviceUnlock', event => {
    console.log('[DeviceUnlock] onDeviceUnlock event received:', event);
    listener(event);
  });
  return subscription;
}

/**
 * Subscribe to device lock events
 * @param listener Callback function that receives lock events
 * @returns Subscription object with remove() method
 */
export function addLockListener(
  listener: (event: DeviceLockEvent) => void,
): EventSubscription {
  console.log('[DeviceUnlock] Adding lock listener');
  const subscription = eventEmitter.addListener('onDeviceLock', event => {
    console.log('[DeviceUnlock] onDeviceLock event received:', event);
    listener(event);
  });
  return subscription;
}

export { DeviceUnlock as default };
