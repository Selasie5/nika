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
        <ThemedText type="title">Heyyy 👋,</ThemedText>
        <ThemedText type="subtitle">
          Start capturing your wins and making progress today!
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default Home;
