import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Success = () => {
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={{ alignItems: "center", gap: 20 }}>
        <Text style={{ fontSize: 100 }}>🥇</Text>
        <ThemedText type="title" style={{ textAlign: "center" }}>
          That counted!
        </ThemedText>
        <ThemedText type="subtitle" style={{ textAlign: "center" }}>
          Small steps like this are how progress quietly adds up.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
export default Success;
