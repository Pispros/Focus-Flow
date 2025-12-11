import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { FocusFlowNotification } = NativeModules;

interface NotificationModule {
  showCompletionNotification: (title: string, message: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

export const FocusNotification = FocusFlowNotification as NotificationModule;

// Mix of motivational and mean messages - completing a session means you wasted time doom scrolling
const COMPLETION_MESSAGES = [
  {
    title: '😤 Time Gone Forever',
    message:
      'You just wasted {minutes} minutes scrolling. Your competition is working.',
  },
  {
    title: '📱 Phone Wins Again',
    message:
      '{minutes} minutes down the drain. You could have built something.',
  },
  {
    title: '⏰ Wake Up Call',
    message: 'Another {minutes} minutes wasted. When will you learn?',
  },
  {
    title: '🎯 Missed Opportunity',
    message:
      '{minutes} minutes of scrolling. That time is gone. Make the next {minutes} count.',
  },
  {
    title: '💪 Do Better',
    message:
      "Wasted {minutes} minutes on distractions. You know you're capable of more.",
  },
  {
    title: '🔥 Stop the Bleeding',
    message: '{minutes} minutes lost to scrolling. Break the cycle now.',
  },
  {
    title: '⚡ Reality Check',
    message:
      "That's {minutes} minutes you'll never get back. Use the next session wisely.",
  },
  {
    title: '🚀 Course Correction',
    message:
      '{minutes} minutes wasted, but you can turn this around. Start now.',
  },
  {
    title: '💎 Hidden Potential',
    message:
      'You threw away {minutes} minutes. Imagine what you could achieve if you focused.',
  },
  {
    title: '🎪 Stop Playing',
    message:
      "{minutes} minutes scrolling isn't working. Try actual work next time.",
  },
  {
    title: '🏆 Still Got Time',
    message:
      "You wasted {minutes} minutes, but the day isn't over. Prove yourself.",
  },
  {
    title: '📈 Reverse the Trend',
    message:
      '{minutes} minutes gone to nothing. Change starts with the next session.',
  },
  {
    title: '🔨 Build Something',
    message:
      'Another {minutes} minutes scrolling. Your dreams need action, not screens.',
  },
  {
    title: '⚔️ Fight Back',
    message: '{minutes} minutes lost to your phone. Win the next battle.',
  },
  {
    title: '🎯 Focus Failed',
    message: '{minutes} minutes wasted. Learn from it and lock in next time.',
  },
  {
    title: '🚫 Pattern Detected',
    message:
      'You keep wasting time. This {minutes} minutes could have changed everything.',
  },
  {
    title: '💯 No More Excuses',
    message:
      "{minutes} minutes scrolling won't get you anywhere. Time to step up.",
  },
  {
    title: "⭐ You're Better Than This",
    message:
      '{minutes} minutes wasted when you could have been crushing goals.',
  },
  {
    title: '🔴 Warning Shot',
    message: 'Another {minutes} minutes gone. How many more before you change?',
  },
  {
    title: '⏳ Time Slipping Away',
    message:
      "{minutes} minutes of your life wasted. Don't let it happen again.",
  },
];

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
  if (!FocusFlowNotification) {
    console.error('[FocusFlow] FocusFlowNotification module not available!');
    return;
  }

  // Pick a random message from the list
  const randomMessage =
    COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
  const message = randomMessage.message.replace(
    '{minutes}',
    sessionMinutes.toString(),
  );

  FocusNotification.showCompletionNotification(randomMessage.title, message);
}
