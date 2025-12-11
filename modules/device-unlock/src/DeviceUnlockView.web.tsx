import * as React from 'react';

import { DeviceUnlockViewProps } from './DeviceUnlock.types';

export default function DeviceUnlockView(props: DeviceUnlockViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
