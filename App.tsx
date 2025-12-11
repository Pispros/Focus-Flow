import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { TimerProvider } from './contexts/TimerContext';
import { requestNotificationPermission } from './modules/notification';
import OnboardingScreen from './screens/OnboardingScreen';
import SessionsScreen from './screens/SessionsScreen';
import TabNavigator from './screens/TabNavigator';
import WelcomeScreen from './screens/WelcomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  Sessions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  useEffect(() => {
    // Request notification permission on app start
    requestNotificationPermission();
  }, []);

  return (
    <TimerProvider>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Sessions" component={SessionsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TimerProvider>
  );
}
