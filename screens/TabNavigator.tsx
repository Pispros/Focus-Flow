import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart2, Clock } from 'lucide-react-native';
import React from 'react';
import Colors from '../constants/Colors';
import StatsScreen from './StatsScreen';
import TimerScreen from './TimerScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.white,
        tabBarStyle: {
          height: 70,
          backgroundColor: Colors.dark.background,
          display: 'flex',
          alignContent: 'space-around',
          justifyContent: 'center',
          paddingBottom: 0,
          paddingTop: 10,
          borderTopColor: Colors.dark.border,
        },
        tabBarIconStyle: { color: Colors.dark.white },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <Clock size={24} stroke={color} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <BarChart2 size={24} stroke={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
