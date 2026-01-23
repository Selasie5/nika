import Form from "@/components/core/form";
import { ThemedText } from "@/components/themed-text";
import { db } from "@/config/firebase.config";
import { useAuth } from "@/context/auth.context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { FormikHelpers } from "formik";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const Home = () => {
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
      paddingHorizontal: 12,
      paddingVertical: 16,
      width: "100%",
      fontSize: 26,
      fontFamily: "Manrope_600SemiBold",
      fontWeight: "600",
      color: textColor,
      lineHeight: 36,
    },
  });
  const { user } = useAuth();
  const handleSubmit = async (
    values: { achievement: string },
    { resetForm }: FormikHelpers<{ achievement: string }>,
  ) => {
    setLoading(true);
    try {
      console.log("Submitting form with values:", values);
      console.log("Current user ID:", user?.uid);
      await addDoc(collection(db, "achievements"), {
        achievement: values.achievement,
        date: currentDate.toISOString(),
        userId: user?.uid,
      });
      console.log("Successfully saved:", {
        ...values,
        date: currentDate.toISOString(),
        userId: user?.uid,
      });
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
      router.push("/success");
    }
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
                placeholder="It can be small, it still counts"
                placeholderTextColor="#999999"
                style={[
                  style.input,
                  { textAlignVertical: "top", minHeight: 120, maxHeight: 300 },
                ]}
                value={formik.values.achievement}
                onChangeText={formik.handleChange("achievement")}
                onBlur={() => formik.handleBlur("achievement")}
                multiline
                scrollEnabled
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
                  {loading ? "|||" : "→"}
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
