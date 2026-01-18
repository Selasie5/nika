import AuthForm from "@/components/forms/auth";
import { ThemedText } from "@/components/themed-text";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <ThemedText type="title">
          One win is enough — it still counts
        </ThemedText>
        <ThemedText type="subtitle">
          Capture one small win each day. Over time, Nika helps you reflect on
          your progress.
        </ThemedText>
        <View style={{ width: "100%" }}>
          <AuthForm />
        </View>

        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <ThemedText type="captions" style={styles.orText}>
            OR
          </ThemedText>
          <View style={styles.orLine} />
        </View>

        <View style={styles.authButtonContainer}>
          <TouchableOpacity style={styles.authButton}>
            <Image
              source={require("../../assets/icons/google-icon.png")}
              style={{ width: 20, height: 20, marginRight: 10 }}
              resizeMode="contain"
            />
            <ThemedText type="link" style={{ color: "#ffffff" }}>
              Continue with Google
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authButton}>
            <Image
              source={require("../../assets/icons/apple-icon.png")}
              style={{ width: 20, height: 20, marginRight: 10 }}
              resizeMode="contain"
            />
            <ThemedText type="link" style={{ color: "#ffffff" }}>
              Continue with Apple
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText type="captions" style={{ textAlign: "center" }}>
            By continuing, you agree to Nika's Terms and acknowledge you have
            read our Privacy Policy.
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
  },
  mainContainer: {
    paddingHorizontal: 12,
    paddingTop: 80,
    flex: 1,
    backgroundColor: "transparent",
  },
  authButtonContainer: {
    width: "100%",
    gap: 20,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 16,
    color: "#888",
  },
  authButton: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#000000",
    borderRadius: 12,
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 20,
    width: "100%",
    alignItems: "center",
  },
});
