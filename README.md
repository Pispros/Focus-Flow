# FocusFlow

A Full Local timer to remind you to forget your phone and focus on things that actually matters. The countdown starts every time you unlock your phone. Free code, no backdoors or any sort of tracking / online metrics.

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

- ⏱️ **Customizable Timer** - Set focus sessions from 5 to 60 minutes with preset options
- 📊 **Progress Tracking** - View detailed statistics and track your daily, weekly, and monthly progress
- 🎯 **Focus Sessions** - Complete Pomodoro sessions with visual progress indicators
- 🔥 **Streak Tracking** - Maintain your focus streak and stay motivated
- 🌓 **Dark Mode** - Eye-friendly dark theme for extended focus sessions
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

## Tech Stack

- **React Native** - Mobile framework
- **Expo Router** - File-based navigation
- **Expo SQLite** - Local data persistence
- **Lucide React Native** - Beautiful icons
- **React Native SVG** - Vector graphics support
- **TypeScript** - Type-safe development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, installed automatically)

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

### Running on Different Platforms

- **iOS**: Press `i` in the terminal or run `npm run ios`
- **Android**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`

## Project Structure

```
FocusFlow/
├── app/
│   ├── (tabs)/           # Tab navigation screens
│   │   ├── index.tsx     # Timer screen
│   │   └── stats.tsx     # Statistics screen
│   ├── (onboarding)/     # Onboarding flow
│   │   └── onboarding.tsx
│   ├── _layout.tsx       # Root layout
│   └── index.tsx         # App entry point
├── assets/
│   ├── fonts/
│   └── images/
├── components/           # Reusable components
├── constants/           # App constants and colors
├── hooks/               # Custom React hooks
└── services/            # Business logic and utilities
```

## Key Screens

- **Welcome Screen**: Introduction to FocusFlow features
- **Onboarding**: Quick setup and tutorial
- **Timer Screen**: Main timer interface
- **Stats Screen**: Detailed productivity analytics

## Customization

### Colors

Edit `constants/Colors.ts` to customize the app's color scheme:

```typescript
export default {
  dark: {
    background: "#09090b",
    primary: "#f97316",
    // ... more colors
  },
  light: {
    // Light mode colors
  },
};
```

## Development

### Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## License

0BSD

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
