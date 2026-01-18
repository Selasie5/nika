import React from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return <Stack screenOptions={{ headerShown: false }} />;
}
