# FocusFlow

A Full Local timer to remind you to leave your phone and focus on things that actually matters. The countdown starts every time you unlock your phone. Free code, no backdoors or any sort of tracking / online metrics.

## Screenshots

<p>
  <img src="./assets/images/1.png" width="200" />
  &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
  <img src="./assets/images/2.png" width="200" />
  &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
  <img src="./assets/images/3.png" width="200" />
  &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
  <img src="./assets/images/4.png" width="200" />
  &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
  <img src="./assets/images/5.png" width="200" />
  &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
  <img src="./assets/images/6.png" width="200" />
</p>

## Features

- ⏱️ **Customizable Timer** - Set focus sessions from 5 to 60 minutes with preset options (15, 25, 45, 60 minutes)
- 🔒 **Smart Lock Detection** - Automatically handles phone locks (both manual and automatic screen timeout)
- 🔄 **Auto-Restart Sessions** - New session automatically starts when timer completes, even in background
- 📳 **Rich Notifications** - Custom notifications with vibration feedback when sessions complete
- 🌙 **Background Operation** - Timer continues running when phone is locked or app is in background
- 📊 **Progress Tracking** - View detailed statistics and track your daily, weekly, and overall progress
- 🎯 **Focus Sessions** - Complete focused work sessions with visual circular progress indicators
- 🔥 **Streak Tracking** - Maintain your focus streak and stay motivated with daily stats
- 📱 **Cross-Platform** - Native modules for both Android and iOS
- 🌓 **Dark Mode** - Eye-friendly dark theme optimized for extended focus sessions
- 💾 **Fully Local** - All data stored locally with SQLite, works completely offline
- 🚀 **Pure React Native** - No Expo dependencies, full native control

## Tech Stack

- **React Native** - Mobile framework (v0.82.1)
- **TypeScript** - Type-safe development
- **SQLite** - Local data persistence (react-native-sqlite-storage)
- **React Navigation** - Navigation library
- **Lucide React Native** - Beautiful icon set
- **React Native SVG** - Vector graphics support
- **AsyncStorage** - Persistent key-value storage
- **Custom Native Modules**:
  - Device lock/unlock detection (Android + iOS)
  - Background timer with WorkManager (Android) / Timer (iOS)
  - Push notifications with vibration (Android + iOS)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Java Development Kit (JDK 17 or higher)
- Android SDK

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd FocusFlow
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Run on Android:

```bash
npx react-native run-android
```

### Running on Different Platforms

- **Android**: Run `npx react-native run-android` (requires Android device/emulator)
- **iOS**: Run `cd ios && pod install && cd .. && npx react-native run-ios` (requires macOS with Xcode)

## Project Structure

```
FocusFlow/
├── android/                    # Android native code
│   └── app/
│       └── src/main/
│           └── java/com/focusflow/
├── ios/                        # iOS native code
│   └── focusFlow/
├── App.tsx                     # Root component with navigation
├── screens/                    # App screens
│   ├── TimerScreen.tsx        # Main timer interface
│   ├── StatsScreen.tsx        # Statistics and analytics
│   ├── SessionsScreen.tsx     # Session history
│   ├── WelcomeScreen.tsx      # Welcome screen
│   └── OnboardingScreen.tsx   # Onboarding flow
├── hooks/
│   └── app.hook.ts            # Timer and stats hooks
├── services/
│   └── app.service.ts         # Database and business logic
├── contexts/
│   └── TimerContext.tsx       # Global timer state management
├── modules/
│   ├── device-unlock/         # Native module for lock/unlock detection
│   │   ├── android/           # Android implementation (Kotlin)
│   │   ├── ios/               # iOS implementation (Swift)
│   │   ├── index.ts           # JavaScript bridge
│   │   └── useDeviceUnlock.ts # React hook
│   ├── background-timer/      # Background timer module
│   │   ├── android/           # WorkManager implementation
│   │   ├── ios/               # Timer implementation
│   │   └── index.ts           # JavaScript bridge
│   └── notification/          # Push notification module
│       ├── android/           # NotificationCompat + Vibrator
│       ├── ios/               # UNUserNotificationCenter + Haptics
│       └── index.ts           # JavaScript bridge
├── constants/
│   └── Colors.ts              # Color scheme
└── components/                # Reusable UI components
```

## Key Features Explained

### Device Lock Detection

The app includes custom native modules that detect when you lock and unlock your device on both Android and iOS:

**Android Implementation:**

- Uses BroadcastReceiver for `ACTION_SCREEN_OFF`, `ACTION_SCREEN_ON`, and `ACTION_USER_PRESENT`
- Periodic lock state checking via ProcessLifecycleOwner (every 2 seconds as backup)
- Detects both manual lock button press AND automatic screen timeout

**iOS Implementation:**

- Monitors `protectedDataWillBecomeUnavailableNotification` for lock events
- Tracks `protectedDataDidBecomeAvailableNotification` for unlock events
- Handles app lifecycle events for comprehensive coverage

**Behavior:**

- **On Lock**: Foreground countdown stops, background timer continues tracking
- **On Unlock**: Current session is cancelled (not saved) and a new session starts with the same duration
- **Accountability**: Encourages you to keep your phone locked during focus sessions

### Background Timer System

The app uses a sophisticated multi-layer approach to ensure timers work reliably in the background:

**Android:**

- WorkManager schedules one-time jobs to fire when timer expires
- Jobs run even when app is fully closed or phone is in deep sleep
- Sends events to JS layer when app is running, handles completion independently when closed

**iOS:**

- Native Timer with RunLoop integration for background execution
- Background modes enabled in Info.plist for continued operation
- Haptic feedback triggers from native code

**Features:**

- Timestamp-based calculations (not interval-based) for accuracy
- AsyncStorage persistence survives app restarts
- Automatic session restart when timer completes in background
- Notifications with vibration triggered from native code

### Notifications & Vibration

Custom notification system that works reliably in all app states:

**Android:**

- NotificationCompat with custom notification channel
- Direct Vibrator service access for 4-second triple-pulse pattern
- Vibration triggers from native code (works even in background)
- POST_NOTIFICATIONS permission handling for Android 13+

**iOS:**

- UNUserNotificationCenter for local notifications
- AudioServicesPlaySystemSound for haptic feedback
- Triple-pulse vibration pattern matching Android
- Triggers from native code for background reliability

### Timer Mechanism

- Uses timestamp-based countdown that continues even when app is in background or phone is locked
- Global state management using React Context for real-time UI updates across all screens
- Automatic session completion and database storage
- Smart state restoration when app returns to foreground
- Progress clamping prevents UI glitches during state transitions

### Statistics & Analytics

- **Today's Stats**: Total focus time and session count
- **Weekly Chart**: Visual bar chart of daily focus hours
- **Overall Stats**: Total sessions, average session length, current streak
- **Session History**: Detailed list of recent sessions with completion status

## Key Screens

- **Welcome Screen**: Introduction to FocusFlow features
- **Onboarding**: Quick setup and tutorial
- **Timer Screen**: Main timer interface with circular progress indicator
- **Stats Screen**: Detailed productivity analytics and charts
- **Sessions Screen**: Complete session history

## Customization

### Colors

Edit `constants/Colors.ts` to customize the app's color scheme:

```typescript
export default {
  dark: {
    background: '#09090b',
    primary: '#f97316',
    // ... more colors
  },
  light: {
    // Light mode colors
  },
};
```

## Development

### Scripts

- `npm start` - Start the Metro bundler
- `npx react-native run-android` - Build and run on Android device/emulator
- `adb logcat` - View Android logs for debugging

### Building for Production

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`

## Privacy & Security

- **100% Local**: All data stored locally on your device using SQLite
- **No Internet Required**: Works completely offline
- **No Tracking**: Zero analytics, metrics, or user tracking
- **No Permissions Abuse**: Only requires VIBRATE and POST_NOTIFICATIONS permissions
- **Open Source**: Full transparency - review the code yourself
- **No Expo**: Pure React Native implementation with full control over native code

## Native Modules

This app includes three custom native modules written from scratch:

1. **DeviceUnlock** (Kotlin/Swift) - Lock/unlock detection
2. **BackgroundTimer** (Kotlin/Swift) - Background task scheduling
3. **FocusFlowNotification** (Kotlin/Swift) - Notifications with haptics

All modules are bridged to React Native and provide a clean JavaScript API.

## License

0BSD - Zero-Clause BSD License (Public Domain Equivalent)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
