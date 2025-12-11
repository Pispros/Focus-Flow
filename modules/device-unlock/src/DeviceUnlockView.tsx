import { requireNativeView } from 'expo';
import * as React from 'react';

import { DeviceUnlockViewProps } from './DeviceUnlock.types';

const NativeView: React.ComponentType<DeviceUnlockViewProps> =
  requireNativeView('DeviceUnlock');

export default function DeviceUnlockView(props: DeviceUnlockViewProps) {
  return <NativeView {...props} />;
}
