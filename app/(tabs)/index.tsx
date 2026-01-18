import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <View style={styles.titleContainer}>
        <ThemedText type="title">Welcome to your new app!</ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
    paddingInline: 10,
  },
});
