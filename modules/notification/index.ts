import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { FocusFlowNotification } = NativeModules;

interface NotificationModule {
  showCompletionNotification: (title: string, message: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

export const FocusNotification = FocusFlowNotification as NotificationModule;

// Request notification permission on Android 13+
export async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'FocusFlow Notification Permission',
          message:
            'FocusFlow needs notification permission to alert you when focus sessions complete.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('[FocusFlow] Notification permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[FocusFlow] Notification permission error:', err);
      return false;
    }
  }
  return true; // Permission not needed on older Android or iOS
}

export function showSessionCompletedNotification(sessionMinutes: number) {
  console.log(
    '[FocusFlow] Showing completion notification for',
    sessionMinutes,
    'minutes',
  );
  console.log(
    '[FocusFlow] FocusFlowNotification module:',
    FocusFlowNotification,
  );

  if (!FocusFlowNotification) {
    console.error('[FocusFlow] FocusFlowNotification module not available!');
    return;
  }

  FocusNotification.showCompletionNotification(
    '🎯 Focus Session Completed!',
    `Great work! You completed ${sessionMinutes} minutes of focused work.`,
  );
}
