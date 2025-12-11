import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './DeviceUnlock.types';

type DeviceUnlockModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class DeviceUnlockModule extends NativeModule<DeviceUnlockModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(DeviceUnlockModule, 'DeviceUnlockModule');
