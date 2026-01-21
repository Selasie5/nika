import { ThemedText } from "@/components/themed-text";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const [text, setText] = useState("");
  const currentDate = new Date();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 80,
      }}
    >
      <View>
        <ThemedText type="subtitle">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </ThemedText>
        <View style={{ marginTop: 20 }}>
          <ThemedText type="title">
            What's one thing you achieved today ?
          </ThemedText>
        </View>
      </View>

      <View style={{ width: "100%" }}>
        <TextInput
          placeholder="It can be small , it still counts"
          placeholderTextColor="#999999"
          style={[
            style.input,
            text ? style.inputWithText : style.inputPlaceholder,
          ]}
          value={text}
          onChangeText={setText}
        />
      </View>

      <View style={{ width: "100%" }}>
        <TouchableOpacity>
          <ThemedText
            type="subtitle"
            style={{
              textAlign: "center",
              fontSize: 30,
              backgroundColor: "#000",
              color: "#fff",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 100,
              width: 80,
              height: 80,
              textAlignVertical: "center",
              alignSelf: "flex-end",
            }}
          >
            →
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const style = StyleSheet.create({
  input: {
    // borderBottomWidth: 1,
    // borderBottomColor: "#d6d5d5",
    paddingHorizontal: 12,
    paddingVertical: 16,
    width: "100%",
  },
  inputPlaceholder: {
    fontSize: 25,
    fontFamily: "Manrope_400Regular",
    fontWeight: "400",
  },
  inputWithText: {
    fontSize: 30,
    fontFamily: "Manrope_600SemiBold",
    fontWeight: "600",
  },
});
