import Form from "@/components/core/form";
import Input from "@/components/core/input";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth.context";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";

const AuthForm = () => {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const authValidationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = isSignUp
        ? await signUp(values.email, values.password)
        : await signIn(values.email, values.password);

      if (!result.success && result.error) {
        setAuthError(result.error.message);
      }
      router.push("../../(tabs)/home");
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

            {authError ? (
              <View style={{ marginBottom: 8 }}>
                <ThemedText type="captions" style={{ color: "red" }}>
                  {authError}
                </ThemedText>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => formik.handleSubmit()}
              disabled={isLoading}
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <ThemedText type="subtitle" style={{ color: "#000000" }}>
                  {isSignUp ? "Create your account" : "Sign in"}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              style={styles.toggleButton}
              disabled={isLoading}
            >
              <ThemedText type="captions" style={styles.toggleText}>
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
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
  submitButton: {
    backgroundColor: "#cccccc",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  toggleButton: {
    marginTop: 16,
    alignItems: "center",
  },
  toggleText: {
    color: "#888",
    textDecorationLine: "underline",
  },
});

export default AuthForm;
