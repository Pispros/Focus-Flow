import { NativeModules } from 'react-native';

const { BackgroundTimer } = NativeModules;

export interface BackgroundTimerModule {
  scheduleTimerCheck: (endTimeMillis: number, durationMinutes: number, sessionId: number) => void;
  cancelTimerCheck: () => void;
}

export default BackgroundTimer as BackgroundTimerModule;
