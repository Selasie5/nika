import {
  Manrope_400Regular,
  Manrope_600SemiBold,
} from "@expo-google-fonts/manrope";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCallback, useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home" as any);
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to auth screen
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontLoaded, fontLoadedError] = useFonts({
    PPEditorial: require("../assets/fonts/PPEditorialNew-Light.ttf"),
    Manrope_400Regular,
    Manrope_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontLoadedError]);

  if (!fontLoaded && !fontLoadedError) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <RootLayoutNav />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
