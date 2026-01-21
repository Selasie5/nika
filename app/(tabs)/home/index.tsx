import { ThemedText } from "@/components/themed-text";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <View>
        <ThemedText type="title">
          One win is enough — it still counts
        </ThemedText>
        <ThemedText type="subtitle">
          Capture one small win each day. Over time, Nika helps you reflect on
          your progress.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default Home;
