import Form from "@/components/core/form";
import { ThemedText } from "@/components/themed-text";
import { db } from "@/config/firebase.config";
import { useAuth } from "@/context/auth.context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import LoaderKitView from "react-native-loader-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const Home = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const currentDate = new Date();

  const validationSchema = Yup.object().shape({
    achievement: Yup.string()
      .min(1, "Achievement must be at least 1 character")
      .required("Achievement is required"),
  });

  const backgroundColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "background",
  );

  const buttonTextColor = useThemeColor(
    { light: "#ffffff", dark: "#000000" },
    "text",
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text",
  );

  const style = StyleSheet.create({
    input: {
      // borderBottomWidth: 1,
      // borderBottomColor: "#d6d5d5",
      // fontSize: 25,
      // fontFamily: "Manrope_400Regular",
      // fontWeight: "400",
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
      color: textColor,
    },
  });
  const { user } = useAuth();
  const handleSubmit = async (values: { achievement: string }) => {
    setLoading(true);
    await addDoc(collection(db, "achievements"), {
      achievement: values.achievement,
      date: currentDate.toISOString(),
      userId: user?.uid,
    });
    console.log({
      ...values,
      date: currentDate.toISOString(),
      userId: user?.uid,
    });
    setText("");
    setLoading(false);
  };

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
        <ThemedText type="subtitle">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </ThemedText>
        <View style={{ marginTop: 20 }}>
          <ThemedText type="title">
            What's one thing you achieved today ?
          </ThemedText>
        </View>
      </View>

      <Form
        initialValues={{
          achievement: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <View
            style={{
              flexDirection: "column",
              flex: 0,
              justifyContent: "space-between",
              alignContent: "flex-start",
              gap: 240,
              width: "100%",
            }}
          >
            <View style={{ width: "100%" }}>
              <TextInput
                placeholder="It can be small , it still counts"
                placeholderTextColor="#999999"
                style={[
                  style.input,
                  text ? style.inputWithText : style.inputPlaceholder,
                  { textAlignVertical: "top", minHeight: 100 },
                ]}
                value={text && formik.values.achievement}
                onChangeText={(value) => {
                  setText(value);
                  formik.handleChange("achievement")(value);
                }}
                onBlur={() => formik.handleBlur("achievement")}
                multiline={true}
                numberOfLines={4}
              />
              {formik.touched.achievement && formik.errors.achievement ? (
                <View style={{ marginTop: -16, marginBottom: 8 }}>
                  <ThemedText type="captions" style={{ color: "red" }}>
                    {typeof formik.errors.achievement === "string"
                      ? formik.errors.achievement
                      : ""}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity onPress={() => formik.handleSubmit()}>
                <ThemedText
                  type="subtitle"
                  style={{
                    textAlign: "center",
                    fontSize: 30,
                    backgroundColor: backgroundColor,
                    color: buttonTextColor,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    borderRadius: 100,
                    width: 80,
                    height: 80,
                    textAlignVertical: "center",
                    alignSelf: "flex-end",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {loading ? (
                    <LoaderKitView
                      style={{ width: 50, height: 50 }}
                      name={"LineScale"}
                      color={"white"}
                    />
                  ) : (
                    "→"
                  )}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Form>
    </SafeAreaView>
  );
};

export default Home;
