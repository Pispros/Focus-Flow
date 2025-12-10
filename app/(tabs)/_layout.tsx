import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import { BarChart2, Clock } from "lucide-react-native";
import React from "react";
import { useWindowDimensions } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["dark"].primary,
        tabBarInactiveTintColor: Colors["dark"].white,
        tabBarStyle: {
          height: 70,
          backgroundColor: Colors["dark"].background,
          display: "flex",
          alignContent: "space-around",
          justifyContent: "center",
          paddingBottom: 0,
          paddingTop: width <= 767 ? 10 : 0,
        },
        tabBarIconStyle: { color: Colors["dark"].white },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Timer",
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
