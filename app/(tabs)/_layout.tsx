import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { History, Home, Sparkles } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 64,
          paddingBottom: 8,
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
        },
        tabBarActiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontFamily: "Manrope_600SemiBold",
          fontSize: 12,
        }
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline/index"
        options={{
          title: "Timeline",
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wraps/index"
        options={{
          title: "Wraps",
          tabBarIcon: ({ color }) => <Sparkles size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
