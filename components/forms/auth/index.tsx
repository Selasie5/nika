import Form from "@/components/core/form";
import Input from "@/components/core/input";
import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import * as Yup from "yup";

const AuthForm = () => {
  const authValidationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = (values: { email: string; password: string }) => {
    console.log("Form submitted with values:", values);
  };
  return (
    <View style={styles.container}>
      <Form
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={authValidationSchema}
        onSubmit={handleSubmit}
        style={{ width: "100%" }}
      >
        {(formik) => (
          <View style={{ width: "100%" }}>
            <Input
              label="Your Email"
              placeholder="Enter your email"
              type="email"
              onChangeText={formik.handleChange("email")}
              onBlur={() => formik.handleBlur("email")}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <View style={{ marginTop: -16, marginBottom: 8 }}>
                <ThemedText type="captions" style={{ color: "red" }}>
                  {typeof formik.errors.email === "string"
                    ? formik.errors.email
                    : ""}
                </ThemedText>
              </View>
            ) : null}
            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              type="password"
              onChangeText={formik.handleChange("password")}
              onBlur={() => formik.handleBlur("password")}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <View style={{ marginTop: -16, marginBottom: 8 }}>
                <ThemedText type="captions" style={{ color: "red" }}>
                  {typeof formik.errors.password === "string"
                    ? formik.errors.password
                    : ""}
                </ThemedText>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => formik.handleSubmit()}
              style={{
                backgroundColor: "#cccccc",
                paddingVertical: 16,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <ThemedText type="subtitle" style={{ color: "#000000" }}>
                Login to your account
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </Form>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 8,
    paddingVertical: 20,

    width: "100%",
  },
});

export default AuthForm;
