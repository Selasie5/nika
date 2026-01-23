import { ThemedText } from "@/components/themed-text";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Timeline = () => {
  return (
    <SafeAreaView
      style={{
        flexDirection: "column",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 80,
      }}
    >
      <View>
        <ThemedText type="title">Your Wins</ThemedText>
        <ThemedText type="subtitle">
          A record of what went right, one day at a time.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default Timeline;
