import { Manrope_400Regular } from "@expo-google-fonts/manrope";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCallback } from "react";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "auth",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontLoaded, fontLoadedError] = useFonts({
    PPEditorial: require("../assets/fonts/PPEditorialNew-Light.ttf"),
    Manrope_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontLoadedError]);

  if (!fontLoaded && !fontLoadedError) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          {/* <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> */}
        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
