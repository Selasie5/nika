import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        <View>
          <TouchableOpacity
            style={{ alignItems: "center", marginTop: 20 }}
            onPress={() => {
              router.push("/(tabs)/timeline/index");
            }}
          >
            <ThemedText type="captions" style={{ textAlign: "center" }}>
              Visit your timeline
            </ThemedText>
          </TouchableOpacity>
        </View>
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
