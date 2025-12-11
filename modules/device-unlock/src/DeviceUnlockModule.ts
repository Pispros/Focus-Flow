import { NativeModule, requireNativeModule } from 'expo';

import { DeviceUnlockModuleEvents } from './DeviceUnlock.types';

declare class DeviceUnlockModule extends NativeModule<DeviceUnlockModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<DeviceUnlockModule>('DeviceUnlock');
